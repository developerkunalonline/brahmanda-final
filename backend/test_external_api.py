#!/usr/bin/env python3
"""
Test script for the external API integration in predictions endpoint
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000/api/v1"
TEST_USER = {
    "username": "api_tester",
    "email": "api_test@example.com",
    "password": "testpass123"
}

def test_external_api_integration():
    """Test the complete flow with external API calls"""
    print("🧪 Testing External API Integration")
    print("=" * 50)
    
    # Step 1: Register or login user
    print("1️⃣ Setting up test user...")
    
    # Try to signup (might fail if user exists)
    signup_response = requests.post(
        f"{BASE_URL}/auth/signup",
        json=TEST_USER
    )
    
    if signup_response.status_code == 201:
        print("✅ New user created successfully")
        token = signup_response.json()["access_token"]
    elif signup_response.status_code == 409:
        print("ℹ️ User already exists, logging in...")
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        if login_response.status_code == 200:
            print("✅ Login successful")
            token = login_response.json()["access_token"]
        else:
            print(f"❌ Login failed: {login_response.text}")
            return
    else:
        print(f"❌ Signup failed: {signup_response.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Test ML API connectivity
    print("\n2️⃣ Testing ML API connectivity...")
    
    connectivity_response = requests.get(
        f"{BASE_URL}/predictions/test-ml-api",
        headers=headers
    )
    
    if connectivity_response.status_code == 200:
        conn_data = connectivity_response.json()
        print(f"📡 API URL: {conn_data.get('api_url')}")
        print(f"🔌 API Available: {conn_data.get('api_available')}")
        if conn_data.get('api_available'):
            print(f"⚡ Response Time: {conn_data.get('response_time_ms', 'N/A')} ms")
        else:
            print(f"❌ Error: {conn_data.get('error')}")
    
    # Step 3: Make prediction request
    print("\n3️⃣ Making prediction request...")
    
    planet_data = {
        "customIdentifier": "Test Planet API Call",
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
    
    print(f"📤 Sending planet data: {planet_data['customIdentifier']}")
    
    start_time = time.time()
    prediction_response = requests.post(
        f"{BASE_URL}/predictions/predict",
        headers=headers,
        json=planet_data
    )
    end_time = time.time()
    
    print(f"⏱️ Request took: {(end_time - start_time):.2f} seconds")
    
    if prediction_response.status_code == 200:
        result = prediction_response.json()
        print("✅ Prediction successful!")
        print(f"📊 Result: {json.dumps(result['prediction'], indent=2)}")
        
        if 'note' in result['prediction']:
            print("⚠️ Note: This was a fallback prediction")
    else:
        print(f"❌ Prediction failed: {prediction_response.text}")
        error_data = prediction_response.json()
        
        if prediction_response.status_code == 503:
            print("🔄 External API might be unavailable")
        elif prediction_response.status_code == 408:
            print("⏰ External API request timed out")
        elif prediction_response.status_code == 502:
            print("🚫 External API returned an error")
    
    # Step 4: Check prediction history
    print("\n4️⃣ Checking prediction history...")
    
    history_response = requests.get(
        f"{BASE_URL}/predictions/history",
        headers=headers
    )
    
    if history_response.status_code == 200:
        history_data = history_response.json()
        print(f"📚 Total predictions: {len(history_data['predictions'])}")
        if history_data['predictions']:
            latest = history_data['predictions'][0]
            print(f"🕒 Latest prediction: {latest['request_data']['customIdentifier']}")
    
    # Step 5: Get user stats
    print("\n5️⃣ Getting user statistics...")
    
    stats_response = requests.get(
        f"{BASE_URL}/predictions/stats",
        headers=headers
    )
    
    if stats_response.status_code == 200:
        stats_data = stats_response.json()
        print(f"📈 Statistics:")
        print(f"   Total predictions: {stats_data['total_predictions']}")
        print(f"   Confirmed exoplanets: {stats_data['confirmed_exoplanets']}")
        print(f"   Average confidence: {stats_data['average_confidence']}")
    
    print("\n🎉 Test completed!")

def test_different_scenarios():
    """Test various edge cases and scenarios"""
    print("\n🔬 Testing Edge Cases")
    print("=" * 30)
    
    # Test invalid data
    print("Testing invalid data...")
    invalid_response = requests.post(
        f"{BASE_URL}/predictions/predict",
        headers={"Authorization": "Bearer invalid_token"},
        json={"invalid": "data"}
    )
    print(f"Invalid data response: {invalid_response.status_code}")
    
    # Test without authentication
    print("Testing without authentication...")
    no_auth_response = requests.post(
        f"{BASE_URL}/predictions/predict",
        json={"some": "data"}
    )
    print(f"No auth response: {no_auth_response.status_code}")

if __name__ == "__main__":
    try:
        test_external_api_integration()
        test_different_scenarios()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")