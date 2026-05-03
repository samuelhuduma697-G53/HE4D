"""
Acuity Scorer
Calculates crisis severity score (0-10) based on multiple factors
"""

import re
import math
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class AcuityScorer:
    """Calculate acuity scores for crisis texts"""
    
    def __init__(self):
        """Initialize acuity scorer with weights and thresholds"""
        # Severity weights for different factors
        self.weights = {
            'emergency_keywords': 3.0,
            'violence_keywords': 2.5,
            'self_harm_keywords': 3.5,
            'medical_keywords': 2.0,
            'distress_keywords': 1.5,
            'text_length': 0.5,
            'exclamation_marks': 1.0,
            'urgency_indicators': 2.0
        }
        
        # Keyword categories
        self.emergency_keywords = [
            'emergency', 'urgent', 'immediate', 'crisis', 'help now',
            'dharura', 'haraka', 'msaada sasa'
        ]
        
        self.violence_keywords = [
            'violence', 'attack', 'threat', 'danger', 'hurt', 'abuse',
            'vurugu', 'shambulio', 'hatari', 'dhuluma'
        ]
        
        self.self_harm_keywords = [
            'suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself',
            'kujiua', 'kujiumiza', 'maisha yangu'
        ]
        
        self.medical_keywords = [
            'bleeding', 'unconscious', 'seizure', 'heart attack', 'difficulty breathing',
            'damu', 'fahamu', 'mshtuko', 'kupumua'
        ]
        
        self.distress_keywords = [
            'anxious', 'depressed', 'scared', 'hopeless', 'overwhelmed',
            'wasiwasi', 'hofu', 'huzuni', 'kukata tamaa'
        ]
        
        self.urgency_indicators = [
            '!!!', '!!', '!!!', 'asap', 'now', 'immediately',
            'sasa', 'mara moja'
        ]
        
        # Severity thresholds
        self.severity_thresholds = {
            'critical': (8.0, 10.0),
            'high': (6.0, 8.0),
            'moderate': (4.0, 6.0),
            'low': (0.0, 4.0)
        }
    
    def calculate_score(self, text: str, keywords: List[str], 
                       categories: List[str], category_scores: Dict) -> Tuple[float, str]:
        """
        Calculate acuity score (0-10) and severity level
        
        Args:
            text: Original crisis text
            keywords: Extracted keywords
            categories: Detected crisis categories
            category_scores: Scores for each category
            
        Returns:
            Tuple of (acuity_score, severity_level)
        """
        score = 0.0
        
        # 1. Check emergency keywords
        emergency_count = self._count_keywords(text, self.emergency_keywords)
        score += emergency_count * self.weights['emergency_keywords']
        
        # 2. Check violence keywords
        violence_count = self._count_keywords(text, self.violence_keywords)
        score += violence_count * self.weights['violence_keywords']
        
        # 3. Check self-harm keywords (highest weight)
        self_harm_count = self._count_keywords(text, self.self_harm_keywords)
        score += self_harm_count * self.weights['self_harm_keywords']
        
        # 4. Check medical keywords
        medical_count = self._count_keywords(text, self.medical_keywords)
        score += medical_count * self.weights['medical_keywords']
        
        # 5. Check distress keywords
        distress_count = self._count_keywords(text, self.distress_keywords)
        score += distress_count * self.weights['distress_keywords']
        
        # 6. Text length factor (longer texts often more detailed crises)
        length_score = min(len(text) / 500, 2.0)
        score += length_score * self.weights['text_length']
        
        # 7. Exclamation marks indicator
        exclamation_count = text.count('!')
        score += min(exclamation_count, 3) * self.weights['exclamation_marks']
        
        # 8. Urgency indicators
        urgency_count = self._count_keywords(text.lower(), self.urgency_indicators)
        score += urgency_count * self.weights['urgency_indicators']
        
        # 9. Category scores contribution
        for category, cat_score in category_scores.items():
            score += cat_score * 0.5
        
        # Cap at 10.0
        score = min(score, 10.0)
        
        # Determine severity level
        severity = self._get_severity_level(score)
        
        return score, severity
    
    def _count_keywords(self, text: str, keywords: List[str]) -> int:
        """Count occurrences of keywords in text"""
        text_lower = text.lower()
        count = 0
        for keyword in keywords:
            count += text_lower.count(keyword)
        return count
    
    def _get_severity_level(self, score: float) -> str:
        """Get severity level based on score"""
        for level, (min_score, max_score) in self.severity_thresholds.items():
            if min_score <= score < max_score:
                return level
        return 'low'
    
    def calculate_match_score(self, acuity_score: float, distance_km: float, 
                             trust_score: float, specialization_match: float) -> float:
        """
        Calculate match score between crisis and helper
        
        Args:
            acuity_score: Crisis acuity (0-10)
            distance_km: Distance to crisis location
            trust_score: Helper trust score (0-5)
            specialization_match: Specialization match (0-1)
            
        Returns:
            Match score (higher is better)
        """
        # Acuity contribution (higher acuity needs faster response)
        acuity_contribution = acuity_score * 10  # 0-100
        
        # Distance penalty (farther is worse)
        distance_penalty = min(distance_km * 0.5, 30)  # Max 30 point penalty
        
        # Trust contribution
        trust_contribution = trust_score * 10  # 0-50
        
        # Specialization contribution
        specialization_contribution = specialization_match * 20  # 0-20
        
        # Calculate final score
        match_score = acuity_contribution + trust_contribution + specialization_contribution - distance_penalty
        
        # Normalize to 0-100
        match_score = max(0, min(match_score, 100))
        
        return match_score
    
    def calculate_risk_escalation(self, acuity_score: float, 
                                  response_time_minutes: int,
                                  location_risk: float) -> str:
        """
        Determine if a crisis should be escalated
        
        Args:
            acuity_score: Current acuity score
            response_time_minutes: Time since crisis reported
            location_risk: Location risk score (0-1)
            
        Returns:
            Escalation level: 'none', 'warning', 'critical', 'emergency'
        """
        escalation_score = acuity_score
        
        # Increase escalation based on response delay
        if response_time_minutes > 15:
            escalation_score += 2
        elif response_time_minutes > 10:
            escalation_score += 1
        
        # Add location risk
        escalation_score += location_risk * 3
        
        if escalation_score >= 9.0:
            return 'emergency'
        elif escalation_score >= 7.0:
            return 'critical'
        elif escalation_score >= 5.0:
            return 'warning'
        else:
            return 'none'