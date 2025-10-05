#!/usr/bin/env python3
"""
Test script demonstrating pagination in prediction history
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def create_test_user_and_predictions(num_predictions=25):
    """Create a test user and multiple predictions to test pagination"""
    print(f"🚀 Creating test user and {num_predictions} predictions...")
    
    # Test user credentials
    test_user = {
        "username": f"pagination_tester_{int(time.time())}",
        "email": f"pagination{int(time.time())}@example.com", 
        "password": "testpass123"
    }
    
    # Create user
    signup_response = requests.post(f"{BASE_URL}/auth/signup", json=test_user)
    
    if signup_response.status_code != 201:
        print(f"❌ Failed to create user: {signup_response.text}")
        return None
    
    token = signup_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"✅ User created: {test_user['username']}")
    
    # Create multiple predictions
    print(f"📊 Creating {num_predictions} test predictions...")
    
    for i in range(num_predictions):
        planet_data = {
            "customIdentifier": f"Test Planet {i+1}",
            "koi_period": 35.5 + i,
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
        
        response = requests.post(
            f"{BASE_URL}/predictions/predict",
            headers=headers,
            json=planet_data
        )
        
        if response.status_code == 200:
            print(f"  ✅ Created prediction {i+1}/{num_predictions}")
        else:
            print(f"  ❌ Failed to create prediction {i+1}: {response.text}")
    
    return token

def test_pagination(token):
    """Test various pagination scenarios"""
    print("\n📖 Testing Pagination Scenarios")
    print("=" * 40)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Get first page (default)
    print("1️⃣ Testing first page (default parameters)...")
    response = requests.get(f"{BASE_URL}/predictions/history", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        pagination = data['pagination']
        print(f"   📄 Page: {pagination['page']}")
        print(f"   📊 Items per page: {pagination['limit']}")
        print(f"   📈 Total items: {pagination['total']}")
        print(f"   📚 Total pages: {pagination['pages']}")
        print(f"   🔢 Items on this page: {len(data['predictions'])}")
        
        total_pages = pagination['pages']
        total_items = pagination['total']
    else:
        print(f"   ❌ Failed: {response.text}")
        return
    
    # Test 2: Get specific page
    if total_pages > 1:
        print(f"\n2️⃣ Testing page 2...")
        response = requests.get(f"{BASE_URL}/predictions/history?page=2", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📄 Page: {data['pagination']['page']}")
            print(f"   🔢 Items on this page: {len(data['predictions'])}")
            
            # Show first item's identifier for verification
            if data['predictions']:
                first_item = data['predictions'][0]['request_data']['customIdentifier']
                print(f"   🏷️ First item: {first_item}")
    
    # Test 3: Custom page size
    print(f"\n3️⃣ Testing custom page size (limit=5)...")
    response = requests.get(f"{BASE_URL}/predictions/history?page=1&limit=5", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        pagination = data['pagination']
        print(f"   📊 Items per page: {pagination['limit']}")
        print(f"   📚 Total pages: {pagination['pages']}")
        print(f"   🔢 Items on this page: {len(data['predictions'])}")
    
    # Test 4: Large page size
    print(f"\n4️⃣ Testing large page size (limit=50)...")
    response = requests.get(f"{BASE_URL}/predictions/history?page=1&limit=50", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        pagination = data['pagination']
        print(f"   📊 Items per page: {pagination['limit']}")
        print(f"   🔢 Items on this page: {len(data['predictions'])}")
    
    # Test 5: Last page
    if total_pages > 1:
        print(f"\n5️⃣ Testing last page (page {total_pages})...")
        response = requests.get(f"{BASE_URL}/predictions/history?page={total_pages}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📄 Page: {data['pagination']['page']}")
            print(f"   🔢 Items on this page: {len(data['predictions'])}")
    
    # Test 6: Invalid page (beyond available)
    print(f"\n6️⃣ Testing invalid page (page {total_pages + 5})...")
    response = requests.get(f"{BASE_URL}/predictions/history?page={total_pages + 5}", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"   📄 Page: {data['pagination']['page']}")
        print(f"   🔢 Items on this page: {len(data['predictions'])}")
        print("   ℹ️ Empty results for pages beyond available data")

def get_all_predictions_example(token):
    """Example of how to get all predictions across multiple pages"""
    print("\n🔄 Example: Getting ALL predictions across pages")
    print("=" * 45)
    
    headers = {"Authorization": f"Bearer {token}"}
    all_predictions = []
    page = 1
    
    while True:
        print(f"   📖 Fetching page {page}...")
        
        response = requests.get(
            f"{BASE_URL}/predictions/history?page={page}&limit=10",
            headers=headers
        )
        
        if response.status_code != 200:
            print(f"   ❌ Error fetching page {page}: {response.text}")
            break
        
        data = response.json()
        predictions_on_page = data['predictions']
        all_predictions.extend(predictions_on_page)
        
        print(f"   ✅ Got {len(predictions_on_page)} predictions from page {page}")
        
        # Check if we've reached the last page
        if page >= data['pagination']['pages'] or len(predictions_on_page) == 0:
            break
        
        page += 1
    
    print(f"\n📊 Total predictions collected: {len(all_predictions)}")
    
    # Show summary
    if all_predictions:
        identifiers = [p['request_data']['customIdentifier'] for p in all_predictions]
        print(f"   🏷️ First: {identifiers[0]}")
        print(f"   🏷️ Last: {identifiers[-1]}")
    
    return all_predictions

def demonstrate_frontend_pagination(token):
    """Demonstrate how frontend would handle pagination"""
    print("\n🌐 Frontend Pagination Example")
    print("=" * 30)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Simulate frontend pagination logic
    current_page = 1
    items_per_page = 5
    
    # Get first page to know total
    response = requests.get(
        f"{BASE_URL}/predictions/history?page={current_page}&limit={items_per_page}",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        pagination = data['pagination']
        
        print(f"📱 Frontend Pagination Controls:")
        print(f"   Current Page: {current_page}")
        print(f"   Items per Page: {items_per_page}")
        print(f"   Total Pages: {pagination['pages']}")
        print(f"   Total Items: {pagination['total']}")
        
        # Show pagination buttons logic
        has_previous = current_page > 1
        has_next = current_page < pagination['pages']
        
        print(f"\n🎛️ Button States:")
        print(f"   Previous Button: {'Enabled' if has_previous else 'Disabled'}")
        print(f"   Next Button: {'Enabled' if has_next else 'Disabled'}")
        
        # Show page number buttons (show 5 around current)
        start_page = max(1, current_page - 2)
        end_page = min(pagination['pages'], current_page + 2)
        
        page_buttons = list(range(start_page, end_page + 1))
        print(f"   Page Numbers: {page_buttons}")

if __name__ == "__main__":
    try:
        print("🧪 Pagination Testing Suite")
        print("=" * 50)
        
        # Create test data
        token = create_test_user_and_predictions(25)
        
        if token:
            # Test various pagination scenarios
            test_pagination(token)
            
            # Demonstrate getting all predictions
            get_all_predictions_example(token)
            
            # Show frontend example
            demonstrate_frontend_pagination(token)
            
            print("\n✅ All pagination tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")