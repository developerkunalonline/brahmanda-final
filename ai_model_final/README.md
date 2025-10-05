# Exoplanet Prediction Service

High-accuracy ML service to classify Kepler Objects of Interest (KOIs) as real exoplanets (CONFIRMED) vs FALSE POSITIVE using an XGBoost classifier and a robust preprocessing pipeline.

## 1. Overview
We train on the curated NASA `Exoplanet 2.csv` dataset (~9.5K rows) using only physically meaningful numeric features:
```
koi_period, koi_time0bk, koi_impact, koi_duration, koi_depth, koi_prad,
koi_teq, koi_insol, koi_model_snr, koi_steff, koi_slogg, koi_srad,
ra, dec, koi_kepmag
```
We exclude `CANDIDATE` rows (ambiguous) and map:
- CONFIRMED -> 1
- FALSE POSITIVE -> 0

Artifacts saved after training:
- `artifacts/exoplanet_model.joblib`
- `artifacts/imputer.joblib`
- `artifacts/scaler.joblib`
- `artifacts/feature_columns.joblib`

## 2. Environment Setup
Install dependencies:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Training
Place the NASA dataset CSV (rename or reference path) and run:
```bash
python train_model.py --data "data/NASA Exoplanet 2.csv" --artifacts artifacts
```
Outputs metrics, then writes artifacts.

## 4. Quick Artifact Sanity Test
```bash
python test_prediction.py
```
(Uses a dummy row; probability is not meaningful—just tests pipeline wiring.)

## 5. Running the API
```bash
export ARTIFACTS_DIR=artifacts  # optional if using default
python app.py
```
Server starts on `http://0.0.0.0:5000`.

Health check:
```bash
curl http://localhost:5000/health
```

### 5.1 Predict Endpoint
POST JSON to `/predict` supplying all feature fields (order not important) plus an identifier:
```json
{
  "customIdentifier": "MyScope_Candidate_XYZ",
  "koi_period": 35.5,
  "koi_time0bk": 135.6,
  "koi_impact": 0.6,
  "koi_duration": 7.3,
  "koi_depth": 1550.2,
  "koi_prad": 2.24,
  "koi_teq": 793,
  "koi_insol": 250.5,
  "koi_model_snr": 12.7,
  "koi_steff": 5400,
  "koi_slogg": 4.3,
  "koi_srad": 0.9,
  "ra": 290.12,
  "dec": 44.21,
  "koi_kepmag": 14.5
}
```
Curl example:
```bash
curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" \
  -d @request.json
```

### 5.2 Response Format
```json
{
  "candidateIdentifier": "MyScope_Candidate_XYZ",
  "isExoplanet": true,
  "confidence": 0.9985,
  "details": {
    "planetName": null,
    "planetType": "Super-Earth / Mini-Neptune",
    "radiusEarth": 2.24,
    "orbitalPeriodDays": 35.5,
    "equilibriumTempKelvin": 793
  }
}
```
Confidence reflects the predicted class probability (p for positive, 1-p for negative).

## 6. Planet Type Logic
Defined in `src/utils.py` using radius (Earth radii) buckets with a combined label for 1.25–4.0R⊕ range per requirement sample.

## 7. Project Structure
```
├── app.py
├── train_model.py
├── test_prediction.py
├── requirements.txt
├── src/
│   ├── __init__.py
│   └── utils.py
├── artifacts/        # (created after training)
├── data/             # place dataset here
└── README.md
```

## 8. Extending / Next Steps
- Add automated tests with real sampled rows.
- Hyperparameter tuning via Optuna or GridSearchCV.
- Add SHAP value explanation endpoint for interpretability.
- Input validation schema (e.g., Pydantic / Marshmallow) and richer error messages.
- Dockerfile for containerized deployment.
- Authentication (API keys) for production usage.

## 9. Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| KeyError on feature | Missing field in JSON | Provide all 15 feature keys |
| ValueError: cannot convert | Non-numeric input | Send numeric types only |
| 500 error on /predict | Missing artifacts | Run training first |

## 10. License
Internal / research use example. Add a proper license if distributing.
