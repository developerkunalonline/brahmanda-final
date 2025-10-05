from pymongo import MongoClient
from flask import current_app

# Global variable to store the database instance
db = None
mongo_client = None

def init_db(app):
    """Initialize MongoDB connection"""
    global db, mongo_client
    
    try:
        mongodb_url = app.config['MONGODB_URL']
        print(f"Connecting to MongoDB: {mongodb_url}")
        
        mongo_client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        mongo_client.admin.command('ping')
        print("✅ Successfully connected to MongoDB")
        
        # Extract database name from URL or use default
        if '/' in mongodb_url.split('//')[1]:
            db_name = mongodb_url.split('/')[-1]
        else:
            db_name = 'exoplanet_research'
        
        db = mongo_client[db_name]
        print(f"📊 Using database: {db_name}")
        
        # Create indexes for better performance
        create_indexes()
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {str(e)}")
        raise

def create_indexes():
    """Create database indexes"""
    global db
    
    if db is not None:
        try:
            # Create unique index on email for users collection
            db.users.create_index("email", unique=True)
            db.users.create_index("username", unique=True)
            
            # Create indexes for predictions collection
            db.predictions.create_index("user_id")
            db.predictions.create_index([("user_id", 1), ("created_at", -1)])
            
            print("📋 Database indexes created successfully")
        except Exception as e:
            print(f"⚠️  Warning: Could not create indexes: {str(e)}")
            # Don't raise error, indexes might already exist

def get_db():
    """Get database instance"""
    if db is None:
        print("❌ Database not initialized!")
    return db