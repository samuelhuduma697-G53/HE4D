"""
Language Detector
Detects between English, Swahili, Sheng, and other languages
"""

import re
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class LanguageDetector:
    """Detect language of crisis texts"""
    
    def __init__(self):
        """Initialize language detector with lexicons"""
        self.swahili_keywords = self._load_swahili_keywords()
        self.sheng_keywords = self._load_sheng_keywords()
        self.english_keywords = self._load_english_keywords()
        
        # Language detection thresholds
        self.thresholds = {
            'swahili': 0.3,
            'sheng': 0.2,
            'english': 0.3
        }
    
    def _load_swahili_keywords(self) -> set:
        """Load Swahili keywords"""
        return {
            'na', 'ya', 'wa', 'kwa', 'kwenye', 'kutoka', 'kwa', 'kwa',
            'msaada', 'shida', 'tatizo', 'hangaika', 'hofu', 'wasiwasi',
            'huzuni', 'uchungu', 'dhiki', 'hatari', 'vurugu', 'dhuluma',
            'kujiua', 'kujeruhi', 'mgomo', 'ugonjwa', 'maumivu', 'hospitali',
            'polisi', 'mahakama', 'kesi', 'nyumba', 'chakula', 'kazi',
            'elimu', 'afya', 'usaidizi', 'daktari', 'mwanasheria'
        }
    
    def _load_sheng_keywords(self) -> set:
        """Load Sheng (slang) keywords"""
        return {
            'madhee', 'fitina', 'kubaya', 'ngoma', 'kanyaga', 'choma',
            'bonga', 'songa', 'vibe', 'stress', 'pressure', 'tight',
            'bambi', 'juu', 'chini', 'noma', 'sawa', 'poa', 'freshi'
        }
    
    def _load_english_keywords(self) -> set:
        """Load English keywords"""
        return {
            'help', 'emergency', 'crisis', 'danger', 'hurt', 'pain',
            'anxiety', 'depressed', 'scared', 'afraid', 'worried',
            'suicide', 'kill', 'die', 'injury', 'bleeding', 'unconscious',
            'police', 'ambulance', 'hospital', 'lawyer', 'legal',
            'eviction', 'homeless', 'hungry', 'job', 'money'
        }
    
    def detect(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Input text
            
        Returns:
            'english', 'swahili', 'sheng', or 'unknown'
        """
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        if not words:
            return 'unknown'
        
        # Count keyword matches
        swahili_count = sum(1 for word in words if word in self.swahili_keywords)
        sheng_count = sum(1 for word in words if word in self.sheng_keywords)
        english_count = sum(1 for word in words if word in self.english_keywords)
        
        # Calculate ratios
        swahili_ratio = swahili_count / len(words)
        sheng_ratio = sheng_count / len(words)
        english_ratio = english_count / len(words)
        
        # Check for Sheng-specific patterns
        has_sheng_patterns = self._detect_sheng_patterns(text_lower)
        
        # Determine language
        scores = {
            'swahili': swahili_ratio,
            'sheng': sheng_ratio + (1.0 if has_sheng_patterns else 0),
            'english': english_ratio
        }
        
        # Find highest scoring language above threshold
        best_lang = 'unknown'
        best_score = 0
        
        for lang, score in scores.items():
            threshold = self.thresholds.get(lang, 0.2)
            if score > threshold and score > best_score:
                best_score = score
                best_lang = lang
        
        # Special case: If English has low score but not unknown, check Swahili
        if best_lang == 'english' and english_ratio < 0.15:
            if swahili_ratio > 0.2:
                return 'swahili'
        
        return best_lang
    
    def _detect_sheng_patterns(self, text: str) -> bool:
        """Detect Sheng-specific patterns"""
        sheng_patterns = [
            r'\bmadhee\b',
            r'\bfitina\b',
            r'\bkubaya\b',
            r'\bnoma\b',
            r'\b(?:ni|na|u)me\w+',
            r'\btight\b',
            r'\bpressure\b'
        ]
        
        for pattern in sheng_patterns:
            if re.search(pattern, text):
                return True
        
        return False
    
    def get_language_confidence(self, text: str) -> Dict[str, float]:
        """
        Get confidence scores for all languages
        
        Returns:
            Dictionary with language confidence scores
        """
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        if not words:
            return {'unknown': 1.0}
        
        swahili_count = sum(1 for word in words if word in self.swahili_keywords)
        sheng_count = sum(1 for word in words if word in self.sheng_keywords)
        english_count = sum(1 for word in words if word in self.english_keywords)
        
        total = len(words)
        
        return {
            'swahili': swahili_count / total if total > 0 else 0,
            'sheng': sheng_count / total if total > 0 else 0,
            'english': english_count / total if total > 0 else 0,
            'unknown': 0
        }