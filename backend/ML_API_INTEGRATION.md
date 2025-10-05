# 🚀 External ML API Integration Guide

## Overview

The predictions endpoint has been updated to make **real HTTP requests** to an external Machine Learning API instead of using hardcoded responses. This enables integration with actual ML models for exoplanet classification.

## 🔧 Configuration

### Environment Variables (.env file)

```env
# ML API Configuration
ML_API_URL=https://your-ml-api.com/predict
ML_API_TIMEOUT=30
ML_API_KEY=your-api-key-here
USE_FALLBACK_PREDICTIONS=False
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ML_API_URL` | External ML API endpoint URL | `https://your-ml-api.com/predict` | ✅ Yes |
| `ML_API_TIMEOUT` | Request timeout in seconds | `30` | ❌ No |
| `ML_API_KEY` | API authentication key | None | ❌ No |
| `USE_FALLBACK_PREDICTIONS` | Enable fallback when API fails | `False` | ❌ No |

## 📡 How It Works

### 1. Real API Request Flow

When a user makes a prediction request:

```python
# 1. Validate input data (16 planetary parameters)
validated_data = schema.load(request_data)

# 2. Prepare headers with optional authentication
headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Exoplanet-Research-Platform/1.0'
}
if api_key:
    headers['Authorization'] = f'Bearer {api_key}'

# 3. Make HTTP POST request to external API
response = requests.post(
    external_api_url, 
    json=validated_data, 
    timeout=api_timeout,
    headers=headers
)

# 4. Parse and validate response
api_response = response.json()

# 5. Store request + response in database
# 6. Return prediction to user
```

### 2. Expected API Contract

**Your ML API should:**

**Accept POST requests** with this JSON structure:
```json
{
  "customIdentifier": "string",
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
```

**Return responses** in this JSON format:
```json
{
  "candidateIdentifier": "string",
  "confidence": 0.922024,
  "details": {
    "equilibriumTempKelvin": 793,
    "orbitalPeriodDays": 35.5,
    "planetName": null,
    "planetType": "Mini-Neptune",
    "radiusEarth": 2.24
  },
  "isExoplanet": true
}
```

### 3. Authentication Options

The system supports multiple authentication methods:

**Bearer Token:**
```env
ML_API_KEY=your-jwt-token-here
```
Sends: `Authorization: Bearer your-jwt-token-here`

**API Key Header:**
You can modify the code to use:
```python
headers['X-API-Key'] = api_key
```

**No Authentication:**
Leave `ML_API_KEY` empty for public APIs.

## 🛡️ Error Handling

### Comprehensive Error Coverage

| Error Type | HTTP Status | Response | Action |
|------------|-------------|----------|--------|
| **Timeout** | 408 | Connection timeout message | Check API availability |
| **Connection Error** | 503 | Cannot reach API message | Verify URL and network |
| **HTTP Error** | 502 | API returned error with details | Check API logs |
| **Invalid Response** | 502 | JSON parsing failed | Verify API response format |
| **Missing Fields** | 502 | Required fields missing | Check API contract |

### Example Error Responses

**Timeout Error:**
```json
{
  "message": "External API request timed out",
  "error": "The ML prediction service did not respond within 30 seconds"
}
```

**Connection Error:**
```json
{
  "message": "Failed to connect to prediction service",
  "error": "Unable to reach the ML prediction API"
}
```

**API Error:**
```json
{
  "message": "External API returned an error", 
  "error": "HTTP 500: Internal Server Error - Model loading failed"
}
```

## 🔄 Fallback System

### Enabling Fallback Mode

```env
USE_FALLBACK_PREDICTIONS=True
```

When enabled, if the external API fails, the system generates predictions using fallback logic:

```python
def create_fallback_response(validated_data):
    # Generate realistic predictions based on input parameters
    - Confidence: Random value between 0.6-0.95
    - Planet Type: Based on radius (Rocky/Super-Earth/Mini-Neptune/Gas Giant)  
    - Is Exoplanet: Heuristic based on period, depth, and SNR
    - Note: Indicates fallback was used
```

**Fallback Response Example:**
```json
{
  "candidateIdentifier": "test planet",
  "confidence": 0.847293,
  "details": {
    "equilibriumTempKelvin": 793,
    "orbitalPeriodDays": 35.5,
    "planetName": null,
    "planetType": "Mini-Neptune", 
    "radiusEarth": 2.24
  },
  "isExoplanet": true,
  "note": "This prediction was generated using fallback logic due to ML API unavailability"
}
```

## 🧪 Testing & Debugging

### 1. API Connectivity Test

**Endpoint:** `GET /api/v1/predictions/test-ml-api`

Tests connection to your ML API:

```bash
curl -X GET http://127.0.0.1:8000/api/v1/predictions/test-ml-api \
  -H "Authorization: Bearer <token>"
```

**Success Response:**
```json
{
  "message": "ML API connectivity test successful",
  "api_url": "https://your-ml-api.com/predict",
  "status_code": 200,
  "response_time_ms": 245.67,
  "api_available": true
}
```

**Failure Response:**
```json
{
  "message": "ML API connectivity test failed - connection error", 
  "api_url": "https://your-ml-api.com/predict",
  "api_available": false,
  "error": "Unable to connect to API"
}
```

### 2. Automated Testing

Run the comprehensive test suite:

```bash
cd backend
python test_external_api.py
```

This tests:
- ✅ User authentication
- ✅ ML API connectivity  
- ✅ Prediction requests
- ✅ Error handling
- ✅ Data storage
- ✅ History retrieval

### 3. Debug Logging

The server logs all external API interactions:

```
Sending request to external API: https://your-ml-api.com/predict
Request data: {'customIdentifier': 'test planet', ...}
Received response: {'candidateIdentifier': 'test planet', ...}
```

## 🔧 Integration Examples

### 1. Python ML API (Flask/FastAPI)

```python
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load('exoplanet_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    # Extract features for your model
    features = [
        data['koi_period'], data['koi_prad'], 
        data['koi_teq'], # ... etc
    ]
    
    # Make prediction
    prediction = model.predict([features])[0]
    confidence = model.predict_proba([features])[0].max()
    
    return jsonify({
        'candidateIdentifier': data['customIdentifier'],
        'confidence': float(confidence),
        'isExoplanet': bool(prediction),
        'details': {
            'equilibriumTempKelvin': data['koi_teq'],
            'orbitalPeriodDays': data['koi_period'],
            'planetName': None,
            'planetType': classify_planet_type(data['koi_prad']),
            'radiusEarth': data['koi_prad']
        }
    })
```

### 2. Cloud ML Services

**Google Cloud AI Platform:**
```env
ML_API_URL=https://ml.googleapis.com/v1/projects/PROJECT/models/MODEL:predict
ML_API_KEY=your-gcp-token
```

**AWS SageMaker:**
```env
ML_API_URL=https://runtime.sagemaker.REGION.amazonaws.com/endpoints/ENDPOINT/invocations  
ML_API_KEY=your-aws-token
```

**Azure ML:**
```env
ML_API_URL=https://WORKSPACE.REGION.inference.ml.azure.com/score
ML_API_KEY=your-azure-key
```

## 📊 Monitoring & Performance

### Request Metrics

The system automatically tracks:
- ✅ **Response Times** - API call duration
- ✅ **Success Rates** - Failed vs successful calls  
- ✅ **Error Types** - Categorized failure reasons
- ✅ **Prediction Storage** - All requests/responses saved

### Performance Optimization

**Timeout Configuration:**
```env
ML_API_TIMEOUT=30  # Adjust based on your model's speed
```

**Connection Pooling:**
Consider using `requests.Session()` for high-volume usage.

**Caching:**
Implement Redis caching for repeated identical requests.

## 🚀 Production Deployment

### Security Checklist

- ✅ **HTTPS Only** - Use SSL for API communications
- ✅ **API Key Security** - Store keys in secure environment variables
- ✅ **Rate Limiting** - Implement request throttling  
- ✅ **Input Validation** - Sanitize all inputs
- ✅ **Logging** - Monitor all API interactions
- ✅ **Error Handling** - Never expose internal details

### Scalability Considerations

**Load Balancing:**
Use multiple ML API instances behind a load balancer.

**Async Processing:**
For slow models, consider implementing async job queues.

**Caching:**
Cache frequent predictions to reduce API calls.

## 🐛 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| **Connection refused** | Verify ML API URL and network connectivity |
| **Timeout errors** | Increase `ML_API_TIMEOUT` or optimize ML model |
| **Authentication failed** | Check `ML_API_KEY` configuration |
| **Invalid response format** | Verify ML API returns expected JSON structure |
| **502 Bad Gateway** | Check ML API server status and logs |

### Debug Steps

1. **Test connectivity:** `GET /predictions/test-ml-api`
2. **Check logs:** Review Flask server console output  
3. **Verify config:** Ensure environment variables are loaded
4. **Test API directly:** Use curl/Postman on ML API endpoint
5. **Enable fallback:** Set `USE_FALLBACK_PREDICTIONS=True` temporarily

This integration provides a robust, production-ready connection to external ML services while maintaining reliability through comprehensive error handling and fallback mechanisms! 🌌✨