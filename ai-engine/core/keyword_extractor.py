"""
Keyword Extractor
Extracts crisis-relevant keywords from text
"""

import re
import math
from collections import Counter
from typing import List, Dict, Set
import logging

logger = logging.getLogger(__name__)

class KeywordExtractor:
    """Extract keywords from crisis texts"""
    
    def __init__(self):
        """Initialize keyword extractor with stopwords and weights"""
        self.stopwords = self._load_stopwords()
        self.crisis_weights = self._load_crisis_weights()
        
        # TF-IDF cache for efficiency
        self.document_frequency = {}
        self.total_documents = 0
    
    def _load_stopwords(self) -> Set[str]:
        """Load stopwords for multiple languages"""
        stopwords = {
            # English stopwords
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'were', 'will', 'with',
            
            # Swahili stopwords
            'na', 'ya', 'wa', 'kwa', 'kwenye', 'kutoka', 'kwa', 'kwa',
            'ni', 'cha', 'vya', 'la', 'za', 'katika', 'kwa', 'kwa'
        }
        return stopwords
    
    def _load_crisis_weights(self) -> Dict[str, float]:
        """Load crisis keyword weights"""
        return {
            # Mental health (high weight)
            'suicide': 3.0, 'kill': 3.0, 'die': 3.0,
            'anxiety': 2.0, 'depression': 2.0, 'panic': 2.0,
            'scared': 2.0, 'fear': 2.0, 'hopeless': 2.0,
            
            # Violence (high weight)
            'violence': 2.5, 'abuse': 2.5, 'assault': 2.5,
            'threat': 2.0, 'danger': 2.0, 'hurt': 2.0,
            
            # Medical (medium-high weight)
            'bleeding': 2.5, 'unconscious': 3.0, 'seizure': 2.5,
            'pain': 1.5, 'injury': 2.0,
            
            # Legal (medium weight)
            'legal': 1.5, 'court': 1.5, 'lawyer': 1.5,
            'arrest': 2.0, 'custody': 1.5,
            
            # Social (medium weight)
            'eviction': 1.5, 'homeless': 2.0, 'food': 1.5,
            'money': 1.5, 'job': 1.5
        }
    
    def extract(self, text: str, top_k: int = 10) -> List[str]:
        """
        Extract keywords from text
        
        Args:
            text: Input text
            top_k: Number of keywords to return
            
        Returns:
            List of keywords
        """
        # Tokenize and clean
        words = self._tokenize(text)
        
        # Filter stopwords and short words
        filtered_words = [
            word for word in words 
            if word not in self.stopwords and len(word) > 2
        ]
        
        # Calculate TF (Term Frequency)
        tf = Counter(filtered_words)
        
        # Apply crisis weights
        weighted_scores = {}
        for word, count in tf.items():
            base_score = count
            
            # Apply crisis weight if available
            if word in self.crisis_weights:
                base_score *= self.crisis_weights[word]
            
            # Longer words often more meaningful
            base_score *= (1 + math.log(len(word)) / 10)
            
            weighted_scores[word] = base_score
        
        # Sort by score and return top k
        sorted_keywords = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)
        
        return [keyword for keyword, _ in sorted_keywords[:top_k]]
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Split into words
        words = text.split()
        
        return words
    
    def extract_with_scores(self, text: str, top_k: int = 10) -> List[Dict]:
        """
        Extract keywords with their scores
        
        Returns:
            List of dictionaries with keyword and score
        """
        words = self._tokenize(text)
        filtered_words = [w for w in words if w not in self.stopwords and len(w) > 2]
        
        tf = Counter(filtered_words)
        
        results = []
        for word, count in tf.most_common(top_k):
            score = count
            if word in self.crisis_weights:
                score *= self.crisis_weights[word]
            
            results.append({
                'keyword': word,
                'frequency': count,
                'score': round(score, 2)
            })
        
        return results
    
    def extract_phrases(self, text: str, top_k: int = 5) -> List[str]:
        """
        Extract multi-word phrases from text
        
        Args:
            text: Input text
            top_k: Number of phrases to return
            
        Returns:
            List of phrases
        """
        # Look for common crisis phrases
        crisis_phrases = [
            'i want to die', 'i want to kill myself', 'help me please',
            'i am scared', 'i am in danger', 'need help immediately',
            'someone is hurting me', 'i cant breathe', 'i am bleeding',
            'i am being attacked', 'i have nowhere to go'
        ]
        
        text_lower = text.lower()
        found_phrases = []
        
        for phrase in crisis_phrases:
            if phrase in text_lower:
                found_phrases.append(phrase)
        
        return found_phrases[:top_k]