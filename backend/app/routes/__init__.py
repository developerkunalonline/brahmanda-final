# Routes package
from .auth import auth_bp
from .predictions import predictions_bp

__all__ = ['auth_bp', 'predictions_bp']