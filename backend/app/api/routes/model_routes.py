"""Model metadata, metrics, and hyperparameter experiments endpoints.
"""

import json
from fastapi import APIRouter, HTTPException
from backend.app.core.config import settings

router = APIRouter()


@router.get("/model/info")
def get_model_info():
    """Return model architecture, training configuration, and dataset metadata."""
    meta_path = settings.ARTIFACTS_DIR / "metadata.json"
    if not meta_path.exists():
        raise HTTPException(status_code=503, detail="Model metadata not yet generated. Complete training first.")
    with open(meta_path, "r") as f:
        return json.load(f)


@router.get("/model/metrics")
def get_model_metrics():
    """Return validation and held-out test evaluation metrics."""
    meta_path = settings.ARTIFACTS_DIR / "metadata.json"
    if not meta_path.exists():
        raise HTTPException(status_code=503, detail="Model metrics not yet available.")
    with open(meta_path, "r") as f:
        meta = json.load(f)
    return {
        "model_version": meta.get("model_version"),
        "model_name": meta.get("model_name"),
        "metrics": meta.get("metrics"),
        "training_history": meta.get("training_history")
    }


@router.get("/model/experiments")
def get_model_experiments():
    """Return controlled hyperparameter experiment comparisons from the technical study."""
    exp_path = settings.ARTIFACTS_DIR / "validation_experiments.json"
    if not exp_path.exists():
        raise HTTPException(status_code=503, detail="Validation experiments not yet available.")
    with open(exp_path, "r") as f:
        return json.load(f)


@router.get("/model/error-breakdown")
def get_error_breakdown():
    """Return error breakdown by Indian AQI category band."""
    eb_path = settings.ARTIFACTS_DIR / "error_breakdown.json"
    if not eb_path.exists():
        raise HTTPException(status_code=503, detail="Error breakdown not yet available.")
    with open(eb_path, "r") as f:
        return json.load(f)
