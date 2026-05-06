"""
Huduma Ecosystem - AI Engine Main Application
Flask server for crisis triage, language detection, and safety scoring
"""

import os
import logging
from flask import Flask
from flask_cors import CORS
# from flask_limiter import Limiter
# from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        # logging.FileHandler line removed for Railway
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_TEXT_LENGTH', 5000))

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure rate limiter
# limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])
# limiter.init_app(app)
# Import routes
from api.triage_routes import triage_bp
from api.health_routes import health_bp
from api.safety_routes import safety_bp

# Register blueprints
app.register_blueprint(triage_bp, url_prefix='/api/v1')
app.register_blueprint(health_bp, url_prefix='/api/v1')
app.register_blueprint(safety_bp, url_prefix='/api/v1')

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Endpoint not found'}, 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    return {'error': 'Rate limit exceeded', 'message': str(error.description)}, 429

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal server error: {error}')
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f'Starting AI Engine on port {port}')
    app.run(host='0.0.0.0', port=port, debug=debug)