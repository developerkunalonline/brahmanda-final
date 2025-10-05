from flask import Blueprint, request, jsonify, current_app
from marshmallow import Schema, fields, ValidationError
import requests
import json
from app.models.prediction import Prediction
from app.utils.auth import token_required

predictions_bp = Blueprint('predictions', __name__)

class PredictionRequestSchema(Schema):
    customIdentifier = fields.Str(required=True)
    koi_period = fields.Float(required=True)
    koi_time0bk = fields.Float(required=True)
    koi_impact = fields.Float(required=True)
    koi_duration = fields.Float(required=True)
    koi_depth = fields.Float(required=True)
    koi_prad = fields.Float(required=True)
    koi_teq = fields.Float(required=True)
    koi_insol = fields.Float(required=True)
    koi_model_snr = fields.Float(required=True)
    koi_steff = fields.Float(required=True)
    koi_slogg = fields.Float(required=True)
    koi_srad = fields.Float(required=True)
    ra = fields.Float(required=True)
    dec = fields.Float(required=True)
    koi_kepmag = fields.Float(required=True)

@predictions_bp.route('/predict', methods=['POST'])
@token_required
def predict_exoplanet(current_user):
    """
    Predict exoplanet classification by sending data to external API
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Validate input data
        schema = PredictionRequestSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return jsonify({'message': 'Validation error', 'errors': err.messages}), 400
        
        # Get ML API configuration from app config
        external_api_url = current_app.config['ML_API_URL']
        api_timeout = current_app.config['ML_API_TIMEOUT']
        api_key = current_app.config.get('ML_API_KEY')
        
        try:
            # Make actual request to external API
            print(f"Sending request to external API: {external_api_url}")
            print(f"Request data: {validated_data}")
            
            # Prepare headers
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Exoplanet-Research-Platform/1.0'
            }
            
            # Add API key if configured
            if api_key:
                headers['Authorization'] = f'Bearer {api_key}'
                # Or use headers['X-API-Key'] = api_key depending on your API
            
            response = requests.post(
                external_api_url, 
                json=validated_data, 
                timeout=api_timeout,
                headers=headers
            )
            
            # Check if request was successful
            response.raise_for_status()
            
            # Parse JSON response
            api_response = response.json()
            
            print(f"Received response: {api_response}")
            
            # Validate that the response has the expected structure
            if not isinstance(api_response, dict):
                raise ValueError("API response is not a valid JSON object")
            
            # Check for required fields in response
            required_fields = ['candidateIdentifier', 'confidence', 'isExoplanet']
            missing_fields = [field for field in required_fields if field not in api_response]
            
            if missing_fields:
                print(f"Warning: Missing fields in API response: {missing_fields}")
                # You might want to handle this based on your API contract
            
            # Optional: Add default values for missing fields
            if 'candidateIdentifier' not in api_response:
                api_response['candidateIdentifier'] = validated_data["customIdentifier"]
            
            # Store the prediction in database
            prediction = Prediction(
                user_id=current_user._id,
                request_data=validated_data,
                response_data=api_response
            )
            
            if prediction.save():
                return jsonify({
                    'message': 'Prediction completed successfully',
                    'prediction': api_response,
                    'prediction_id': str(prediction._id)
                }), 200
            else:
                # Still return the prediction even if saving fails
                return jsonify({
                    'message': 'Prediction completed but failed to save to history',
                    'prediction': api_response
                }), 200
                
        except requests.exceptions.Timeout:
            return jsonify({
                'message': 'External API request timed out',
                'error': 'The ML prediction service did not respond within 30 seconds'
            }), 408
        except requests.exceptions.ConnectionError:
            return jsonify({
                'message': 'Failed to connect to prediction service', 
                'error': 'Unable to reach the ML prediction API'
            }), 503
        except requests.exceptions.HTTPError as e:
            error_details = f'HTTP {e.response.status_code}'
            try:
                error_response = e.response.json()
                error_details += f': {error_response.get("message", "Unknown error")}'
            except:
                error_details += f': {e.response.text[:200]}'
            
            return jsonify({
                'message': 'External API returned an error',
                'error': error_details
            }), 502
        except ValueError as e:
            return jsonify({
                'message': 'Invalid response from prediction service',
                'error': str(e)
            }), 502
        except Exception as e:
            print(f"Unexpected error calling external API: {str(e)}")
            
            # Check if we should use fallback mode
            use_fallback = current_app.config.get('USE_FALLBACK_PREDICTIONS', False)
            
            if use_fallback:
                print("Using fallback prediction logic...")
                api_response = create_fallback_response(validated_data)
            else:
                return jsonify({
                    'message': 'Unexpected error calling external API', 
                    'error': str(e),
                    'suggestion': 'Set USE_FALLBACK_PREDICTIONS=True in config to enable fallback mode'
                }), 500
            
    except Exception as e:
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@predictions_bp.route('/history', methods=['GET'])
@token_required
def get_prediction_history(current_user):
    """
    Get user's prediction history with pagination
    """
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 10)), 50)  # Max 50 per page
        skip = (page - 1) * limit
        
        # Get predictions for current user
        predictions = Prediction.find_by_user_id(current_user._id, limit=limit, skip=skip)
        total_count = Prediction.count_by_user_id(current_user._id)
        
        # Convert to dict format
        predictions_list = [prediction.to_dict() for prediction in predictions]
        
        return jsonify({
            'predictions': predictions_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }), 200
        
    except ValueError:
        return jsonify({'message': 'Invalid pagination parameters'}), 400
    except Exception as e:
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@predictions_bp.route('/history/<prediction_id>', methods=['GET'])
@token_required
def get_prediction_detail(current_user, prediction_id):
    """
    Get specific prediction details
    """
    try:
        prediction = Prediction.find_by_id(prediction_id)
        
        if not prediction:
            return jsonify({'message': 'Prediction not found'}), 404
        
        # Check if prediction belongs to current user
        if str(prediction.user_id) != str(current_user._id):
            return jsonify({'message': 'Access denied'}), 403
        
        return jsonify(prediction.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@predictions_bp.route('/stats', methods=['GET'])
@token_required
def get_prediction_stats(current_user):
    """
    Get user's prediction statistics
    """
    try:
        total_predictions = Prediction.count_by_user_id(current_user._id)
        
        # Get recent predictions to calculate stats
        recent_predictions = Prediction.find_by_user_id(current_user._id, limit=100)
        
        exoplanet_count = 0
        confidence_sum = 0
        planet_types = {}
        
        for prediction in recent_predictions:
            response_data = prediction.response_data
            if response_data.get('isExoplanet'):
                exoplanet_count += 1
            
            confidence = response_data.get('confidence', 0)
            confidence_sum += confidence
            
            planet_type = response_data.get('details', {}).get('planetType')
            if planet_type:
                planet_types[planet_type] = planet_types.get(planet_type, 0) + 1
        
        avg_confidence = confidence_sum / len(recent_predictions) if recent_predictions else 0
        
        return jsonify({
            'total_predictions': total_predictions,
            'confirmed_exoplanets': exoplanet_count,
            'average_confidence': round(avg_confidence, 3),
            'planet_type_distribution': planet_types
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@predictions_bp.route('/test-ml-api', methods=['GET'])
@token_required
def test_ml_api_connectivity(current_user):
    """
    Test connectivity to the external ML API
    """
    try:
        external_api_url = current_app.config['ML_API_URL']
        api_timeout = current_app.config['ML_API_TIMEOUT']
        
        # Test with minimal data or health check endpoint
        test_data = {
            "customIdentifier": "connectivity_test",
            "koi_period": 10.0,
            "koi_time0bk": 100.0,
            "koi_impact": 0.5,
            "koi_duration": 5.0,
            "koi_depth": 1000.0,
            "koi_prad": 1.0,
            "koi_teq": 300,
            "koi_insol": 1.0,
            "koi_model_snr": 10.0,
            "koi_steff": 5000,
            "koi_slogg": 4.0,
            "koi_srad": 1.0,
            "ra": 0.0,
            "dec": 0.0,
            "koi_kepmag": 15.0
        }
        
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Exoplanet-Research-Platform/1.0'
        }
        
        api_key = current_app.config.get('ML_API_KEY')
        if api_key:
            headers['Authorization'] = f'Bearer {api_key}'
        
        response = requests.post(
            external_api_url,
            json=test_data,
            timeout=api_timeout,
            headers=headers
        )
        
        return jsonify({
            'message': 'ML API connectivity test successful',
            'api_url': external_api_url,
            'status_code': response.status_code,
            'response_time_ms': response.elapsed.total_seconds() * 1000,
            'api_available': True
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({
            'message': 'ML API connectivity test failed - timeout',
            'api_url': external_api_url,
            'api_available': False,
            'error': 'Request timed out'
        }), 200
    except requests.exceptions.ConnectionError:
        return jsonify({
            'message': 'ML API connectivity test failed - connection error',
            'api_url': external_api_url,
            'api_available': False,
            'error': 'Unable to connect to API'
        }), 200
    except Exception as e:
        return jsonify({
            'message': 'ML API connectivity test failed',
            'api_url': external_api_url,
            'api_available': False,
            'error': str(e)
        }), 200

def create_fallback_response(validated_data):
    """
    Create a fallback response when external API is unavailable
    """
    import random
    
    # Generate a somewhat realistic prediction based on input parameters
    confidence = round(random.uniform(0.6, 0.95), 6)
    
    # Determine planet type based on radius
    radius = validated_data.get('koi_prad', 1.0)
    if radius < 1.25:
        planet_type = "Rocky Planet"
    elif radius < 2.0:
        planet_type = "Super-Earth"
    elif radius < 4.0:
        planet_type = "Mini-Neptune"
    else:
        planet_type = "Gas Giant"
    
    # Determine if it's likely an exoplanet (based on some basic criteria)
    period = validated_data.get('koi_period', 0)
    depth = validated_data.get('koi_depth', 0)
    snr = validated_data.get('koi_model_snr', 0)
    
    # Simple heuristic: good candidates have reasonable periods, detectable depth, and good SNR
    is_exoplanet = period > 0.5 and depth > 50 and snr > 7 and confidence > 0.7
    
    return {
        "candidateIdentifier": validated_data["customIdentifier"],
        "confidence": confidence,
        "details": {
            "equilibriumTempKelvin": validated_data["koi_teq"],
            "orbitalPeriodDays": validated_data["koi_period"],
            "planetName": None,
            "planetType": planet_type,
            "radiusEarth": validated_data["koi_prad"]
        },
        "isExoplanet": is_exoplanet,
        "note": "This prediction was generated using fallback logic due to ML API unavailability"
    }