"""
Safety Routes for helper risk assessment
"""

from flask import Blueprint, request, jsonify
from core.safety_scorer import SafetyScorer
from api.middleware import validate_required_fields, log_request
import logging

logger = logging.getLogger(__name__)

safety_bp = Blueprint('safety', __name__)

# Initialize safety scorer
safety_scorer = SafetyScorer()

@safety_bp.route('/safety/assess-location', methods=['POST'])
@log_request
@validate_required_fields('latitude', 'longitude')
def assess_location():
    """
    Assess risk level for a location
    
    Request body:
    {
        "latitude": -1.2921,
        "longitude": 36.8219,
        "time_of_day": "night" (optional),
        "include_tips": true (optional)
    }
    """
    try:
        data = request.get_json()
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        time_of_day = data.get('time_of_day', 'auto')
        include_tips = data.get('include_tips', True)
        
        result = safety_scorer.assess_location_risk(
            latitude, longitude, time_of_day, include_tips
        )
        
        logger.info(f'Location risk assessment: score={result["risk_score"]}, '
                   f'level={result["risk_level"]}')
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f'Error assessing location risk: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@safety_bp.route('/safety/assist-request', methods=['POST'])
@log_request
@validate_required_fields('helper_id', 'crisis_id', 'seeker_location')
def assess_assist_request():
    """
    Assess safety risk for a helper responding to a crisis
    
    Request body:
    {
        "helper_id": "helper_123",
        "crisis_id": "crisis_456",
        "seeker_location": {"lat": -1.2921, "lng": 36.8219},
        "helper_location": {"lat": -1.3000, "lng": 36.8200},
        "crisis_acuity": 8.5,
        "crisis_categories": ["mental_health", "violence"]
    }
    """
    try:
        data = request.get_json()
        
        result = safety_scorer.assess_assist_risk(data)
        
        logger.info(f'Assist request risk assessment: score={result["total_risk_score"]}, '
                   f'recommendation={result["recommendation"]}')
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f'Error assessing assist request: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@safety_bp.route('/safety/check-in', methods=['POST'])
@log_request
@validate_required_fields('helper_id', 'session_id')
def check_in():
    """
    Process helper check-in during active crisis response
    
    Request body:
    {
        "helper_id": "helper_123",
        "session_id": "session_456",
        "location": {"lat": -1.2921, "lng": 36.8219},
        "status": "safe" | "concerned" | "danger"
    }
    """
    try:
        data = request.get_json()
        
        result = safety_scorer.process_check_in(data)
        
        logger.info(f'Check-in processed for helper {data["helper_id"]}: '
                   f'status={data.get("status", "unknown")}')
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f'Error processing check-in: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@safety_bp.route('/safety/risk-zones', methods=['GET'])
def get_risk_zones():
    """Get known high-risk zones"""
    try:
        radius = request.args.get('radius', 5000, type=float)
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        
        zones = safety_scorer.get_nearby_risk_zones(lat, lng, radius)
        
        return jsonify({
            'zones': zones,
            'count': len(zones)
        }), 200
        
    except Exception as e:
        logger.error(f'Error getting risk zones: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@safety_bp.route('/safety/incident-report', methods=['POST'])
@log_request
@validate_required_fields('helper_id', 'incident_type', 'description')
def report_incident():
    """
    Report a safety incident
    
    Request body:
    {
        "helper_id": "helper_123",
        "incident_type": "physical_threat",
        "description": "Seeker became aggressive...",
        "severity": "high",
        "location": {"lat": -1.2921, "lng": 36.8219}
    }
    """
    try:
        data = request.get_json()
        
        result = safety_scorer.report_incident(data)
        
        logger.warning(f'Safety incident reported: {data["incident_type"]} - '
                      f'helper {data["helper_id"]}')
        
        return jsonify(result), 201
        
    except Exception as e:
        logger.error(f'Error reporting incident: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@safety_bp.route('/safety/stats', methods=['GET'])
def get_safety_stats():
    """Get safety statistics for dashboard"""
    try:
        days = request.args.get('days', 30, type=int)
        
        stats = safety_scorer.get_safety_statistics(days)
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f'Error getting safety stats: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500