from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Starting Exoplanet Research Platform API on port {port}")
    print(f"🌌 Debug mode: {debug}")
    print(f"🔗 API Base URL: http://127.0.0.1:{port}/api/v1")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )