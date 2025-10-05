from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all origins
    CORS(app, origins="*", supports_credentials=True)
    
    # Initialize database connection
    init_db(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.predictions import predictions_bp
    from app.routes.datasets import datasets_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(predictions_bp, url_prefix='/api/v1/predictions')
    app.register_blueprint(datasets_bp, url_prefix='/api/v1/datasets')
    
    return app