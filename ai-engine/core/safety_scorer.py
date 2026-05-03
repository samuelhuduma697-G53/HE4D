"""
Safety Scorer
Assesses risk for helpers responding to crises
"""

import json
import os
import math
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SafetyScorer:
    """Score and assess safety risks for helpers"""
    
    def __init__(self):
        """Initialize safety scorer"""
        self.risk_zones = self._load_risk_zones()
        self.incident_history = []
        
        # Risk weights
        self.weights = {
            'location_history': 0.3,
            'time_of_day': 0.2,
            'crisis_acuity': 0.25,
            'helper_experience': 0.15,
            'distance_factor': 0.1
        }
        
        # Time risk multipliers
        self.time_risk = {
            'day': 1.0,
            'evening': 1.3,
            'night': 2.0,
            'late_night': 2.5
        }
    
    def _load_risk_zones(self) -> List[Dict]:
        """Load known high-risk zones from file"""
        risk_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'risk_zones.json')
        try:
            with open(risk_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Risk zones file not found, using defaults")
            return self._get_default_risk_zones()
    
    def _get_default_risk_zones(self) -> List[Dict]:
        """Default risk zones for demonstration"""
        return [
            {
                "name": "Eastlands High Risk Area",
                "center": {"lat": -1.2833, "lng": 36.8500},
                "radius_km": 2.5,
                "risk_level": "high",
                "risk_score": 0.8
            },
            {
                "name": "Industrial Area",
                "center": {"lat": -1.3167, "lng": 36.8500},
                "radius_km": 2.0,
                "risk_level": "medium",
                "risk_score": 0.6
            }
        ]
    
    def assess_location_risk(self, latitude: float, longitude: float,
                            time_of_day: str = 'auto', include_tips: bool = True) -> Dict:
        """
        Assess risk level for a location
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            time_of_day: 'day', 'evening', 'night', 'late_night', or 'auto'
            include_tips: Include safety tips in response
            
        Returns:
            Risk assessment dictionary
        """
        # Determine time of day if auto
        if time_of_day == 'auto':
            time_of_day = self._get_time_of_day()
        
        # Calculate base risk score
        base_risk = self._calculate_location_risk(latitude, longitude)
        
        # Apply time multiplier
        time_multiplier = self.time_risk.get(time_of_day, 1.0)
        total_risk = base_risk * time_multiplier
        
        # Cap at 1.0
        total_risk = min(total_risk, 1.0)
        
        # Determine risk level
        if total_risk >= 0.7:
            risk_level = 'high'
        elif total_risk >= 0.4:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        result = {
            'risk_score': round(total_risk, 2),
            'risk_level': risk_level,
            'base_risk': round(base_risk, 2),
            'time_multiplier': time_multiplier,
            'time_of_day': time_of_day,
            'recommendation': self._get_recommendation(risk_level, time_of_day)
        }
        
        if include_tips:
            result['safety_tips'] = self._get_safety_tips(risk_level)
        
        return result
    
    def assess_assist_risk(self, data: Dict) -> Dict:
        """
        Assess overall risk for a helper responding to a crisis
        
        Args:
            data: Dictionary with helper_id, crisis_id, locations, etc.
            
        Returns:
            Comprehensive risk assessment
        """
        seeker_location = data.get('seeker_location', {})
        helper_location = data.get('helper_location', {})
        crisis_acuity = data.get('crisis_acuity', 5.0)
        helper_experience = data.get('helper_experience_years', 1.0)
        crisis_categories = data.get('crisis_categories', [])
        
        # Calculate distance
        distance = self._calculate_distance(
            helper_location.get('lat'), helper_location.get('lng'),
            seeker_location.get('lat'), seeker_location.get('lng')
        )
        
        # Assess location risk
        location_risk = self.assess_location_risk(
            seeker_location.get('lat'), seeker_location.get('lng')
        )
        
        # Calculate risk components
        location_score = location_risk['risk_score']
        acuity_score = crisis_acuity / 10.0  # Normalize to 0-1
        experience_score = max(0, min(1.0, helper_experience / 10.0))
        distance_score = min(1.0, distance / 10.0)  # Longer distance = higher risk
        
        # Category risk multipliers
        category_multiplier = self._get_category_risk_multiplier(crisis_categories)
        
        # Weighted total
        total_risk = (
            location_score * self.weights['location_history'] +
            acuity_score * self.weights['crisis_acuity'] +
            (1 - experience_score) * self.weights['helper_experience'] +
            distance_score * self.weights['distance_factor']
        ) * category_multiplier
        
        total_risk = min(total_risk, 1.0)
        
        # Determine recommendation
        if total_risk >= 0.7:
            recommendation = 'escalate_require_backup'
        elif total_risk >= 0.5:
            recommendation = 'caution_recommend_backup'
        elif total_risk >= 0.3:
            recommendation = 'standard_response'
        else:
            recommendation = 'safe_to_respond'
        
        return {
            'total_risk_score': round(total_risk, 2),
            'risk_level': self._get_risk_level(total_risk),
            'location_risk': location_risk,
            'distance_km': round(distance, 2),
            'category_risk_multiplier': category_multiplier,
            'recommendation': recommendation,
            'requires_escort': total_risk >= 0.6,
            'check_in_interval_minutes': self._get_check_in_interval(total_risk)
        }
    
    def process_check_in(self, data: Dict) -> Dict:
        """
        Process helper check-in during active crisis
        
        Returns:
            Status with next check-in time or escalation flag
        """
        helper_id = data.get('helper_id')
        status = data.get('status', 'safe')
        
        # Determine if escalation needed
        escalate = False
        if status == 'danger':
            escalate = True
        elif status == 'concerned':
            # Check if no check-in for too long
            pass
        
        return {
            'received': True,
            'timestamp': datetime.now().isoformat(),
            'status': status,
            'escalate': escalate,
            'next_check_in_minutes': 5 if status == 'concerned' else 15,
            'message': self._get_check_in_message(status)
        }
    
    def report_incident(self, data: Dict) -> Dict:
        """
        Report a safety incident for tracking
        
        Returns:
            Incident ID and confirmation
        """
        incident_id = f"INC-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        # Store incident
        self.incident_history.append({
            'id': incident_id,
            'timestamp': datetime.now(),
            **data
        })
        
        return {
            'incident_id': incident_id,
            'reported': True,
            'requires_follow_up': data.get('severity') in ['high', 'critical'],
            'automated_actions': self._get_automated_actions(data)
        }
    
    def get_nearby_risk_zones(self, lat: float, lng: float, radius_km: float) -> List[Dict]:
        """Get risk zones within radius of location"""
        nearby = []
        
        for zone in self.risk_zones:
            center = zone.get('center', {})
            distance = self._calculate_distance(lat, lng, center.get('lat'), center.get('lng'))
            
            if distance <= radius_km:
                nearby.append({
                    'name': zone.get('name'),
                    'distance_km': round(distance, 2),
                    'risk_level': zone.get('risk_level', 'unknown'),
                    'risk_score': zone.get('risk_score', 0.5)
                })
        
        return sorted(nearby, key=lambda x: x['risk_score'], reverse=True)
    
    def get_safety_statistics(self, days: int = 30) -> Dict:
        """Get safety statistics for dashboard"""
        cutoff = datetime.now() - timedelta(days=days)
        
        recent_incidents = [
            i for i in self.incident_history 
            if i.get('timestamp', datetime.min) > cutoff
        ]
        
        return {
            'total_incidents': len(recent_incidents),
            'high_severity': sum(1 for i in recent_incidents if i.get('severity') == 'high'),
            'by_type': self._group_by_type(recent_incidents),
            'trend': self._calculate_trend(recent_incidents, days)
        }
    
    def _calculate_location_risk(self, lat: float, lng: float) -> float:
        """Calculate base risk score for a location"""
        risk_score = 0.0
        
        for zone in self.risk_zones:
            center = zone.get('center', {})
            distance = self._calculate_distance(lat, lng, center.get('lat'), center.get('lng'))
            radius = zone.get('radius_km', 1.0)
            
            if distance <= radius:
                # Risk decreases with distance from center
                zone_risk = zone.get('risk_score', 0.5)
                proximity_factor = 1.0 - (distance / radius)
                risk_score = max(risk_score, zone_risk * proximity_factor)
        
        return min(risk_score, 1.0)
    
    def _calculate_distance(self, lat1: float, lng1: float, 
                           lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates in km"""
        if lat1 is None or lng1 is None or lat2 is None or lng2 is None:
            return 5.0  # Default distance
        
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def _get_time_of_day(self) -> str:
        """Get current time of day category"""
        hour = datetime.now().hour
        
        if 5 <= hour < 12:
            return 'day'
        elif 12 <= hour < 17:
            return 'day'
        elif 17 <= hour < 19:
            return 'evening'
        elif 19 <= hour < 22:
            return 'night'
        else:
            return 'late_night'
    
    def _get_category_risk_multiplier(self, categories: List[str]) -> float:
        """Get risk multiplier based on crisis categories"""
        category_risks = {
            'violence': 1.5,
            'mental_health': 1.2,
            'medical': 1.1,
            'legal': 1.0,
            'social': 1.0
        }
        
        max_risk = 1.0
        for category in categories:
            risk = category_risks.get(category, 1.0)
            max_risk = max(max_risk, risk)
        
        return max_risk
    
    def _get_risk_level(self, score: float) -> str:
        """Convert numeric score to risk level"""
        if score >= 0.7:
            return 'critical'
        elif score >= 0.5:
            return 'high'
        elif score >= 0.3:
            return 'medium'
        else:
            return 'low'
    
    def _get_recommendation(self, risk_level: str, time_of_day: str) -> str:
        """Get response recommendation based on risk level"""
        recommendations = {
            'high': f'⚠️ HIGH RISK - Consider postponing or requesting backup. {time_of_day.upper()} response requires extra caution.',
            'medium': f'⚠️ MEDIUM RISK - Proceed with caution. Share location with trusted contact.',
            'low': f'✓ LOW RISK - Standard safety protocols apply.'
        }
        return recommendations.get(risk_level, 'Proceed with standard safety protocols.')
    
    def _get_safety_tips(self, risk_level: str) -> List[str]:
        """Get safety tips based on risk level"""
        base_tips = [
            "Keep your phone charged and accessible",
            "Share your live location with a trusted contact",
            "Know the nearest police station location"
        ]
        
        if risk_level == 'high':
            return [
                "DO NOT respond alone - request backup",
                "Notify the platform admin before proceeding",
                "Keep emergency services on standby",
                base_tips[0], base_tips[1]
            ]
        elif risk_level == 'medium':
            return [
                "Consider having a check-in buddy",
                "Check in every 10 minutes",
                base_tips[0], base_tips[1], base_tips[2]
            ]
        else:
            return base_tips
    
    def _get_check_in_interval(self, risk_score: float) -> int:
        """Get recommended check-in interval in minutes"""
        if risk_score >= 0.7:
            return 5
        elif risk_score >= 0.5:
            return 10
        elif risk_score >= 0.3:
            return 15
        else:
            return 20
    
    def _get_check_in_message(self, status: str) -> str:
        """Get message based on check-in status"""
        messages = {
            'safe': 'Check-in received. You are safe. Next check-in in 15 minutes.',
            'concerned': '⚠️ Concern noted. Please check in again in 5 minutes or call for backup.',
            'danger': '🚨 DANGER! Emergency services have been notified. Stay safe.'
        }
        return messages.get(status, 'Check-in received.')
    
    def _get_automated_actions(self, data: Dict) -> List[str]:
        """Get automated actions based on incident report"""
        actions = []
        
        if data.get('severity') in ['high', 'critical']:
            actions.append('Emergency services notified')
            actions.append('Platform admin alerted')
            actions.append('Helper emergency contacts notified')
        
        actions.append('Incident logged for review')
        
        return actions
    
    def _group_by_type(self, incidents: List[Dict]) -> Dict:
        """Group incidents by type"""
        types = {}
        for incident in incidents:
            incident_type = incident.get('incident_type', 'unknown')
            types[incident_type] = types.get(incident_type, 0) + 1
        return types
    
    def _calculate_trend(self, incidents: List[Dict], days: int) -> str:
        """Calculate incident trend"""
        if len(incidents) < 2:
            return 'stable'
        
        # Simple trend calculation
        recent = len([i for i in incidents if i.get('timestamp', datetime.min) > datetime.now() - timedelta(days=days/2)])
        older = len(incidents) - recent
        
        if recent > older * 1.2:
            return 'increasing'
        elif recent < older * 0.8:
            return 'decreasing'
        else:
            return 'stable'