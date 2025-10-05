#!/usr/bin/env python3

import requests
import json

# Test the signup endpoint
url = "http://127.0.0.1:8000/api/v1/auth/signup"

test_data = {
    "username": "kunalonline",
    "email": "hello@gmail.com",
    "password": "12345678"
}

print("🧪 Testing signup endpoint...")
print(f"📤 URL: {url}")
print(f"📤 Data: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(url, json=test_data, timeout=10)
    
    print(f"\n📥 Response Status: {response.status_code}")
    print(f"📥 Response Headers: {dict(response.headers)}")
    
    try:
        response_json = response.json()
        print(f"📥 Response Body: {json.dumps(response_json, indent=2)}")
    except:
        print(f"📥 Response Text: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to the server. Make sure it's running on http://127.0.0.1:8000")
except requests.exceptions.Timeout:
    print("❌ Request timed out")
except Exception as e:
    print(f"❌ Error: {str(e)}")

# Test the health check endpoint
print("\n" + "="*50)
print("🧪 Testing health check endpoint...")

health_url = "http://127.0.0.1:8000/api/v1/auth/test"
try:
    response = requests.get(health_url, timeout=5)
    print(f"📥 Health Check Status: {response.status_code}")
    print(f"📥 Health Check Response: {response.json()}")
except Exception as e:
    print(f"❌ Health check failed: {str(e)}")