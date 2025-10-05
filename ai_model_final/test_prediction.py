import os
import pandas as pd
from src.utils import load_artifacts

ARTIFACTS_DIR = 'artifacts'

def main():
    artifacts = load_artifacts(ARTIFACTS_DIR)
    model = artifacts['model']
    imputer = artifacts['imputer']
    scaler = artifacts['scaler']
    feature_columns = artifacts['feature_columns']

    # Build a dummy row with None -> will be imputed (not ideal for real use but tests pipeline)
    dummy = {c: None for c in feature_columns}
    df = pd.DataFrame([dummy], columns=feature_columns)
    X_imp = imputer.transform(df)
    X_scaled = scaler.transform(X_imp)
    proba = model.predict_proba(X_scaled)[0, 1]
    print({"raw_probability_exoplanet": float(proba)})

if __name__ == '__main__':
    if not os.path.exists(ARTIFACTS_DIR):
        print("Artifacts directory not found. Run training first.")
    else:
        main()
