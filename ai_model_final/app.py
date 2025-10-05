import os
import traceback
from flask import Flask, request, jsonify
import pandas as pd
import joblib
from src.utils import classify_planet_type, load_artifacts

ARTIFACTS_DIR = os.environ.get("ARTIFACTS_DIR", "artifacts")

app = Flask(__name__)

# Lazy load artifacts on first request
after_first_load = {"loaded": False, "objects": None}


def get_artifacts():
    if not after_first_load["loaded"]:
        after_first_load["objects"] = load_artifacts(ARTIFACTS_DIR)
        after_first_load["loaded"] = True
    return after_first_load["objects"]


@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}


@app.route('/predict', methods=['POST'])
def predict():
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Empty JSON payload"}), 400

        custom_identifier = payload.get("customIdentifier") or payload.get("candidateIdentifier")

        artifacts = get_artifacts()
        model = artifacts['model']
        imputer = artifacts['imputer']
        scaler = artifacts['scaler']
        feature_columns = artifacts['feature_columns']

        # Build single-row DataFrame preserving order
        row = {col: payload.get(col, None) for col in feature_columns}
        df = pd.DataFrame([row], columns=feature_columns)

        # Impute & scale
        X_imputed = imputer.transform(df)
        X_scaled = scaler.transform(X_imputed)

        proba = model.predict_proba(X_scaled)[0, 1]
        pred = int(proba >= 0.5)

        # Derive details
        radius_earth = row.get('koi_prad')
        planet_type = classify_planet_type(radius_earth)
        teq = row.get('koi_teq')
        period = row.get('koi_period')

        response = {
            "candidateIdentifier": custom_identifier,
            "isExoplanet": bool(pred),
            "confidence": round(float(proba if pred == 1 else 1 - proba), 6),
            "details": {
                "planetName": None,  # placeholder (could be filled if naming logic added)
                "planetType": planet_type,
                "radiusEarth": radius_earth,
                "orbitalPeriodDays": period,
                "equilibriumTempKelvin": teq,
            }
        }
        return jsonify(response)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
