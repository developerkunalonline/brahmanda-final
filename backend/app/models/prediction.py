from datetime import datetime
from bson import ObjectId
from app.database import get_db

class Prediction:
    def __init__(self, user_id, request_data, response_data, created_at=None, _id=None):
        self._id = _id or ObjectId()
        self.user_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
        self.request_data = request_data
        self.response_data = response_data
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert prediction object to dictionary"""
        return {
            'id': str(self._id),
            'user_id': str(self.user_id),
            'request_data': self.request_data,
            'response_data': self.response_data,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }
    
    def save(self):
        """Save prediction to database"""
        db = get_db()
        prediction_data = {
            'user_id': self.user_id,
            'request_data': self.request_data,
            'response_data': self.response_data,
            'created_at': self.created_at
        }
        
        try:
            if self._id and db.predictions.find_one({'_id': self._id}):
                # Update existing prediction
                result = db.predictions.update_one(
                    {'_id': self._id},
                    {'$set': prediction_data}
                )
                return result.modified_count > 0
            else:
                # Insert new prediction
                result = db.predictions.insert_one(prediction_data)
                self._id = result.inserted_id
                return True
        except Exception as e:
            print(f"Error saving prediction: {str(e)}")
            return False
    
    @staticmethod
    def find_by_user_id(user_id, limit=50, skip=0):
        """Find predictions by user ID with pagination"""
        db = get_db()
        try:
            user_object_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
            cursor = db.predictions.find({'user_id': user_object_id})\
                                   .sort('created_at', -1)\
                                   .skip(skip)\
                                   .limit(limit)
            
            predictions = []
            for prediction_data in cursor:
                predictions.append(Prediction(
                    user_id=prediction_data['user_id'],
                    request_data=prediction_data['request_data'],
                    response_data=prediction_data['response_data'],
                    created_at=prediction_data['created_at'],
                    _id=prediction_data['_id']
                ))
            
            return predictions
        except Exception as e:
            print(f"Error finding predictions by user: {str(e)}")
            return []
    
    @staticmethod
    def count_by_user_id(user_id):
        """Count predictions by user ID"""
        db = get_db()
        try:
            user_object_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
            return db.predictions.count_documents({'user_id': user_object_id})
        except Exception as e:
            print(f"Error counting predictions: {str(e)}")
            return 0
    
    @staticmethod
    def find_by_id(prediction_id):
        """Find prediction by ID"""
        db = get_db()
        try:
            prediction_data = db.predictions.find_one({'_id': ObjectId(prediction_id)})
            
            if prediction_data:
                return Prediction(
                    user_id=prediction_data['user_id'],
                    request_data=prediction_data['request_data'],
                    response_data=prediction_data['response_data'],
                    created_at=prediction_data['created_at'],
                    _id=prediction_data['_id']
                )
        except Exception as e:
            print(f"Error finding prediction by ID: {str(e)}")
        return None