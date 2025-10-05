from __future__ import annotations
from typing import List, Dict, Any
import joblib
import os

FEATURE_COLUMNS: List[str] = [
    "koi_period",
    "koi_time0bk",
    "koi_impact",
    "koi_duration",
    "koi_depth",
    "koi_prad",
    "koi_teq",
    "koi_insol",
    "koi_model_snr",
    "koi_steff",
    "koi_slogg",
    "koi_srad",
    "ra",
    "dec",
    "koi_kepmag",
]

PLANET_TYPE_THRESHOLDS = [
    (0, 0.5, "Sub-Earth"),
    (0.5, 1.25, "Earth-sized"),
    (1.25, 2.0, "Super-Earth"),
    (2.0, 4.0, "Mini-Neptune"),
    (4.0, 6.0, "Neptune-like"),
    (6.0, 15.0, "Gas Giant"),
    (15.0, float("inf"), "Super-Jupiter"),
]

def classify_planet_type(radius_earth: float | None) -> str | None:
    if radius_earth is None:
        return None
    for low, high, label in PLANET_TYPE_THRESHOLDS:
        if low <= radius_earth < high:
            # Combine adjacent naming for 2-4 range per requirement example
            if label == "Super-Earth":
                return "Super-Earth / Mini-Neptune"
            return label
    return None


def load_artifact(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing artifact: {path}")
    return joblib.load(path)


def load_artifacts(artifacts_dir: str) -> Dict[str, Any]:
    return {
        "model": load_artifact(os.path.join(artifacts_dir, "exoplanet_model.joblib")),
        "imputer": load_artifact(os.path.join(artifacts_dir, "imputer.joblib")),
        "scaler": load_artifact(os.path.join(artifacts_dir, "scaler.joblib")),
        "feature_columns": load_artifact(os.path.join(artifacts_dir, "feature_columns.joblib")),
    }
