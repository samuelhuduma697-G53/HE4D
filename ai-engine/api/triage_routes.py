"""
Crisis Triage Routes
Handles crisis text classification and acuity scoring
"""

from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from core.triage_logic import TriageEngine
from api.middleware import validate_text_length, log_request, rate_limit_by_user
import logging

logger = logging.getLogger(__name__)

triage_bp = Blueprint('triage', __name__)

# Initialize triage engine
triage_engine = TriageEngine()

@triage_bp.route('/classify', methods=['POST'])
@log_request
@validate_text_length
@rate_limit_by_user
def classify_crisis():
    """
    Classify crisis text and return acuity score
    
    Request body:
    {
        "text": "I'm feeling very anxious and scared...",
        "language": "auto" (optional),
        "include_explanations": true (optional)
    }
    
    Response:
    {
        "acuity_score": 8.5,
        "severity": "critical",
        "categories": ["mental_health", "anxiety"],
        "requires_immediate": true,
        "recommended_response": "Mental health counselor",
        "confidence": 0.92,
        "keywords": ["anxious", "scared", "overwhelmed"],
        "language_detected": "english"
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'auto')
        include_explanations = data.get('include_explanations', False)
        
        if not text or len(text.strip()) < 3:
            return jsonify({
                'error': 'Text must be at least 3 characters long'
            }), 400
        
        # Classify crisis
        result = triage_engine.classify(text, language, include_explanations)
        
        # Log classification
        logger.info(f'Classified crisis: acuity={result["acuity_score"]}, '
                   f'severity={result["severity"]}, '
                   f'language={result["language_detected"]}')
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f'Error classifying crisis: {str(e)}')
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@triage_bp.route('/classify/batch', methods=['POST'])
@log_request
def classify_batch():
    """
    Batch classify multiple crisis texts
    
    Request body:
    {
        "texts": [
            {"id": "1", "text": "Crisis text 1", "language": "auto"},
            {"id": "2", "text": "Crisis text 2", "language": "auto"}
        ]
    }
    """
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'No texts provided'}), 400
        
        results = []
        for item in texts:
            text = item.get('text', '')
            language = item.get('language', 'auto')
            
            if text and len(text.strip()) >= 3:
                result = triage_engine.classify(text, language, False)
                result['id'] = item.get('id')
                results.append(result)
        
        return jsonify({
            'results': results,
            'total': len(results),
            'processed': len(results)
        }), 200
        
    except Exception as e:
        logger.error(f'Error in batch classification: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@triage_bp.route('/extract-keywords', methods=['POST'])
@log_request
@validate_text_length
def extract_keywords():
    """
    Extract crisis keywords from text
    
    Request body:
    {
        "text": "I need help with my mental health...",
        "top_k": 10 (optional)
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        top_k = data.get('top_k', 10)
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        keywords = triage_engine.extract_keywords(text, top_k)
        
        return jsonify({
            'keywords': keywords,
            'count': len(keywords)
        }), 200
        
    except Exception as e:
        logger.error(f'Error extracting keywords: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@triage_bp.route('/detect-language', methods=['POST'])
@log_request
def detect_language():
    """
    Detect language of crisis text
    
    Request body:
    {
        "text": "Nahisi hofu na wasiwasi"
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        language = triage_engine.detect_language(text)
        
        return jsonify({
            'language': language,
            'confidence': 0.95 if language != 'unknown' else 0.0
        }), 200
        
    except Exception as e:
        logger.error(f'Error detecting language: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@triage_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for triage service"""
    return jsonify({
        'status': 'healthy',
        'service': 'triage',
        'model_loaded': triage_engine.is_loaded()
    }), 200