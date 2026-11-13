# SmartAir Model Documentation

This document describes the exact machine learning methodology reproduced from `SmartAir_Corrected (2).ipynb`.

---

## 1. Problem Formulation

- **Task:** Supervised Regression for Next-Day Air Quality Index (AQI) forecasting.
- **Input:** $X \in \mathbb{R}^{7 \times 91}$, representing 7 consecutive daily observations of 91 features.
- **Output:** $\hat{y} \in \mathbb{R}^+$, representing the predicted AQI on day 8.
- **Evaluation Metric:** Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), and Coefficient of Determination ($R^2$).

---

## 2. Feature Specification (91 Features per Day)

1. **Selected Pollutants (11 features):**
   - Filtered by missingness $< 60\%$ in training split:
   - `['PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene']`
   - *Note:* `Xylene` was excluded due to $77.06\%$ missing values in training.

2. **Target Lag Feature (1 feature):**
   - `AQI` observed on that historical day.

3. **Deterministic Cyclical Calendar Features (4 features):**
   - $\text{Day\_Sin} = \sin(2\pi \cdot \text{DayOfYear} / 365.25)$
   - $\text{Day\_Cos} = \cos(2\pi \cdot \text{DayOfYear} / 365.25)$
   - $\text{Month\_Sin} = \sin(2\pi \cdot \text{Month} / 12.0)$
   - $\text{Month\_Cos} = \cos(2\pi \cdot \text{Month} / 12.0)$

4. **Station Spatial Indicators (75 features):**
   - One-hot binary indicator for 75 stations present during training. Unknown stations receive an all-zero vector.

**Total Input Tensor Shape:** $(B, 7, 91) \implies \text{Flattened to } (B, 637)$.

---

## 3. Neural Network Architecture

```text
Input (shape: [7, 91])
  │
Flatten (output: 637)
  │
Dense(128, activation='relu', kernel_initializer='glorot_uniform')
  │
Dropout(rate=0.2)
  │
Dense(64, activation='relu', kernel_initializer='glorot_uniform')
  │
Dropout(rate=0.2)
  │
Dense(1, activation='linear')
```

---

## 4. Hyperparameter Ablation Study Results

Controlled experiments from the technical study:

| Model Config | Architecture | Activation | Optimizer | Learning Rate | Dropout | Val RMSE | Val MAE | Val R² |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **LearningRate_0001 (Selected)** | **(128, 64)** | **relu** | **adam** | **0.0001** | **0.2** | **48.81** | **31.22** | **0.8722** |
| Baseline | (128, 64) | relu | adam | 0.0010 | 0.2 | 49.32 | 30.20 | 0.8695 |
| Dropout_040 | (128, 64) | relu | adam | 0.0010 | 0.4 | 49.51 | 30.25 | 0.8685 |
| BatchSize_64 | (128, 64) | relu | adam | 0.0010 | 0.2 | 49.94 | 30.86 | 0.8662 |
| Architecture_256_128 | (256, 128) | relu | adam | 0.0010 | 0.2 | 50.07 | 31.35 | 0.8655 |
| Optimizer_RMSprop | (128, 64) | relu | rmsprop | 0.0010 | 0.2 | 50.22 | 31.86 | 0.8647 |
| Activation_Tanh | (128, 64) | tanh | adam | 0.0010 | 0.2 | 51.66 | 31.47 | 0.8568 |
| BatchNorm_On | (128, 64) | relu | adam | 0.0010 | 0.2 | 52.80 | 30.97 | 0.8504 |

---

## 5. Held-Out Test Evaluation

Tested on 26,137 samples:

| Model | MAE | MSE | RMSE | R² Score |
| :--- | :--- | :--- | :--- | :--- |
| **Naive Persistence Baseline** | 28.56 | 2251.98 | 47.45 | 0.8356 |
| **SmartAir ANN Model** | **27.44** | **1609.12** | **40.11** | **0.8826** |

**Empirical Result:** SmartAir ANN delivers a **15.47% RMSE improvement** over the naive persistence baseline.

