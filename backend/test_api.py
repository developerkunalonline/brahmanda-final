#!/usr/bin/env python3
"""
Test script for Exoplanet Research Platform API
"""
import requests
import json
import sys

API_BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check endpoint...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/auth/test")
        
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed! Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed! Make sure the API server is running.")
        print("   Run: python run.py")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_signup():
    """Test user signup"""
    print("\n🔍 Testing user signup...")
    
    test_user = {
        "username": "test_astronaut",
        "email": "test@exoplanet.com",
        "password": "secure123"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/signup",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            print("✅ Signup successful!")
            data = response.json()
            print(f"   User ID: {data['user']['id']}")
            print(f"   Username: {data['user']['username']}")
            print(f"   Email: {data['user']['email']}")
            print(f"   Token received: {'access_token' in data}")
            return data['access_token']
        elif response.status_code == 409:
            print("⚠️  User already exists, trying login instead...")
            return test_login()
        else:
            print(f"❌ Signup failed! Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ Signup error: {e}")
        return None

def test_login():
    """Test user login"""
    print("\n🔍 Testing user login...")
    
    login_data = {
        "username": "test@exoplanet.com",  # Frontend sends email as username
        "password": "secure123"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            print("✅ Login successful!")
            data = response.json()
            print(f"   User ID: {data['user']['id']}")
            print(f"   Username: {data['user']['username']}")
            print(f"   Token received: {'access_token' in data}")
            return data['access_token']
        else:
            print(f"❌ Login failed! Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_protected_route(token):
    """Test protected route with JWT token"""
    print("\n🔍 Testing protected route...")
    
    if not token:
        print("❌ No token available for testing protected route")
        return False
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_BASE_URL}/auth/users/me", headers=headers)
        
        if response.status_code == 200:
            print("✅ Protected route access successful!")
            user_data = response.json()
            print(f"   User: {user_data['username']} ({user_data['email']})")
            return True
        else:
            print(f"❌ Protected route failed! Status: {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Protected route error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Exoplanet Research Platform API Test Suite")
    print("=" * 50)
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ API server is not responding. Please start the server first.")
        sys.exit(1)
    
    # Test 2: Signup
    token = test_signup()
    
    # Test 3: Protected Route
    test_protected_route(token)
    
    print("\n" + "=" * 50)
    print("🌌 Test suite completed!")
    print("\n📝 Next steps:")
    print("   1. Update frontend API base URL if needed")
    print("   2. Test integration with your React application")
    print("   3. Add more endpoints for Kepler and TESS data")

if __name__ == "__main__":
    main()