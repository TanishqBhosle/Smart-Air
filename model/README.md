# SmartAir Machine Learning Pipeline

End-to-end training and inference pipeline reproducing `SmartAir_Corrected (2).ipynb`.

## Structure
- `training/config.py`: Architecture, hyperparameters, and feature settings.
- `training/preprocess.py`: Leakage-free chronological splits, feature scaling, 7-day sequences.
- `training/train.py`: Full model training script.
- `training/evaluate.py`: Regression metrics, persistence comparison, AQI band breakdown.
- `inference/feature_builder.py`: 7-day validation and input tensor preparation.
- `inference/predictor.py`: Inference service loading artifacts and generating predictions.
- `artifacts/`: Exported model and preprocessing binaries.

## Training the Model

```bash
cd model
pip install -r requirements.txt
python -m model.training.train
```

