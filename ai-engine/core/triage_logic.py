"""
Main Triage Engine
Orchestrates crisis classification using ML and rule-based systems
"""

import json
import os
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging

from core.language_detector import LanguageDetector
from core.keyword_extractor import KeywordExtractor
from core.acuity_scorer import AcuityScorer
from core.preprocessor import TextPreprocessor

logger = logging.getLogger(__name__)

class TriageEngine:
    """Main triage engine for crisis classification"""
    
    def __init__(self):
        """Initialize the triage engine with all components"""
        self.preprocessor = TextPreprocessor()
        self.language_detector = LanguageDetector()
        self.keyword_extractor = KeywordExtractor()
        self.acuity_scorer = AcuityScorer()
        
        # Load crisis patterns
        self.crisis_patterns = self._load_crisis_patterns()
        
        # ML model (to be loaded if available)
        self.model = None
        self.embeddings = None
        self._load_ml_models()
        
        logger.info("TriageEngine initialized successfully")
    
    def _load_crisis_patterns(self) -> Dict:
        """Load crisis pattern definitions from JSON"""
        pattern_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'crisis_patterns.json')
        try:
            with open(pattern_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Crisis patterns file not found, using defaults")
            return self._get_default_patterns()
    
    def _get_default_patterns(self) -> Dict:
        """Default crisis patterns if file not found"""
        return {
            "mental_health": {
                "keywords": ["anxiety", "depression", "suicide", "hopeless", "panic", "scared", "fear"],
                "weight": 1.5,
                "recommended_helper": "Mental Health Counselor"
            },
            "violence": {
                "keywords": ["abuse", "assault", "danger", "threat", "hurt", "attack", "violent"],
                "weight": 2.0,
                "recommended_helper": "Crisis Intervention Specialist"
            },
            "legal": {
                "keywords": ["lawyer", "legal", "court", "arrest", "custody", "rights"],
                "weight": 1.2,
                "recommended_helper": "Legal Professional"
            },
            "medical": {
                "keywords": ["injury", "pain", "bleeding", "sick", "hospital", "medical"],
                "weight": 1.8,
                "recommended_helper": "Medical Professional"
            },
            "social": {
                "keywords": ["eviction", "homeless", "food", "money", "job", "housing"],
                "weight": 1.0,
                "recommended_helper": "Social Worker"
            }
        }
    
    def _load_ml_models(self):
        """Load ML models if available"""
        try:
            # Attempt to load transformer model
            from transformers import AutoModelForSequenceClassification, AutoTokenizer
            
            model_path = os.getenv('AFRIBARTA_MODEL_PATH', './models/afribarta')
            
            if os.path.exists(model_path):
                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
                logger.info("AfriBERTa model loaded successfully")
            else:
                logger.info("AfriBERTa model not found, using rule-based only")
                
        except Exception as e:
            logger.warning(f"Could not load ML models: {str(e)}")
            self.model = None
    
    def is_loaded(self) -> bool:
        """Check if engine is properly initialized"""
        return True  # Always true for rule-based
    
    def classify(self, text: str, language: str = 'auto', 
                 include_explanations: bool = False) -> Dict:
        """
        Classify crisis text and return comprehensive analysis
        
        Args:
            text: Crisis description text
            language: 'auto', 'english', 'swahili', or 'sheng'
            include_explanations: Whether to include detailed explanations
            
        Returns:
            Dictionary with classification results
        """
        # Preprocess text
        cleaned_text = self.preprocessor.clean(text)
        
        # Detect language if auto
        detected_language = language
        if language == 'auto':
            detected_language = self.language_detector.detect(cleaned_text)
        
        # Extract keywords
        keywords = self.keyword_extractor.extract(cleaned_text, top_k=15)
        
        # Determine crisis categories
        categories, category_scores = self._determine_categories(cleaned_text, keywords)
        
        # Calculate acuity score
        acuity_score, severity = self.acuity_scorer.calculate_score(
            cleaned_text, keywords, categories, category_scores
        )
        
        # Determine if immediate response required
        requires_immediate = self._check_immediate_response(cleaned_text, keywords, acuity_score)
        
        # Get recommended helper type
        recommended_helper = self._get_recommended_helper(categories, acuity_score)
        
        # Build response
        result = {
            'acuity_score': round(acuity_score, 2),
            'severity': severity,
            'categories': categories,
            'category_scores': category_scores if include_explanations else None,
            'requires_immediate': requires_immediate,
            'recommended_response': recommended_helper,
            'confidence': self._calculate_confidence(categories, category_scores),
            'keywords': keywords[:10],
            'language_detected': detected_language,
            'text_length': len(cleaned_text)
        }
        
        # Add ML prediction if available
        if self.model and not include_explanations:  # Only use ML for speed-critical
            ml_result = self._ml_predict(cleaned_text)
            if ml_result:
                result['ml_confidence'] = ml_result.get('confidence')
        
        return result
    
    def _determine_categories(self, text: str, keywords: List[str]) -> Tuple[List[str], Dict]:
        """Determine crisis categories from text and keywords"""
        categories = []
        category_scores = {}
        
        for category, pattern in self.crisis_patterns.items():
            score = 0
            
            # Check keyword matches
            for keyword in keywords:
                if keyword.lower() in pattern.get('keywords', []):
                    score += pattern.get('weight', 1.0)
            
            # Check for phrases in text
            for phrase in pattern.get('phrases', []):
                if phrase.lower() in text.lower():
                    score += pattern.get('weight', 1.0) * 1.5
            
            if score > 0:
                categories.append(category)
                category_scores[category] = min(score, 10.0)
        
        # Sort by score
        categories.sort(key=lambda c: category_scores.get(c, 0), reverse=True)
        
        # Limit to top 3 categories
        categories = categories[:3]
        
        if not categories:
            categories = ['general_distress']
            category_scores['general_distress'] = 2.0
        
        return categories, category_scores
    
    def _check_immediate_response(self, text: str, keywords: List[str], acuity_score: float) -> bool:
        """Check if crisis requires immediate response"""
        emergency_indicators = [
            'suicide', 'kill', 'die', 'emergency', 'immediate', 'danger',
            'kujiua', 'kuua', 'hatari', 'dharura'
        ]
        
        # Check for emergency keywords
        for indicator in emergency_indicators:
            if indicator in text.lower():
                return True
        
        # Check acuity threshold
        if acuity_score >= 8.0:
            return True
        
        return False
    
    def _get_recommended_helper(self, categories: List[str], acuity_score: float) -> str:
        """Get recommended helper type based on categories"""
        if acuity_score >= 9.0:
            return "Emergency Services + Crisis Team"
        
        helper_map = {
            'mental_health': 'Mental Health Counselor',
            'violence': 'Crisis Intervention Specialist',
            'legal': 'Legal Professional',
            'medical': 'Medical Professional',
            'social': 'Social Worker'
        }
        
        for category in categories:
            if category in helper_map:
                return helper_map[category]
        
        return "General Crisis Support"
    
    def _calculate_confidence(self, categories: List[str], category_scores: Dict) -> float:
        """Calculate confidence score for classification"""
        if not categories:
            return 0.5
        
        # Higher confidence when top category has significantly higher score
        if len(categories) >= 2:
            top_score = category_scores.get(categories[0], 0)
            second_score = category_scores.get(categories[1], 0)
            
            if second_score > 0:
                ratio = top_score / second_score
                if ratio > 2:
                    return 0.9
                elif ratio > 1.5:
                    return 0.8
        
        return 0.7
    
    def _ml_predict(self, text: str) -> Optional[Dict]:
        """Use ML model for prediction if available"""
        if not self.model:
            return None
        
        try:
            inputs = self.tokenizer(text, return_tensors='pt', 
                                   truncation=True, max_length=512)
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = np.exp(logits.detach().numpy()) / np.sum(np.exp(logits.detach().numpy()))
            
            return {
                'acuity_prediction': float(probabilities[0][1]),
                'confidence': float(np.max(probabilities))
            }
        except Exception as e:
            logger.error(f"ML prediction failed: {str(e)}")
            return None
    
    def extract_keywords(self, text: str, top_k: int = 10) -> List[str]:
        """Extract keywords from text"""
        cleaned_text = self.preprocessor.clean(text)
        return self.keyword_extractor.extract(cleaned_text, top_k)
    
    def detect_language(self, text: str) -> str:
        """Detect language of text"""
        cleaned_text = self.preprocessor.clean(text)
        return self.language_detector.detect(cleaned_text)