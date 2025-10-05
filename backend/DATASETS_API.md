# 📊 Datasets API Documentation

## Overview

The Datasets API provides access to both **Kepler** and **TESS** exoplanet datasets with pagination, search, and detailed statistics. Each endpoint returns 12 items per page by default, with comprehensive pagination support.

## 🔐 Authentication Required

All dataset endpoints require JWT authentication:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 🔭 Kepler Dataset Endpoints

### **GET `/api/v1/datasets/kepler`** - Get Kepler Objects of Interest

**Purpose:** Retrieve paginated Kepler dataset (KOIs - Kepler Objects of Interest)

**Query Parameters:**
- `page` (optional): Page number, starts from 1 (default: 1)
- `limit` (optional): Items per page, max 50 (default: 12)

**Examples:**
```bash
# Default: First page, 12 items
GET /api/v1/datasets/kepler

# Second page, 12 items  
GET /api/v1/datasets/kepler?page=2

# First page, 20 items
GET /api/v1/datasets/kepler?page=1&limit=20

# Fifth page, 5 items
GET /api/v1/datasets/kepler?page=5&limit=5
```

**Response Format:**
```json
{
  "data": [
    {
      "_id": "68e18c2e25da28f5a61d2d81",
      "kepid": 10854555,
      "kepoi_name": "K00755.01",
      "kepler_name": "Kepler-664 b",
      "koi_disposition": "CONFIRMED",
      "koi_pdisposition": "CANDIDATE",
      "koi_score": 1,
      "koi_period": 2.525591777,
      "koi_prad": 2.75,
      "koi_teq": 1406,
      "koi_steff": 6031,
      "koi_slogg": 4.438,
      "koi_srad": 1.046,
      "ra": 288.75488,
      "dec": 48.2262,
      "koi_kepmag": 15.509
      // ... all other Kepler fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total_items": 9564,
    "total_pages": 798,
    "has_next": true,
    "has_prev": false
  },
  "dataset_info": {
    "name": "Kepler Objects of Interest",
    "description": "Planetary candidates and confirmed planets from the Kepler mission",
    "source": "NASA Exoplanet Archive"
  }
}
```

### **GET `/api/v1/datasets/kepler/<item_id>`** - Get Specific Kepler Object

**Purpose:** Retrieve detailed information for a single Kepler object

**URL Parameters:**
- `item_id`: MongoDB ObjectId of the Kepler object

**Example:**
```bash
GET /api/v1/datasets/kepler/68e18c2e25da28f5a61d2d81
```

**Response:**
```json
{
  "data": {
    "_id": "68e18c2e25da28f5a61d2d81",
    "kepid": 10854555,
    "kepoi_name": "K00755.01",
    "kepler_name": "Kepler-664 b",
    // ... complete object data
  },
  "dataset_info": {
    "name": "Kepler Objects of Interest",
    "type": "kepler"
  }
}
```

---

## 🛰️ TESS Dataset Endpoints

### **GET `/api/v1/datasets/tess`** - Get TESS Objects of Interest

**Purpose:** Retrieve paginated TESS dataset (TOIs - TESS Objects of Interest)

**Query Parameters:**
- `page` (optional): Page number, starts from 1 (default: 1)  
- `limit` (optional): Items per page, max 50 (default: 12)

**Examples:**
```bash
# Default: First page, 12 items
GET /api/v1/datasets/tess

# Third page, 15 items
GET /api/v1/datasets/tess?page=3&limit=15
```

**Response Format:**
```json
{
  "data": [
    {
      "_id": "68e18c8825da28f5a61d52db",
      "rowid": 1,
      "toi": 1000.01,
      "toipfx": 1000,
      "tid": 50365310,
      "ctoi_alias": "50365310.01",
      "pl_pnum": 1,
      "tfopwg_disp": "FP",
      "ra": 112.357708,
      "dec": -12.69596,
      "pl_orbper": 2.1713484,
      "pl_trandurh": 2.0172196,
      "pl_trandep": 656.8860989,
      "pl_rade": 5.8181633,
      "pl_insol": 22601.9485814,
      "pl_eqt": 3127.2040524,
      "st_tmag": 9.604,
      "st_teff": 10249,
      "st_logg": 4.19,
      "st_rad": 2.16986
      // ... all other TESS fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total_items": 7142,
    "total_pages": 596,
    "has_next": true,
    "has_prev": false
  },
  "dataset_info": {
    "name": "TESS Objects of Interest", 
    "description": "Planetary candidates from the Transiting Exoplanet Survey Satellite",
    "source": "NASA Exoplanet Archive"
  }
}
```

### **GET `/api/v1/datasets/tess/<item_id>`** - Get Specific TESS Object

**Purpose:** Retrieve detailed information for a single TESS object

**URL Parameters:**
- `item_id`: MongoDB ObjectId of the TESS object

**Example:**
```bash
GET /api/v1/datasets/tess/68e18c8825da28f5a61d52db
```

---

## 🔍 Search Endpoint

### **GET `/api/v1/datasets/search`** - Search Across Both Datasets

**Purpose:** Search for objects across both Kepler and TESS datasets

**Query Parameters:**
- `query` (required): Search term

**Search Fields:**
- **Kepler:** `kepoi_name`, `kepler_name`, `kepid`
- **TESS:** `toi`, `ctoi_alias`, `tid`

**Examples:**
```bash
# Search for Kepler objects
GET /api/v1/datasets/search?query=Kepler-227

# Search for KOI names
GET /api/v1/datasets/search?query=K00752

# Search for TOI numbers  
GET /api/v1/datasets/search?query=1000

# Search for TIC IDs
GET /api/v1/datasets/search?query=50365310
```

**Response:**
```json
{
  "query": "Kepler-227",
  "results": {
    "kepler": [
      {
        "_id": "68e18c2e25da28f5a61d2d81",
        "kepoi_name": "K00752.01", 
        "kepler_name": "Kepler-227 b",
        // ... full object data
      }
    ],
    "tess": []
  },
  "total_found": {
    "kepler": 2,
    "tess": 0, 
    "combined": 2
  }
}
```

---

## 📈 Statistics Endpoint

### **GET `/api/v1/datasets/stats`** - Get Dataset Statistics

**Purpose:** Get comprehensive statistics about both datasets

**Response:**
```json
{
  "kepler_dataset": {
    "total_objects": 9564,
    "confirmed_planets": 2341,
    "candidates": 4621,
    "false_positives": 2602,
    "disposition_breakdown": {
      "CONFIRMED": 2341,
      "CANDIDATE": 4621,
      "FALSE POSITIVE": 2602
    }
  },
  "tess_dataset": {
    "total_objects": 7142,
    "planet_candidates": 2856,
    "false_positives": 4286,
    "disposition_breakdown": {
      "PC": 2856,
      "FP": 4286
    }
  },
  "combined_stats": {
    "total_objects": 16706,
    "total_confirmed_planets": 2341,
    "total_candidates": 7477
  }
}
```

---

## 📊 Key Dataset Fields

### **Kepler Dataset Fields**

| Field | Description | Example |
|-------|-------------|---------|
| `kepid` | Kepler Input Catalog ID | 10797460 |
| `kepoi_name` | Kepler Object of Interest name | "K00752.01" |
| `kepler_name` | Confirmed planet name | "Kepler-227 b" |
| `koi_disposition` | Planet disposition | "CONFIRMED", "CANDIDATE", "FALSE POSITIVE" |
| `koi_period` | Orbital period (days) | 9.48803600 |
| `koi_prad` | Planet radius (Earth radii) | 2.26 |
| `koi_teq` | Equilibrium temperature (K) | 793 |
| `koi_steff` | Stellar effective temperature (K) | 5455 |
| `koi_slogg` | Stellar surface gravity | 4.467 |
| `koi_srad` | Stellar radius (Solar radii) | 0.927 |
| `ra` | Right Ascension (degrees) | 291.93423 |
| `dec` | Declination (degrees) | 48.141651 |
| `koi_kepmag` | Kepler magnitude | 15.347 |

### **TESS Dataset Fields**

| Field | Description | Example |
|-------|-------------|---------|
| `toi` | TESS Object of Interest number | 1000.01 |
| `tid` | TESS Input Catalog ID | 50365310 |
| `ctoi_alias` | Community TOI alias | "50365310.01" |
| `tfopwg_disp` | TFOP Working Group disposition | "PC", "FP" |
| `pl_orbper` | Orbital period (days) | 2.1713484 |
| `pl_trandurh` | Transit duration (hours) | 2.0172196 |
| `pl_trandep` | Transit depth (ppm) | 656.8860989 |
| `pl_rade` | Planet radius (Earth radii) | 5.8181633 |
| `pl_insol` | Insolation flux (Earth flux) | 22601.9485814 |
| `pl_eqt` | Equilibrium temperature (K) | 3127.2040524 |
| `st_tmag` | TESS magnitude | 9.604 |
| `st_teff` | Stellar effective temperature (K) | 10249 |
| `st_logg` | Stellar surface gravity | 4.19 |
| `st_rad` | Stellar radius (Solar radii) | 2.16986 |

---

## 🔄 Pagination Usage Examples

### **JavaScript/Frontend Usage:**

```javascript
// Get all Kepler data with pagination
const getAllKeplerData = async () => {
  let allData = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`/api/v1/datasets/kepler?page=${page}&limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    allData.push(...result.data);
    
    hasMore = result.pagination.has_next;
    page++;
  }
  
  return allData;
};

// Get specific page with custom limit
const getKeplerPage = async (pageNum, itemsPerPage) => {
  const response = await fetch(
    `/api/v1/datasets/kepler?page=${pageNum}&limit=${itemsPerPage}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return await response.json();
};
```

### **Python Usage:**

```python
import requests

def get_all_pages(dataset_type, token, limit=50):
    """Get all pages of a dataset"""
    all_data = []
    page = 1
    
    while True:
        response = requests.get(
            f"http://127.0.0.1:8000/api/v1/datasets/{dataset_type}",
            params={'page': page, 'limit': limit},
            headers={'Authorization': f'Bearer {token}'}
        )
        
        result = response.json()
        all_data.extend(result['data'])
        
        if not result['pagination']['has_next']:
            break
            
        page += 1
    
    return all_data

# Usage
kepler_data = get_all_pages('kepler', token)
tess_data = get_all_pages('tess', token)
```

---

## 🚨 Error Responses

| Status Code | Description | Example |
|-------------|-------------|---------|
| **400** | Bad Request | Invalid page/limit parameters |
| **401** | Unauthorized | Missing or invalid JWT token |
| **404** | Not Found | Item ID doesn't exist |
| **500** | Server Error | Database connection issues |

**Error Response Format:**
```json
{
  "message": "Invalid parameters",
  "errors": {
    "page": ["Must be greater than or equal to 1"],
    "limit": ["Must be between 1 and 50"]
  }
}
```

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd backend
python test_datasets.py
```

This tests:
- ✅ Pagination functionality
- ✅ Individual item retrieval  
- ✅ Search across datasets
- ✅ Statistics generation
- ✅ Error handling
- ✅ Authentication requirements

## 📝 Usage Summary

The datasets API provides complete access to both Kepler and TESS exoplanet datasets with:

- ✅ **Pagination**: 12 items per page by default, customizable up to 50
- ✅ **Search**: Cross-dataset search functionality
- ✅ **Statistics**: Comprehensive dataset analytics  
- ✅ **Individual Access**: Get specific objects by ID
- ✅ **Authentication**: Secure JWT-based access
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **MongoDB Integration**: Direct access to your dataset collections

Perfect for building exoplanet research applications, data visualization dashboards, and scientific analysis tools! 🌌✨