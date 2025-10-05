#!/bin/bash

echo "🚀 Setting up Exoplanet Research Platform Backend"
echo "================================================"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

# Create virtual environment (optional but recommended)
echo "🔧 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if MongoDB is running (for local development)
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping').ok" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running or not accessible"
        echo "   For local development, please start MongoDB:"
        echo "   - Ubuntu/Debian: sudo systemctl start mongod"
        echo "   - macOS (Homebrew): brew services start mongodb-community"
        echo "   - Or use MongoDB Atlas for cloud database"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping').ok" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running or not accessible"
    fi
else
    echo "⚠️  MongoDB client not found"
    echo "   Please ensure MongoDB is installed and running"
fi

echo ""
echo "🌌 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Activate virtual environment: source venv/bin/activate"
echo "   2. Start the API server: python run.py"
echo "   3. Test the API: python test_api.py"
echo "   4. API will be available at: http://127.0.0.1:8000/api/v1"
echo ""
echo "🔧 Configuration:"
echo "   - Edit .env file to customize settings"
echo "   - Update MONGODB_URL for different database"
echo "   - Change JWT_SECRET_KEY for production"