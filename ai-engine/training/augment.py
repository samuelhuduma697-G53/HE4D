"""
Data Augmentation for Crisis Text
"""

import random
import re

class DataAugmenter:
    """Augment crisis text data"""
    
    @staticmethod
    def synonym_replacement(text: str, synonym_dict: dict) -> str:
        """Replace words with synonyms"""
        words = text.split()
        for i, word in enumerate(words):
            if word in synonym_dict and random.random() < 0.3:
                words[i] = random.choice(synonym_dict[word])
        return ' '.join(words)
    
    @staticmethod
    def random_insertion(text: str, insert_words: list) -> str:
        """Insert random words"""
        words = text.split()
        for _ in range(random.randint(1, 3)):
            insert_pos = random.randint(0, len(words))
            insert_word = random.choice(insert_words)
            words.insert(insert_pos, insert_word)
        return ' '.join(words)
    
    @staticmethod
    def random_deletion(text: str, p: float = 0.1) -> str:
        """Randomly delete words"""
        words = text.split()
        if len(words) < 3:
            return text
        new_words = [w for w in words if random.random() > p]
        return ' '.join(new_words) if new_words else text