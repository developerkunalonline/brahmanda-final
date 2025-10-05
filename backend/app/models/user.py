from datetime import datetime
from bson import ObjectId
import bcrypt
from app.database import get_db

class User:
    def __init__(self, username, email, password_hash, created_at=None, _id=None):
        self._id = _id  # Only set if provided (from database)
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': str(self._id),
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }
    
    def save(self):
        """Save user to database"""
        try:
            db = get_db()
            user_data = {
                'username': self.username,
                'email': self.email,
                'password_hash': self.password_hash,
                'created_at': self.created_at
            }
            
            # Check if this is an existing user by checking if _id exists in database
            existing_user = None
            if self._id:
                existing_user = db.users.find_one({'_id': self._id})
            
            if existing_user:
                # Update existing user
                result = db.users.update_one(
                    {'_id': self._id},
                    {'$set': user_data}
                )
                return result.modified_count > 0
            else:
                # Insert new user (don't include _id in insert data, let MongoDB generate it)
                result = db.users.insert_one(user_data)
                self._id = result.inserted_id
                return True
        except Exception as e:
            print(f"Error saving user: {str(e)}")
            return False
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        db = get_db()
        user_data = db.users.find_one({'email': email})
        
        if user_data:
            return User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=user_data['password_hash'],
                created_at=user_data['created_at'],
                _id=user_data['_id']
            )
        return None
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        db = get_db()
        user_data = db.users.find_one({'username': username})
        
        if user_data:
            return User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=user_data['password_hash'],
                created_at=user_data['created_at'],
                _id=user_data['_id']
            )
        return None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        db = get_db()
        try:
            user_data = db.users.find_one({'_id': ObjectId(user_id)})
            
            if user_data:
                return User(
                    username=user_data['username'],
                    email=user_data['email'],
                    password_hash=user_data['password_hash'],
                    created_at=user_data['created_at'],
                    _id=user_data['_id']
                )
        except Exception:
            pass
        return None
    
    @staticmethod
    def hash_password(password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches the hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))