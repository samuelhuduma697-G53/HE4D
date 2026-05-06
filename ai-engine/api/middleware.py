"""
API Middleware for request validation and authentication
"""

import time
import hashlib
import hmac
from functools import wraps
from flask import request, jsonify, current_app
import logging

logger = logging.getLogger(__name__)

def validate_text_length(f):
    """Validate that input text doesn't exceed maximum length"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json() or {}
        text = data.get('text', '')
        
        max_length = current_app.config.get('MAX_CONTENT_LENGTH', 5000)
        
        if len(text) > max_length:
            return jsonify({
                'error': f'Text exceeds maximum length of {max_length} characters',
                'length': len(text),
                'max_length': max_length
            }), 400
            
        return f(*args, **kwargs)
    return decorated_function

def validate_required_fields(*required_fields):
    """Validate that required fields are present in request"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json() or {}
            missing_fields = []
            
            for field in required_fields:
                if field not in data:
                    missing_fields.append(field)
                    
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing': missing_fields
                }), 400
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def api_key_required(f):
    """Validate API key for external calls"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        expected_key = current_app.config.get('API_KEY')
        
        if expected_key and api_key != expected_key:
            return jsonify({'error': 'Invalid API key'}), 401
            
        return f(*args, **kwargs)
    return decorated_function

def log_request(f):
    """Log incoming requests for monitoring"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        # Log request
        logger.info(f'Request: {request.method} {request.path} from {request.remote_addr}')
        
        # Process request
        response = f(*args, **kwargs)
        
        # Log response time
        elapsed = time.time() - start_time
        logger.info(f'Response time: {elapsed:.3f}s for {request.path}')
        
        return response
    return decorated_function

def rate_limit_by_user(f):
    """Apply rate limiting based on user ID or IP"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user identifier from header or IP
        user_id = request.headers.get('X-User-ID', request.remote_addr)
        

        request.environ['RATELIMIT_KEY'] = user_id
        
        return f(*args, **kwargs)
    return decorated_function