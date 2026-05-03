"""
Text Preprocessor
Cleans and normalizes text for analysis
"""

import re
import unicodedata
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class TextPreprocessor:
    """Preprocess text for NLP analysis"""
    
    def __init__(self):
        """Initialize preprocessor with cleaning rules"""
        self.contractions = self._load_contractions()
    
    def _load_contractions(self) -> dict:
        """Load common contractions for expansion"""
        return {
            "don't": "do not",
            "can't": "cannot",
            "won't": "will not",
            "shouldn't": "should not",
            "couldn't": "could not",
            "wouldn't": "would not",
            "isn't": "is not",
            "aren't": "are not",
            "wasn't": "was not",
            "weren't": "were not",
            "i'm": "i am",
            "you're": "you are",
            "he's": "he is",
            "she's": "she is",
            "it's": "it is",
            "we're": "we are",
            "they're": "they are",
            "i've": "i have",
            "you've": "you have",
            "we've": "we have",
            "they've": "they have",
            "i'll": "i will",
            "you'll": "you will",
            "he'll": "he will",
            "she'll": "she will",
            "it'll": "it will",
            "we'll": "we will",
            "they'll": "they will",
            "i'd": "i would",
            "you'd": "you would",
            "he'd": "he would",
            "she'd": "she would",
            "it'd": "it would",
            "we'd": "we would",
            "they'd": "they would"
        }
    
    def clean(self, text: str, normalize_unicode: bool = True,
              expand_contractions: bool = True,
              remove_emojis: bool = False) -> str:
        """
        Clean and normalize text
        
        Args:
            text: Input text
            normalize_unicode: Normalize Unicode characters
            expand_contractions: Expand contractions
            remove_emojis: Remove emoji characters
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Convert to string if needed
        text = str(text)
        
        # Normalize Unicode
        if normalize_unicode:
            text = unicodedata.normalize('NFKC', text)
        
        # Convert to lowercase
        text = text.lower()
        
        # Expand contractions
        if expand_contractions:
            text = self._expand_contractions(text)
        
        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove phone numbers
        text = re.sub(r'\+\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}', '', text)
        
        # Remove special characters (keep letters, numbers, spaces, basic punctuation)
        text = re.sub(r'[^\w\s\.\,\!\?]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove emojis if requested
        if remove_emojis:
            text = self._remove_emojis(text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def _expand_contractions(self, text: str) -> str:
        """Expand contractions in text"""
        for contraction, expanded in self.contractions.items():
            text = text.replace(contraction, expanded)
        return text
    
    def _remove_emojis(self, text: str) -> str:
        """Remove emoji characters from text"""
        # Emoji regex pattern
        emoji_pattern = re.compile(
            "["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+",
            flags=re.UNICODE
        )
        return emoji_pattern.sub(r'', text)
    
    def tokenize_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence splitting
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def remove_stopwords(self, words: List[str], 
                        custom_stopwords: Optional[List[str]] = None) -> List[str]:
        """Remove stopwords from token list"""
        common_stopwords = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'were', 'will', 'with', 'i', 'you', 'we', 'they',
            'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her'
        }
        
        if custom_stopwords:
            common_stopwords.update(custom_stopwords)
        
        return [w for w in words if w not in common_stopwords]
    
    def normalize_swahili(self, text: str) -> str:
        """Normalize Swahili text (handle special characters)"""
        # Replace Swahili-specific characters
        replacements = {
            'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u',
            'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u'
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def is_empty(self, text: str) -> bool:
        """Check if text is effectively empty after cleaning"""
        cleaned = self.clean(text)
        return len(cleaned) < 3