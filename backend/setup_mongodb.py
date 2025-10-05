#!/usr/bin/env python3
"""
MongoDB Setup and Test Script for Exoplanet Research Platform
This script helps you set up and test MongoDB connection for the Flask backend.
"""

import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import json

def test_mongodb_connection(mongodb_url="mongodb://localhost:27017/exoplanet_research"):
    """Test MongoDB connection"""
    print("🔍 Testing MongoDB Connection...")
    print(f"📍 Connection URL: {mongodb_url}")
    
    try:
        # Create client with a short timeout for quick testing
        client = MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        client.admin.command('ping')
        
        # Get database info
        db_name = mongodb_url.split('/')[-1] if '/' in mongodb_url else 'exoplanet_research'
        db = client[db_name]
        
        print("✅ MongoDB connection successful!")
        print(f"📊 Database: {db_name}")
        
        # List existing collections
        collections = db.list_collection_names()
        print(f"📁 Collections: {collections if collections else 'None (new database)'}")
        
        # Test basic operations
        test_collection = db.test_connection
        test_doc = {"test": "connection", "timestamp": "2024-01-01"}
        
        # Insert test document
        result = test_collection.insert_one(test_doc)
        print(f"✏️  Test write successful - Document ID: {result.inserted_id}")
        
        # Read test document
        found_doc = test_collection.find_one({"_id": result.inserted_id})
        if found_doc:
            print("📖 Test read successful")
        
        # Clean up test document
        test_collection.delete_one({"_id": result.inserted_id})
        print("🧹 Test cleanup completed")
        
        return True
        
    except ConnectionFailure as e:
        print(f"❌ Connection failed: {e}")
        return False
    except ServerSelectionTimeoutError as e:
        print(f"❌ Server selection timeout: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def create_database_indexes(mongodb_url="mongodb://localhost:27017/exoplanet_research"):
    """Create necessary database indexes"""
    print("\n🔧 Setting up database indexes...")
    
    try:
        client = MongoClient(mongodb_url)
        db_name = mongodb_url.split('/')[-1] if '/' in mongodb_url else 'exoplanet_research'
        db = client[db_name]
        
        # Create indexes for users collection
        users_collection = db.users
        
        # Create unique index on email
        users_collection.create_index("email", unique=True)
        print("✅ Created unique index on users.email")
        
        # Create unique index on username
        users_collection.create_index("username", unique=True)
        print("✅ Created unique index on users.username")
        
        # List all indexes
        indexes = list(users_collection.list_indexes())
        print(f"📋 Users collection indexes: {[idx['name'] for idx in indexes]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating indexes: {e}")
        return False

def show_mongodb_info():
    """Show MongoDB installation and configuration info"""
    print("\n📋 MongoDB System Information:")
    print("=" * 50)
    
    # Check MongoDB version
    try:
        import subprocess
        result = subprocess.run(['mongod', '--version'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"🏷️  Version: {version_line}")
    except:
        print("🏷️  Version: Could not determine")
    
    # Check if mongosh or mongo client is available
    clients = []
    for client in ['mongosh', 'mongo']:
        try:
            result = subprocess.run(['which', client], capture_output=True, text=True)
            if result.returncode == 0:
                clients.append(client)
        except:
            pass
    
    print(f"🖥️  Available clients: {', '.join(clients) if clients else 'None found'}")
    
    # Default data directory
    print("📁 Default data directory: /var/lib/mongodb")
    print("📄 Default config file: /etc/mongod.conf")
    print("📊 Default port: 27017")

def main():
    print("🚀 MongoDB Setup for Exoplanet Research Platform")
    print("=" * 55)
    
    # Show system info
    show_mongodb_info()
    
    # Test default connection
    mongodb_url = "mongodb://localhost:27017/exoplanet_research"
    
    print(f"\n🔗 Testing connection to: {mongodb_url}")
    
    if test_mongodb_connection(mongodb_url):
        print(f"\n🎉 MongoDB is ready for the Exoplanet Research Platform!")
        
        # Set up indexes
        create_database_indexes(mongodb_url)
        
        print(f"\n✅ Setup Complete!")
        print(f"📝 Your Flask backend is configured to use:")
        print(f"   Database URL: {mongodb_url}")
        print(f"   Database Name: exoplanet_research")
        print(f"\n🚀 You can now start your Flask server with:")
        print(f"   cd backend && python run.py")
        
    else:
        print(f"\n❌ MongoDB Setup Failed!")
        print(f"\n🔧 Troubleshooting steps:")
        print(f"1. Start MongoDB service:")
        print(f"   sudo systemctl start mongod")
        print(f"   sudo systemctl enable mongod")
        print(f"\n2. Check if MongoDB is listening on port 27017:")
        print(f"   netstat -tulpn | grep 27017")
        print(f"\n3. Check MongoDB logs:")
        print(f"   sudo journalctl -u mongod -f")
        print(f"\n4. Verify MongoDB configuration:")
        print(f"   sudo cat /etc/mongod.conf")

if __name__ == "__main__":
    main()