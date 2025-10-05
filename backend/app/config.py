import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'exoplanet-research-secret-key-2024'
    MONGODB_URL = os.environ.get('MONGODB_URL') or 'mongodb://localhost:27017/exoplanet_research'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-for-exoplanet-platform'
    JWT_ACCESS_TOKEN_EXPIRES_IN = 24 * 60 * 60  # 24 hours in seconds
    
    # External ML API configuration
    ML_API_URL = os.environ.get('ML_API_URL') or 'https://your-ml-api.com/predict'
    ML_API_TIMEOUT = int(os.environ.get('ML_API_TIMEOUT', 30))  # seconds
    ML_API_KEY = os.environ.get('ML_API_KEY')  # Optional API key for authentication
    USE_FALLBACK_PREDICTIONS = os.environ.get('USE_FALLBACK_PREDICTIONS', 'False').lower() == 'true'