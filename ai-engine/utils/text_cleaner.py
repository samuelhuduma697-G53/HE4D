"""
Advanced Text Cleaning Utilities
"""

import re
import unicodedata
from typing import List, Optional

class TextCleaner:
    """Advanced text cleaning utilities"""
    
    @staticmethod
    def remove_html_tags(text: str) -> str:
        """Remove HTML tags from text"""
        return re.sub(r'<[^>]+>', '', text)
    
    @staticmethod
    def normalize_whitespace(text: str) -> str:
        """Normalize whitespace characters"""
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    @staticmethod
    def remove_special_characters(text: str, keep_spaces: bool = True) -> str:
        """Remove special characters"""
        pattern = r'[^a-zA-Z0-9\s\.\,\!\?]' if keep_spaces else r'[^a-zA-Z0-9]'
        return re.sub(pattern, ' ', text)
    
    @staticmethod
    def remove_numbers(text: str) -> str:
        """Remove numeric characters"""
        return re.sub(r'\d+', '', text)
    
    @staticmethod
    def fix_unicode_encoding(text: str) -> str:
        """Fix common Unicode encoding issues"""
        try:
            # Try to normalize and fix encoding
            text = unicodedata.normalize('NFKC', text)
            text = text.encode('latin-1').decode('utf-8', errors='ignore')
        except Exception:
            pass
        return text