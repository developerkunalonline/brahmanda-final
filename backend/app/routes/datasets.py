from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, ValidationError
from app.database import get_db
from app.utils.auth import token_required
from bson import ObjectId
import math

datasets_bp = Blueprint('datasets', __name__)

class PaginationSchema(Schema):
    page = fields.Int(missing=1, validate=lambda x: x >= 1)
    limit = fields.Int(missing=12, validate=lambda x: 1 <= x <= 50)

@datasets_bp.route('/kepler', methods=['GET'])
@token_required
def get_kepler_data(current_user):
    """
    Get Kepler dataset with pagination
    Default: 12 items per page
    """
    try:
        # Validate query parameters
        schema = PaginationSchema()
        try:
            params = schema.load(request.args.to_dict())
        except ValidationError as err:
            return jsonify({'message': 'Invalid parameters', 'errors': err.messages}), 400
        
        page = params['page']
        limit = params['limit']
        skip = (page - 1) * limit
        
        # Get database connection
        db = get_db()
        kepler_collection = db.kepler_dataset
        
        # Get total count for pagination info
        total_count = kepler_collection.count_documents({})
        
        # Calculate total pages
        total_pages = math.ceil(total_count / limit) if total_count > 0 else 0
        
        # Get paginated data
        kepler_data = list(kepler_collection.find({}).skip(skip).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for item in kepler_data:
            item['_id'] = str(item['_id'])
        
        return jsonify({
            'data': kepler_data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_items': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'dataset_info': {
                'name': 'Kepler Objects of Interest',
                'description': 'Planetary candidates and confirmed planets from the Kepler mission',
                'source': 'NASA Exoplanet Archive'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Error retrieving Kepler data', 
            'error': str(e)
        }), 500

@datasets_bp.route('/tess', methods=['GET'])
@token_required
def get_tess_data(current_user):
    """
    Get TESS dataset with pagination
    Default: 12 items per page
    """
    try:
        # Validate query parameters
        schema = PaginationSchema()
        try:
            params = schema.load(request.args.to_dict())
        except ValidationError as err:
            return jsonify({'message': 'Invalid parameters', 'errors': err.messages}), 400
        
        page = params['page']
        limit = params['limit']
        skip = (page - 1) * limit
        
        # Get database connection
        db = get_db()
        tess_collection = db.tess_dataset
        
        # Get total count for pagination info
        total_count = tess_collection.count_documents({})
        
        # Calculate total pages
        total_pages = math.ceil(total_count / limit) if total_count > 0 else 0
        
        # Get paginated data
        tess_data = list(tess_collection.find({}).skip(skip).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for item in tess_data:
            item['_id'] = str(item['_id'])
        
        return jsonify({
            'data': tess_data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_items': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'dataset_info': {
                'name': 'TESS Objects of Interest',
                'description': 'Planetary candidates from the Transiting Exoplanet Survey Satellite',
                'source': 'NASA Exoplanet Archive'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Error retrieving TESS data', 
            'error': str(e)
        }), 500

@datasets_bp.route('/kepler/<item_id>', methods=['GET'])
@token_required
def get_kepler_item(current_user, item_id):
    """
    Get specific Kepler object by ID
    """
    try:
        # Get database connection
        db = get_db()
        kepler_collection = db.kepler_dataset
        
        # Find item by ID
        try:
            object_id = ObjectId(item_id)
        except:
            return jsonify({'message': 'Invalid item ID format'}), 400
        
        item = kepler_collection.find_one({'_id': object_id})
        
        if not item:
            return jsonify({'message': 'Kepler object not found'}), 404
        
        # Convert ObjectId to string
        item['_id'] = str(item['_id'])
        
        return jsonify({
            'data': item,
            'dataset_info': {
                'name': 'Kepler Objects of Interest',
                'type': 'kepler'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Error retrieving Kepler object', 
            'error': str(e)
        }), 500

@datasets_bp.route('/tess/<item_id>', methods=['GET'])
@token_required
def get_tess_item(current_user, item_id):
    """
    Get specific TESS object by ID
    """
    try:
        # Get database connection
        db = get_db()
        tess_collection = db.tess_dataset
        
        # Find item by ID
        try:
            object_id = ObjectId(item_id)
        except:
            return jsonify({'message': 'Invalid item ID format'}), 400
        
        item = tess_collection.find_one({'_id': object_id})
        
        if not item:
            return jsonify({'message': 'TESS object not found'}), 404
        
        # Convert ObjectId to string
        item['_id'] = str(item['_id'])
        
        return jsonify({
            'data': item,
            'dataset_info': {
                'name': 'TESS Objects of Interest',
                'type': 'tess'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Error retrieving TESS object', 
            'error': str(e)
        }), 500

@datasets_bp.route('/search', methods=['GET'])
@token_required
def search_datasets(current_user):
    """
    Search across both Kepler and TESS datasets
    """
    try:
        query = request.args.get('query', '').strip()
        
        if not query:
            return jsonify({'message': 'Search query is required'}), 400
        
        # Get database connection
        db = get_db()
        
        # Search in Kepler dataset
        kepler_results = list(db.kepler_dataset.find({
            '$or': [
                {'kepoi_name': {'$regex': query, '$options': 'i'}},
                {'kepler_name': {'$regex': query, '$options': 'i'}},
                {'kepid': {'$regex': str(query), '$options': 'i'}}
            ]
        }).limit(10))
        
        # Search in TESS dataset
        tess_results = list(db.tess_dataset.find({
            '$or': [
                {'toi': {'$regex': str(query), '$options': 'i'}},
                {'ctoi_alias': {'$regex': str(query), '$options': 'i'}},
                {'tid': {'$regex': str(query), '$options': 'i'}}
            ]
        }).limit(10))
        
        # Convert ObjectIds to strings
        for item in kepler_results:
            item['_id'] = str(item['_id'])
        for item in tess_results:
            item['_id'] = str(item['_id'])
        
        return jsonify({
            'query': query,
            'results': {
                'kepler': kepler_results,
                'tess': tess_results
            },
            'total_found': {
                'kepler': len(kepler_results),
                'tess': len(tess_results),
                'combined': len(kepler_results) + len(tess_results)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Error searching datasets', 
            'error': str(e)
        }), 500

@datasets_bp.route('/stats', methods=['GET'])
@token_required
def get_dataset_stats(current_user):
    """
    Get statistics about both datasets
    """
    try:
        # Get database connection
        db = get_db()
        
        # Get collection stats
        kepler_count = db.kepler_dataset.count_documents({})
        tess_count = db.tess_dataset.count_documents({})
        
        # Get confirmed vs candidate counts for Kepler
        kepler_confirmed = db.kepler_dataset.count_documents({
            'koi_disposition': 'CONFIRMED'
        })
        kepler_candidates = db.kepler_dataset.count_documents({
            'koi_disposition': 'CANDIDATE'
        })
        kepler_false_positives = db.kepler_dataset.count_documents({
            'koi_disposition': 'FALSE POSITIVE'
        })
        
        # Get disposition stats for TESS
        tess_pc = db.tess_dataset.count_documents({
            'tfopwg_disp': 'PC'  # Planet Candidate
        })
        tess_fp = db.tess_dataset.count_documents({
            'tfopwg_disp': 'FP'  # False Positive
        })
        
        return jsonify({
            'kepler_dataset': {
                'total_objects': kepler_count,
                'confirmed_planets': kepler_confirmed,
                'candidates': kepler_candidates,
                'false_positives': kepler_false_positives,
                'disposition_breakdown': {
                    'CONFIRMED': kepler_confirmed,
                    'CANDIDATE': kepler_candidates,
                    'FALSE POSITIVE': kepler_false_positives
                }
            },
            'tess_dataset': {
                'total_objects': tess_count,
                'planet_candidates': tess_pc,
                'false_positives': tess_fp,
                'disposition_breakdown': {
                    'PC': tess_pc,
                    'FP': tess_fp
                }
            },
            'combined_stats': {
                'total_objects': kepler_count + tess_count,
                'total_confirmed_planets': kepler_confirmed,
                'total_candidates': kepler_candidates + tess_pc
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Error retrieving dataset statistics', 
            'error': str(e)
        }), 500