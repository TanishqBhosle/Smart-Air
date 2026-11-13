"""Full training and evaluation pipeline for SmartAir AQI Forecasting.
Faithfully reproduces the methodology from SmartAir_Corrected (2).ipynb.
"""

import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import json
import random
import time
from datetime import datetime
import joblib
import numpy as np
import pandas as pd

# Set Keras backend to torch for robust Windows execution without DLL blocks
os.environ["KERAS_BACKEND"] = "torch"
import keras
from keras import Sequential
from keras.layers import Input, Flatten, Dense, Dropout, BatchNormalization
from keras.callbacks import EarlyStopping, ReduceLROnPlateau

from sklearn.preprocessing import StandardScaler

from model.training.config import (
    RAW_DATA_PATH,
    ARTIFACTS_DIR,
    SEED,
    BEST_MODEL_CONFIG,
    LOOKBACK_DAYS,
    TARGET_COLUMN,
    DATASET_HANDLE
)
from model.training.preprocess import (
    load_raw_dataset,
    clean_dataset,
    compute_calendar_features,
    compute_date_splits,
    fit_preprocessing_pipeline,
    transform_features,
    build_consecutive_sequences,
)
from model.training.evaluate import (
    regression_metrics,
    compute_band_breakdown,
)

# Seed for reproducibility
random.seed(SEED)
np.random.seed(SEED)
keras.utils.set_random_seed(SEED)


def build_ann(
    input_shape,
    units=(128, 64),
    activation="relu",
    dropout=0.2,
    learning_rate=0.0001,
    optimizer_name="adam",
    batch_norm=False
):
    """Build Feed-forward Artificial Neural Network (MLP) matching notebook Cell 22."""
    model = Sequential()
    model.add(Input(shape=input_shape))
    model.add(Flatten())

    for n_units in units:
        model.add(Dense(
            n_units,
            activation=activation,
            kernel_initializer="glorot_uniform"
        ))
        if batch_norm:
            model.add(BatchNormalization())
        if dropout > 0:
            model.add(Dropout(dropout))

    model.add(Dense(1, activation="linear", kernel_initializer="glorot_uniform"))

    opt_key = optimizer_name.lower()
    if opt_key == "adam":
        optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
    elif opt_key == "rmsprop":
        optimizer = keras.optimizers.RMSprop(learning_rate=learning_rate)
    elif opt_key == "sgd":
        optimizer = keras.optimizers.SGD(learning_rate=learning_rate, momentum=0.9)
    else:
        raise ValueError(f"Unsupported optimizer: {optimizer_name}")

    model.compile(optimizer=optimizer, loss="mse", metrics=["mae"])
    return model


def run_training_pipeline(epochs: int = 100, batch_size: int = 32):
    """Execute complete data loading, preprocessing, model training, evaluation, and artifact export."""
    start_time = time.time()
    print("=" * 70)
    print("SMARTAIR — PRODUCTION MODEL TRAINING PIPELINE")
    print("=" * 70)

    # 1. Load dataset
    print(f"\n[1/7] Loading dataset from: {RAW_DATA_PATH}")
    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(f"Raw data file not found at {RAW_DATA_PATH}")
    
    raw_df = load_raw_dataset(str(RAW_DATA_PATH))
    print(f"Loaded raw records: {len(raw_df):,}, columns: {list(raw_df.columns)}")

    # 2. Clean dataset
    print("\n[2/7] Cleaning dataset (handling missing values, invalid AQI, deduplicating)...")
    cleaned_df = clean_dataset(raw_df)
    cleaned_df = compute_calendar_features(cleaned_df)
    print(f"Cleaned valid records: {len(cleaned_df):,}")
    print(f"Unique monitoring stations: {cleaned_df['StationId'].nunique()}")
    print(f"Date range: {cleaned_df['Date'].min().date()} to {cleaned_df['Date'].max().date()}")

    # 3. Chronological splits
    print("\n[3/7] Establishing chronological train/validation/test date boundaries...")
    train_end_date, val_end_date, test_end_date = compute_date_splits(cleaned_df)
    print(f"  Training period:   through {train_end_date.date()}")
    print(f"  Validation period: {train_end_date.date()} to {val_end_date.date()}")
    print(f"  Test period:       after {val_end_date.date()} to {test_end_date.date()}")

    # 4. Preprocessing fitting on training data ONLY
    print("\n[4/7] Fitting imputer, scaler, and station encoding on training data ONLY...")
    prep = fit_preprocessing_pipeline(cleaned_df, train_end_date)
    print(f"  Selected pollutants ({len(prep['selected_pollutants'])}): {prep['selected_pollutants']}")
    print(f"  Excluded pollutants: {prep['excluded_pollutants']}")
    print(f"  Numeric features ({len(prep['numeric_features'])}): {prep['numeric_features']}")
    print(f"  Training stations encoded: {len(prep['train_stations'])}")
    print(f"  Total input features per day: {len(prep['feature_names'])}")

    feature_matrix = transform_features(cleaned_df, prep)
    print(f"  Transformed feature matrix: {feature_matrix.shape}")

    # 5. Build 7-day sequences
    print(f"\n[5/7] Constructing {LOOKBACK_DAYS}-day consecutive sequences partitioned by target date...")
    seq_data = build_consecutive_sequences(
        cleaned_df,
        feature_matrix,
        train_end_date,
        val_end_date,
        lookback=LOOKBACK_DAYS
    )

    X_train, y_train = seq_data["X_train"], seq_data["y_train"]
    X_val, y_val = seq_data["X_val"], seq_data["y_val"]
    X_test, y_test = seq_data["X_test"], seq_data["y_test"]
    persistence_test = seq_data["persistence_test"]

    print(f"  Train sequences:      {X_train.shape[0]:,} samples {X_train.shape}")
    print(f"  Validation sequences: {X_val.shape[0]:,} samples {X_val.shape}")
    print(f"  Test sequences:       {X_test.shape[0]:,} samples {X_test.shape}")

    # Target scaling using training targets ONLY
    target_scaler = StandardScaler()
    y_train_scaled = target_scaler.fit_transform(y_train.reshape(-1, 1)).ravel()
    y_val_scaled = target_scaler.transform(y_val.reshape(-1, 1)).ravel()
    y_test_scaled = target_scaler.transform(y_test.reshape(-1, 1)).ravel()
    print(f"  Target mean: {float(target_scaler.mean_[0]):.2f}, std: {float(target_scaler.scale_[0]):.2f}")

    # 6. Build and Train Model
    print("\n[6/7] Building and training the Best ANN Model (LearningRate_0001)...")
    config = BEST_MODEL_CONFIG
    model = build_ann(
        input_shape=X_train.shape[1:],
        units=config["units"],
        activation=config["activation"],
        dropout=config["dropout"],
        learning_rate=config["learning_rate"],
        optimizer_name=config["optimizer"],
        batch_norm=config["batch_norm"]
    )
    model.summary()

    callbacks = [
        EarlyStopping(
            monitor="val_loss",
            patience=config["patience"],
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=config["reduce_lr_factor"],
            patience=config["reduce_lr_patience"],
            min_lr=config["min_lr"],
            verbose=1
        )
    ]

    history = model.fit(
        X_train, y_train_scaled,
        validation_data=(X_val, y_val_scaled),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )

    # 7. Evaluate
    print("\n[7/7] Evaluating model on validation and held-out test sets...")
    # Validation evaluation
    val_pred_scaled = model.predict(X_val, verbose=0)
    val_preds = target_scaler.inverse_transform(val_pred_scaled).ravel()
    val_metrics = regression_metrics(y_val, val_preds)
    print(f"  Validation Metrics: RMSE={val_metrics['RMSE']:.2f}, MAE={val_metrics['MAE']:.2f}, R2={val_metrics['R2']:.4f}")

    # Test evaluation
    test_pred_scaled = model.predict(X_test, verbose=0)
    test_preds = target_scaler.inverse_transform(test_pred_scaled).ravel()
    test_metrics = regression_metrics(y_test, test_preds)
    persistence_metrics = regression_metrics(y_test, persistence_test)

    improvement_pct = ((persistence_metrics["RMSE"] - test_metrics["RMSE"]) / persistence_metrics["RMSE"]) * 100
    print(f"  Test Metrics (ANN):         RMSE={test_metrics['RMSE']:.2f}, MAE={test_metrics['MAE']:.2f}, R2={test_metrics['R2']:.4f}")
    print(f"  Test Metrics (Persistence): RMSE={persistence_metrics['RMSE']:.2f}, MAE={persistence_metrics['MAE']:.2f}, R2={persistence_metrics['R2']:.4f}")
    print(f"  ANN RMSE Improvement:       {improvement_pct:.2f}%")

    # Error breakdown by AQI band
    band_breakdown = compute_band_breakdown(y_test, test_preds)

    # Controlled experiments recorded in notebook
    notebook_experiments = [
        {"Model": "LearningRate_0001", "Architecture": "(128, 64)", "Activation": "relu", "Optimizer": "adam", "Learning Rate": 0.0001, "Dropout": 0.2, "Batch Normalization": False, "Batch Size": 32, "Epochs Trained": 39, "Validation MAE": 31.22, "Validation MSE": 2381.97, "Validation RMSE": 48.81, "Validation R2": 0.8722},
        {"Model": "Baseline", "Architecture": "(128, 64)", "Activation": "relu", "Optimizer": "adam", "Learning Rate": 0.001, "Dropout": 0.2, "Batch Normalization": False, "Batch Size": 32, "Epochs Trained": 18, "Validation MAE": 30.20, "Validation MSE": 2432.34, "Validation RMSE": 49.32, "Validation R2": 0.8695},
        {"Model": "Dropout_040", "Architecture": "(128, 64)", "Activation": "relu", "Optimizer": "adam", "Learning Rate": 0.001, "Dropout": 0.4, "Batch Normalization": False, "Batch Size": 32, "Epochs Trained": 24, "Validation MAE": 30.25, "Validation MSE": 2450.94, "Validation RMSE": 49.51, "Validation R2": 0.8685},
        {"Model": "BatchSize_64", "Architecture": "(128, 64)", "Activation": "relu", "Optimizer": "adam", "Learning Rate": 0.001, "Dropout": 0.2, "Batch Normalization": False, "Batch Size": 64, "Epochs Trained": 33, "Validation MAE": 30.86, "Validation MSE": 2494.16, "Validation RMSE": 49.94, "Validation R2": 0.8662},
        {"Model": "Architecture_256_128", "Architecture": "(256, 128)", "Activation": "relu", "Optimizer": "adam", "Learning Rate": 0.001, "Dropout": 0.2, "Batch Normalization": False, "Batch Size": 32, "Epochs Trained": 18, "Validation MAE": 31.35, "Validation MSE": 2506.75, "Validation RMSE": 50.07, "Validation R2": 0.8655},
        {"Model": "Optimizer_RMSprop", "Architecture": "(128, 64)", "Activation": "relu", "Optimizer": "rmsprop", "Learning Rate": 0.001, "Dropout": 0.2, "Batch Normalization": False, "Batch Size": 32, "Epochs Trained": 18, "Validation MAE": 31.86, "Validation MSE": 2521.72, "Validation RMSE": 50.22, "Validation R2": 0.8647},
        {"Model": "Activation_Tanh", "Architecture": "(128, 64)", "Activation": "tanh", "Optimizer": "adam", "Learning Rate": 0.001, "Dropout": 0.2, "Batch Normalization": False, "Batch Size": 32, "Epochs Trained": 88, "Validation MAE": 31.47, "Validation MSE": 2668.71, "Validation RMSE": 51.66, "Validation R2": 0.8568},
        {"Model": "BatchNorm_On", "Architecture": "(128, 64)", "Activation": "relu", "Optimizer": "adam", "Learning Rate": 0.001, "Dropout": 0.2, "Batch Normalization": True, "Batch Size": 32, "Epochs Trained": 26, "Validation MAE": 30.97, "Validation MSE": 2788.18, "Validation RMSE": 52.80, "Validation R2": 0.8504},
    ]

    # Save artifacts
    print(f"\nSaving artifacts to {ARTIFACTS_DIR}...")
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Model
    model_path = ARTIFACTS_DIR / "model.keras"
    model.save(str(model_path))

    # 2. Imputer
    joblib.dump(prep["imputer"], ARTIFACTS_DIR / "imputer.joblib")

    # 3. Feature scaler
    joblib.dump(prep["scaler"], ARTIFACTS_DIR / "feature_scaler.joblib")

    # 4. Target scaler
    joblib.dump(target_scaler, ARTIFACTS_DIR / "target_scaler.joblib")

    # 5. Station encoder
    station_encoder_data = {
        "train_stations": prep["train_stations"],
        "station_to_index": prep["station_to_index"]
    }
    joblib.dump(station_encoder_data, ARTIFACTS_DIR / "station_encoder.joblib")

    # 6. Metadata JSON
    metadata = {
        "model_version": "1.0.0",
        "model_name": "SmartAir ANN (LearningRate_0001)",
        "framework": "Keras 3 (Torch Backend)",
        "training_timestamp": datetime.utcnow().isoformat(),
        "training_duration_seconds": round(time.time() - start_time, 2),
        "dataset": {
            "name": DATASET_HANDLE,
            "raw_records": len(raw_df),
            "cleaned_records": len(cleaned_df),
            "total_stations": int(cleaned_df["StationId"].nunique()),
            "training_stations": len(prep["train_stations"]),
            "date_range": {
                "start": str(cleaned_df["Date"].min().date()),
                "end": str(cleaned_df["Date"].max().date())
            }
        },
        "target": {
            "column": TARGET_COLUMN,
            "scaling": "StandardScaler",
            "mean": float(target_scaler.mean_[0]),
            "scale": float(target_scaler.scale_[0])
        },
        "features": {
            "lookback_days": LOOKBACK_DAYS,
            "selected_pollutants": prep["selected_pollutants"],
            "excluded_pollutants": prep["excluded_pollutants"],
            "numeric_features": prep["numeric_features"],
            "total_daily_features": len(prep["feature_names"]),
            "total_flattened_input": len(prep["feature_names"]) * LOOKBACK_DAYS,
            "feature_names": prep["feature_names"]
        },
        "architecture": {
            "type": "Feedforward Artificial Neural Network (MLP)",
            "layers": [
                {"type": "Input", "shape": [LOOKBACK_DAYS, len(prep["feature_names"])]},
                {"type": "Flatten", "output_shape": [LOOKBACK_DAYS * len(prep["feature_names"])]},
                {"type": "Dense", "units": 128, "activation": "relu"},
                {"type": "Dropout", "rate": 0.2},
                {"type": "Dense", "units": 64, "activation": "relu"},
                {"type": "Dropout", "rate": 0.2},
                {"type": "Dense", "units": 1, "activation": "linear"}
            ],
            "optimizer": "adam",
            "learning_rate": config["learning_rate"],
            "loss": "mse",
            "batch_size": batch_size,
            "epochs_trained": len(history.history["loss"])
        },
        "splits": {
            "train_end_date": str(train_end_date.date()),
            "val_end_date": str(val_end_date.date()),
            "test_end_date": str(test_end_date.date()),
            "train_samples": int(len(y_train)),
            "val_samples": int(len(y_val)),
            "test_samples": int(len(y_test))
        },
        "metrics": {
            "validation": val_metrics,
            "test_ann": test_metrics,
            "test_persistence": persistence_metrics,
            "rmse_improvement_percent": round(improvement_pct, 2)
        },
        "training_history": {
            "loss": [float(x) for x in history.history["loss"]],
            "val_loss": [float(x) for x in history.history["val_loss"]],
            "mae": [float(x) for x in history.history.get("mae", [])],
            "val_mae": [float(x) for x in history.history.get("val_mae", [])]
        }
    }

    with open(ARTIFACTS_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    with open(ARTIFACTS_DIR / "validation_experiments.json", "w") as f:
        json.dump(notebook_experiments, f, indent=2)

    with open(ARTIFACTS_DIR / "error_breakdown.json", "w") as f:
        json.dump(band_breakdown.to_dict(orient="records"), f, indent=2)

    print("\nTraining completed successfully!")
    print(f"Artifacts saved in: {ARTIFACTS_DIR}")
    return metadata


if __name__ == "__main__":
    run_training_pipeline()
