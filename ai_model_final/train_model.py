import os
import argparse
import joblib
import pandas as pd
from typing import Tuple
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from xgboost import XGBClassifier

from src.utils import FEATURE_COLUMNS


def load_and_filter_dataset(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    if 'koi_disposition' not in df.columns:
        raise ValueError("Dataset must contain 'koi_disposition' column")
    # Filter only CONFIRMED and FALSE POSITIVE
    df = df[df['koi_disposition'].isin(['CONFIRMED', 'FALSE POSITIVE'])].copy()
    # Map target
    df['target'] = df['koi_disposition'].map({'CONFIRMED': 1, 'FALSE POSITIVE': 0})
    return df


def build_datasets(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
    X = df[FEATURE_COLUMNS].copy()
    y = df['target']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    return X_train, X_test, y_train, y_test


def preprocess_and_train(X_train: pd.DataFrame, X_test: pd.DataFrame, y_train, y_test, artifacts_dir: str):
    imputer = SimpleImputer(strategy='median')
    scaler = StandardScaler()

    X_train_imputed = imputer.fit_transform(X_train)
    X_test_imputed = imputer.transform(X_test)

    X_train_scaled = scaler.fit_transform(X_train_imputed)
    X_test_scaled = scaler.transform(X_test_imputed)

    model = XGBClassifier(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric='logloss',
        random_state=42,
        n_jobs=-1,
        reg_lambda=1.0,
    )

    model.fit(X_train_scaled, y_train)

    proba = model.predict_proba(X_test_scaled)[:, 1]
    preds = (proba >= 0.5).astype(int)
    print("Classification Report:\n", classification_report(y_test, preds, digits=4))
    try:
        auc = roc_auc_score(y_test, proba)
        print(f"ROC AUC: {auc:.4f}")
    except ValueError:
        print("ROC AUC could not be computed (only one class present in y_test).")
    print("Confusion Matrix:\n", confusion_matrix(y_test, preds))

    os.makedirs(artifacts_dir, exist_ok=True)
    joblib.dump(model, os.path.join(artifacts_dir, 'exoplanet_model.joblib'))
    joblib.dump(imputer, os.path.join(artifacts_dir, 'imputer.joblib'))
    joblib.dump(scaler, os.path.join(artifacts_dir, 'scaler.joblib'))
    joblib.dump(FEATURE_COLUMNS, os.path.join(artifacts_dir, 'feature_columns.joblib'))
    print(f"Artifacts saved to {artifacts_dir}")


def parse_args():
    parser = argparse.ArgumentParser(description='Train Exoplanet Classifier')
    parser.add_argument('--data', type=str, required=True, help='Path to NASA Exoplanet 2.csv dataset')
    parser.add_argument('--artifacts', type=str, default='artifacts', help='Directory to save artifacts')
    return parser.parse_args()


def main():
    args = parse_args()
    df = load_and_filter_dataset(args.data)
    X_train, X_test, y_train, y_test = build_datasets(df)
    preprocess_and_train(X_train, X_test, y_train, y_test, args.artifacts)


if __name__ == '__main__':
    main()
