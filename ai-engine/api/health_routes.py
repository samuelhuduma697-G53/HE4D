"""
Health Check Routes for monitoring
"""

from flask import Blueprint, jsonify
import psutil
import os
import time

health_bp = Blueprint('health', __name__)

start_time = time.time()

@health_bp.route('/health', methods=['GET'])
def health():
    """Main health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'service': 'ai-engine'
    }), 200

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health():
    """Detailed health check with system metrics"""
    process = psutil.Process(os.getpid())
    
    return jsonify({
        'status': 'healthy',
        'uptime': time.time() - start_time,
        'memory_usage_mb': process.memory_info().rss / 1024 / 1024,
        'cpu_percent': process.cpu_percent(interval=0.1),
        'threads': process.num_threads(),
        'timestamp': time.time()
    }), 200

@health_bp.route('/health/models', methods=['GET'])
def models_health():
    """Check if ML models are loaded"""
    from core.triage_logic import triage_engine
    
    return jsonify({
        'afribarta_loaded': hasattr(triage_engine, 'model') and triage_engine.model is not None,
        'embeddings_loaded': hasattr(triage_engine, 'embeddings') and triage_engine.embeddings is not None,
        'lexicons_loaded': hasattr(triage_engine, 'crisis_patterns') and triage_engine.crisis_patterns is not None
    }), 200

@health_bp.route('/readiness', methods=['GET'])
def readiness():
    """Kubernetes readiness probe"""
    from core.triage_logic import triage_engine
    
    if triage_engine.is_loaded():
        return jsonify({'status': 'ready'}), 200
    else:
        return jsonify({'status': 'not ready', 'reason': 'models not loaded'}), 503

@health_bp.route('/liveness', methods=['GET'])
def liveness():
    """Kubernetes liveness probe"""
    return jsonify({'status': 'alive'}), 200