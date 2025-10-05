#!/usr/bin/env python3
"""
Test script for datasets endpoints (Kepler and TESS data)
"""
import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000/api/v1"
TEST_USER = {
    "username": "dataset_tester", 
    "email": "dataset_test@example.com",
    "password": "testpass123"
}

def get_auth_token():
    """Get authentication token for API access"""
    print("🔑 Getting authentication token...")
    
    # Try to signup (might fail if user exists)
    signup_response = requests.post(
        f"{BASE_URL}/auth/signup",
        json=TEST_USER
    )
    
    if signup_response.status_code == 201:
        print("✅ New user created successfully")
        return signup_response.json()["access_token"]
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
            return login_response.json()["access_token"]
        else:
            print(f"❌ Login failed: {login_response.text}")
            return None
    else:
        print(f"❌ Signup failed: {signup_response.text}")
        return None

def test_kepler_dataset(token):
    """Test Kepler dataset endpoints"""
    print("\n🔭 Testing Kepler Dataset Endpoints")
    print("=" * 40)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test default pagination (first page, 12 items)
    print("1️⃣ Getting first page of Kepler data (default: 12 items)...")
    
    response = requests.get(f"{BASE_URL}/datasets/kepler", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Retrieved {len(data['data'])} items")
        print(f"📊 Pagination info:")
        print(f"   - Current page: {data['pagination']['page']}")
        print(f"   - Items per page: {data['pagination']['limit']}")
        print(f"   - Total items: {data['pagination']['total_items']}")
        print(f"   - Total pages: {data['pagination']['total_pages']}")
        print(f"   - Has next page: {data['pagination']['has_next']}")
        
        if data['data']:
            sample = data['data'][0]
            print(f"📝 Sample item: {sample.get('kepoi_name', 'N/A')} - {sample.get('kepler_name', 'N/A')}")
        
        return data['pagination']['total_pages']
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return 0

def test_kepler_pagination(token, total_pages):
    """Test different pages of Kepler data"""
    print(f"\n2️⃣ Testing Kepler pagination (total pages: {total_pages})...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test page 2 if exists
    if total_pages > 1:
        response = requests.get(f"{BASE_URL}/datasets/kepler?page=2", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Page 2: Retrieved {len(data['data'])} items")
        
    # Test custom limit
    response = requests.get(f"{BASE_URL}/datasets/kepler?page=1&limit=5", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Custom limit (5 items): Retrieved {len(data['data'])} items")

def test_tess_dataset(token):
    """Test TESS dataset endpoints"""
    print("\n🛰️ Testing TESS Dataset Endpoints")
    print("=" * 40)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test default pagination (first page, 12 items)
    print("1️⃣ Getting first page of TESS data (default: 12 items)...")
    
    response = requests.get(f"{BASE_URL}/datasets/tess", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Retrieved {len(data['data'])} items")
        print(f"📊 Pagination info:")
        print(f"   - Current page: {data['pagination']['page']}")
        print(f"   - Items per page: {data['pagination']['limit']}")
        print(f"   - Total items: {data['pagination']['total_items']}")
        print(f"   - Total pages: {data['pagination']['total_pages']}")
        print(f"   - Has next page: {data['pagination']['has_next']}")
        
        if data['data']:
            sample = data['data'][0]
            print(f"📝 Sample item: TOI {sample.get('toi', 'N/A')} - TIC {sample.get('tid', 'N/A')}")
        
        return data['pagination']['total_pages']
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return 0

def test_search_functionality(token):
    """Test search across datasets"""
    print("\n🔍 Testing Search Functionality")
    print("=" * 35)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test search queries
    search_queries = ["Kepler", "1000", "K00", "TOI"]
    
    for query in search_queries:
        print(f"🔍 Searching for: '{query}'...")
        
        response = requests.get(
            f"{BASE_URL}/datasets/search?query={query}",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            kepler_count = data['total_found']['kepler']
            tess_count = data['total_found']['tess']
            total = data['total_found']['combined']
            
            print(f"✅ Found: {total} total ({kepler_count} Kepler, {tess_count} TESS)")
        else:
            print(f"❌ Search failed: {response.status_code}")

def test_dataset_stats(token):
    """Test dataset statistics endpoint"""
    print("\n📈 Testing Dataset Statistics")
    print("=" * 35)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/datasets/stats", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Statistics retrieved successfully!")
        print(f"\n📊 Kepler Dataset:")
        print(f"   - Total objects: {data['kepler_dataset']['total_objects']}")
        print(f"   - Confirmed planets: {data['kepler_dataset']['confirmed_planets']}")
        print(f"   - Candidates: {data['kepler_dataset']['candidates']}")
        print(f"   - False positives: {data['kepler_dataset']['false_positives']}")
        
        print(f"\n📊 TESS Dataset:")
        print(f"   - Total objects: {data['tess_dataset']['total_objects']}")
        print(f"   - Planet candidates: {data['tess_dataset']['planet_candidates']}")
        print(f"   - False positives: {data['tess_dataset']['false_positives']}")
        
        print(f"\n📊 Combined:")
        print(f"   - Total objects: {data['combined_stats']['total_objects']}")
        print(f"   - Total confirmed planets: {data['combined_stats']['total_confirmed_planets']}")
        print(f"   - Total candidates: {data['combined_stats']['total_candidates']}")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")

def test_individual_items(token):
    """Test getting individual items by ID"""
    print("\n🎯 Testing Individual Item Retrieval")
    print("=" * 40)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # First get some IDs from the datasets
    print("📋 Getting sample item IDs...")
    
    # Get Kepler item ID
    kepler_response = requests.get(f"{BASE_URL}/datasets/kepler?limit=1", headers=headers)
    if kepler_response.status_code == 200:
        kepler_data = kepler_response.json()
        if kepler_data['data']:
            kepler_id = kepler_data['data'][0]['_id']
            print(f"🔭 Testing Kepler item: {kepler_id}")
            
            item_response = requests.get(f"{BASE_URL}/datasets/kepler/{kepler_id}", headers=headers)
            if item_response.status_code == 200:
                item_data = item_response.json()
                print(f"✅ Kepler item retrieved: {item_data['data'].get('kepoi_name', 'N/A')}")
            else:
                print(f"❌ Failed to get Kepler item: {item_response.status_code}")
    
    # Get TESS item ID
    tess_response = requests.get(f"{BASE_URL}/datasets/tess?limit=1", headers=headers)
    if tess_response.status_code == 200:
        tess_data = tess_response.json()
        if tess_data['data']:
            tess_id = tess_data['data'][0]['_id']
            print(f"🛰️ Testing TESS item: {tess_id}")
            
            item_response = requests.get(f"{BASE_URL}/datasets/tess/{tess_id}", headers=headers)
            if item_response.status_code == 200:
                item_data = item_response.json()
                print(f"✅ TESS item retrieved: TOI {item_data['data'].get('toi', 'N/A')}")
            else:
                print(f"❌ Failed to get TESS item: {item_response.status_code}")

def test_error_cases(token):
    """Test error handling"""
    print("\n🚨 Testing Error Cases")
    print("=" * 25)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test invalid page number
    response = requests.get(f"{BASE_URL}/datasets/kepler?page=0", headers=headers)
    print(f"Invalid page (0): {response.status_code} ✅" if response.status_code == 400 else f"❌ Expected 400, got {response.status_code}")
    
    # Test invalid limit
    response = requests.get(f"{BASE_URL}/datasets/kepler?limit=100", headers=headers)
    print(f"Invalid limit (100): {response.status_code} ✅" if response.status_code == 400 else f"❌ Expected 400, got {response.status_code}")
    
    # Test invalid item ID
    response = requests.get(f"{BASE_URL}/datasets/kepler/invalid_id", headers=headers)
    print(f"Invalid item ID: {response.status_code} ✅" if response.status_code == 400 else f"❌ Expected 400, got {response.status_code}")
    
    # Test empty search query
    response = requests.get(f"{BASE_URL}/datasets/search", headers=headers)
    print(f"Empty search query: {response.status_code} ✅" if response.status_code == 400 else f"❌ Expected 400, got {response.status_code}")

def main():
    """Run all tests"""
    print("🧪 Dataset Endpoints Testing Suite")
    print("=" * 50)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token. Exiting.")
        return
    
    try:
        # Test Kepler dataset
        kepler_pages = test_kepler_dataset(token)
        if kepler_pages > 0:
            test_kepler_pagination(token, kepler_pages)
        
        # Test TESS dataset
        tess_pages = test_tess_dataset(token)
        
        # Test search functionality
        test_search_functionality(token)
        
        # Test statistics
        test_dataset_stats(token)
        
        # Test individual items
        test_individual_items(token)
        
        # Test error cases
        test_error_cases(token)
        
        print("\n🎉 All dataset tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

if __name__ == "__main__":
    main()