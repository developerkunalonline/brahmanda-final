# Exoplanet Research Platform - Backend API

A Flask-based REST API for the Exoplanet Research Platform, providing authentication and data management for astronomical research.

## Features

- 🔐 **JWT Authentication**: Secure user registration and login
- 🛡️ **Password Security**: Bcrypt password hashing
- 🗄️ **MongoDB Integration**: Scalable NoSQL database
- 🌐 **CORS Enabled**: Cross-origin resource sharing for frontend integration
- ✅ **Input Validation**: Marshmallow schema validation
- 🚀 **RESTful API**: Clean and intuitive endpoints

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── config.py            # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   └── user.py          # User model
│   ├── routes/              # API routes
│   │   ├── __init__.py
│   │   └── auth.py          # Authentication routes
│   └── utils/               # Utility functions
│       ├── __init__.py
│       └── auth.py          # JWT utilities
├── .env                     # Environment variables
├── requirements.txt         # Dependencies
└── run.py                  # Application entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup MongoDB

Make sure MongoDB is running on your system:
- **Local MongoDB**: Default connection to `mongodb://localhost:27017/exoplanet_research`
- **MongoDB Atlas**: Update `MONGODB_URL` in `.env` file

### 3. Environment Configuration

The `.env` file contains default configurations. Update as needed:

```env
SECRET_KEY=exoplanet-research-secret-key-2024
JWT_SECRET_KEY=jwt-secret-for-exoplanet-platform-2024
MONGODB_URL=mongodb://localhost:27017/exoplanet_research
FLASK_ENV=development
FLASK_DEBUG=True
```

### 4. Run the Application

```bash
python run.py
```

The API will be available at: `http://127.0.0.1:8000/api/v1`

## API Endpoints

### Authentication

#### POST /api/v1/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "space_explorer",
  "email": "explorer@nasa.gov",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "username": "space_explorer",
    "email": "explorer@nasa.gov",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer"
}
```

#### POST /api/v1/auth/login
Authenticate user and get access token.

**Request Body (JSON):**
```json
{
  "email": "explorer@nasa.gov",
  "password": "securepassword123"
}
```

**Request Body (Form Data):**
```
username=explorer@nasa.gov&password=securepassword123
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "username": "space_explorer",
    "email": "explorer@nasa.gov",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/v1/auth/users/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "username": "space_explorer",
  "email": "explorer@nasa.gov",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/v1/auth/test
Health check endpoint.

**Response (200):**
```json
{
  "message": "Exoplanet Research Platform API is running!",
  "version": "1.0.0",
  "status": "healthy"
}
```

### Exoplanet Predictions

#### POST /api/v1/predictions/predict
Analyze planetary data and get exoplanet classification prediction.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
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
```

**Response (200):**
```json
{
  "message": "Prediction completed successfully",
  "prediction": {
    "candidateIdentifier": "kunal planet",
    "confidence": 0.922024,
    "details": {
      "equilibriumTempKelvin": 793,
      "orbitalPeriodDays": 35.5,
      "planetName": null,
      "planetType": "Mini-Neptune",
      "radiusEarth": 2.24
    },
    "isExoplanet": true
  },
  "prediction_id": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

#### GET /api/v1/predictions/history
Get user's prediction history with pagination.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

**Response (200):**
```json
{
  "predictions": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "user_id": "65f1a2b3c4d5e6f7g8h9i0j0",
      "request_data": { /* Original planetary data */ },
      "response_data": { /* Prediction result */ },
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /api/v1/predictions/history/<prediction_id>
Get specific prediction details.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "user_id": "65f1a2b3c4d5e6f7g8h9i0j0",
  "request_data": { /* Original planetary data */ },
  "response_data": { /* Prediction result */ },
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/v1/predictions/stats
Get user's prediction statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "total_predictions": 15,
  "confirmed_exoplanets": 12,
  "average_confidence": 0.876,
  "planet_type_distribution": {
    "Mini-Neptune": 5,
    "Super-Earth": 3,
    "Gas Giant": 2,
    "Rocky Planet": 2
  }
}
```

## Security Features

- **Password Hashing**: Bcrypt with salt for secure password storage
- **JWT Tokens**: Stateless authentication with configurable expiration (24 hours)
- **Input Validation**: Marshmallow schemas prevent malicious input
- **CORS Protection**: Configured for cross-origin requests
- **Unique Constraints**: Email and username uniqueness enforced at database level

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Specific validation error"]
  }
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `409`: Conflict (duplicate email/username)
- `500`: Internal Server Error

## Development

### Installing New Dependencies

```bash
pip install package_name
pip freeze > requirements.txt
```

### Database Indexes

The application automatically creates indexes on:
- `users.email` (unique)
- `users.username` (unique)

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper secret keys and secure MongoDB connection
2. **HTTPS**: Enable SSL/TLS encryption
3. **Rate Limiting**: Implement API rate limiting
4. **Logging**: Add comprehensive logging
5. **Monitoring**: Set up health checks and monitoring

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env` file
- Verify network connectivity for remote MongoDB

### Import Errors
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check Python path and virtual environment

### CORS Issues
- CORS is enabled for all origins (`*`) - adjust in production
- Verify frontend is making requests to correct API URL