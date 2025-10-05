from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, ValidationError
import re
from app.models.user import User
from app.utils.auth import generate_token, token_required

auth_bp = Blueprint('auth', __name__)

class SignupSchema(Schema):
    username = fields.Str(required=True, validate=lambda x: len(x.strip()) >= 3, 
                         error_messages={'required': 'Username is required'})
    email = fields.Email(required=True, error_messages={'required': 'Email is required'})
    password = fields.Str(required=True, validate=lambda x: len(x) >= 6,
                         error_messages={'required': 'Password is required'})

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Validate input data
        schema = SignupSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return jsonify({'message': 'Validation error', 'errors': err.messages}), 400
        
        username = validated_data['username'].strip()
        email = validated_data['email'].lower().strip()
        password = validated_data['password']
        
        # Additional password validation
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists by email
        existing_user_email = User.find_by_email(email)
        if existing_user_email:
            return jsonify({'message': 'User with this email already exists'}), 409
        
        # Check if user already exists by username
        existing_user_username = User.find_by_username(username)
        if existing_user_username:
            return jsonify({'message': 'Username already taken'}), 409
        
        # Hash password
        password_hash = User.hash_password(password)
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password_hash=password_hash
        )
        
        # Save user to database
        try:
            if new_user.save():
                # Generate JWT token
                token = generate_token(new_user._id)
                
                # Return success response
                return jsonify({
                    'message': 'User created successfully',
                    'user': new_user.to_dict(),
                    'access_token': token,
                    'token_type': 'Bearer'
                }), 201
            else:
                return jsonify({'message': 'Failed to create user - database error'}), 500
        except Exception as save_error:
            print(f"Save error: {str(save_error)}")
            return jsonify({'message': f'Failed to create user: {str(save_error)}'}), 500
            
    except Exception as e:
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        # Handle both JSON and form data (for compatibility with frontend)
        if request.is_json:
            data = request.get_json()
        else:
            # Handle form data (application/x-www-form-urlencoded)
            data = {
                'email': request.form.get('username'),  # Frontend sends email as 'username'
                'password': request.form.get('password')
            }
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Validate input data
        schema = LoginSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return jsonify({'message': 'Validation error', 'errors': err.messages}), 400
        
        email = validated_data['email'].lower().strip()
        password = validated_data['password']
        
        # Find user by email
        user = User.find_by_email(email)
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Check password
        if not user.check_password(password):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate JWT token
        token = generate_token(user._id)
        
        return jsonify({
            'access_token': token,
            'token_type': 'Bearer',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500

@auth_bp.route('/users/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user profile"""
    return jsonify(current_user.to_dict()), 200

@auth_bp.route('/test', methods=['GET'])
def test():
    """Test endpoint to verify the API is working"""
    return jsonify({
        'message': 'Exoplanet Research Platform API is running!',
        'version': '1.0.0',
        'status': 'healthy'
    }), 200