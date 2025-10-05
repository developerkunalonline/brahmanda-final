#!/usr/bin/env python3
"""
Test script for the Exoplanet Prediction API
"""

import requests
import json

# API base URL
BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_prediction_workflow():
    """Test the complete prediction workflow"""
    
    print("🧪 Testing Exoplanet Prediction API Workflow")
    print("=" * 50)
    
    # Step 1: Create a test user (signup)
    print("1️⃣ Creating test user...")
    signup_data = {
        "username": "test_astronomer",
        "email": "astronomer@space.gov",
        "password": "secure123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        if response.status_code == 201:
            result = response.json()
            token = result['access_token']
            print("✅ User created successfully")
            print(f"   Token: {token[:20]}...")
        else:
            # User might already exist, try login
            print("ℹ️ User might exist, trying login...")
            login_data = {
                "email": signup_data["email"],
                "password": signup_data["password"]
            }
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                result = response.json()
                token = result['access_token']
                print("✅ Login successful")
                print(f"   Token: {token[:20]}...")
            else:
                print(f"❌ Login failed: {response.text}")
                return
    except Exception as e:
        print(f"❌ Auth error: {e}")
        return
    
    # Step 2: Test prediction endpoint
    print("\n2️⃣ Testing prediction endpoint...")
    
    # Headers with JWT token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Sample planetary data
    prediction_data = {
        "customIdentifier": "kunal planet",
        "koi_period": 35.5,
        "koi_time0bk": 135.6,
        "koi_impact": 0.6,
        "koi_duration": 7.3,
        "koi_depth": 1550.2,
        "koi_prad": 2.24,
        "koi_teq": 793,
        "koi_insol": 250.5,
        "koi_model_snr": 12.7,
        "koi_steff": 5400,
        "koi_slogg": 4.3,
        "koi_srad": 0.9,
        "ra": 290.12,
        "dec": 44.21,
        "koi_kepmag": 14.5
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predictions/predict", 
                               json=prediction_data, 
                               headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful!")
            print(f"   Prediction ID: {result.get('prediction_id')}")
            print(f"   Is Exoplanet: {result['prediction']['isExoplanet']}")
            print(f"   Confidence: {result['prediction']['confidence']}")
            print(f"   Planet Type: {result['prediction']['details']['planetType']}")
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return
    
    # Step 3: Test prediction history
    print("\n3️⃣ Testing prediction history...")
    
    try:
        response = requests.get(f"{BASE_URL}/predictions/history", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            predictions = result['predictions']
            print(f"✅ History retrieved: {len(predictions)} predictions")
            print(f"   Total predictions: {result['pagination']['total']}")
            
            if predictions:
                latest = predictions[0]
                print(f"   Latest prediction: {latest['request_data']['customIdentifier']}")
        else:
            print(f"❌ History failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ History error: {e}")
    
    # Step 4: Test prediction stats
    print("\n4️⃣ Testing prediction statistics...")
    
    try:
        response = requests.get(f"{BASE_URL}/predictions/stats", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Stats retrieved successfully!")
            print(f"   Total predictions: {result['total_predictions']}")
            print(f"   Confirmed exoplanets: {result['confirmed_exoplanets']}")
            print(f"   Average confidence: {result['average_confidence']}")
            print(f"   Planet types: {result['planet_type_distribution']}")
        else:
            print(f"❌ Stats failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Stats error: {e}")
    
    print("\n🎉 Test completed!")

def test_invalid_data():
    """Test with invalid data to check validation"""
    print("\n🧪 Testing validation with invalid data...")
    
    # Try without authentication
    invalid_data = {"customIdentifier": "test"}
    
    try:
        response = requests.post(f"{BASE_URL}/predictions/predict", json=invalid_data)
        if response.status_code == 401:
            print("✅ Correctly rejected request without authentication")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing invalid data: {e}")

if __name__ == "__main__":
    test_prediction_workflow()
    test_invalid_data()
    
    print("\n📖 API Documentation:")
    print(f"   Prediction endpoint: POST {BASE_URL}/predictions/predict")
    print(f"   History endpoint: GET {BASE_URL}/predictions/history")
    print(f"   Stats endpoint: GET {BASE_URL}/predictions/stats")
    print(f"   Detail endpoint: GET {BASE_URL}/predictions/history/<id>")
    print("\n   All endpoints require Authentication: Bearer <token>")