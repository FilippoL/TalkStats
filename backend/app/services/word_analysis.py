import re
from typing import List, Optional
from collections import Counter
from datetime import datetime

from ..models.message import Message
from ..models.stats import WordFrequencyItem, WordFrequencyResponse


class WordAnalyzer:
    """Analyzes word frequency in messages."""
    
    # Common stopwords in Italian and English
    STOPWORDS = {
        # Italian articles
        'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'dei', 'degli', 'delle', 'del', 'della', 'dello', 'dell',
        # Italian prepositions
        'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'sul', 'sulla', 'sull', 'sulle', 'sugli', 'sui',
        'nel', 'nella', 'nelle', 'negli', 'nei', 'nello', 'nell',
        # Italian pronouns
        'che', 'chi', 'cosa', 'come', 'dove', 'quando', 'perché', 'quello', 'questa', 'questo', 'quelli', 'quelle',
        'quanto', 'quanta', 'quanti', 'quante', 'cui', 'quale', 'quali',
        # Italian verbs (common forms)
        'è', 'sono', 'sei', 'siamo', 'siete', 'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'essere', 'avere',
        'fare', 'dire', 'andare', 'venire', 'stare', 'dare', 'sapere', 'volere', 'dovere', 'potere',
        # Italian common words
        'mi', 'ti', 'ci', 'vi', 'si', 'gli', 'le', 'ne',
        'non', 'e', 'o', 'ma', 'però', 'anche', 'pure', 'solo', 'soli', 'sola', 'sole',
        'molto', 'molta', 'molti', 'molte', 'più', 'meno', 'tanto', 'tanta', 'tanti', 'tante',
        'tutto', 'tutta', 'tutti', 'tutte', 'altro', 'altra', 'altri', 'altre', 'ogni', 'ognuno',
        # English common words
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are',
        'this', 'that', 'these', 'those', 'what', 'which', 'who', 'where', 'when', 'why', 'how',
        'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
        'me', 'you', 'he', 'she', 'it', 'we', 'they', 'him', 'her', 'us', 'them',
        'no', 'not', 'never', 'neither', 'nor', 'also', 'too', 'either',
        'very', 'much', 'many', 'more', 'most', 'less', 'least',
        # Media markers
        '<media', 'omitted>', 'media'
    }
    
    def __init__(self, messages: List[Message]):
        self.messages = messages
    
    def get_word_frequency(
        self,
        authors: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        min_length: int = 1
    ) -> WordFrequencyResponse:
        """
        Get word frequency with optional filters.
        
        Args:
            authors: Filter by author names
            start_date: Filter messages from this date
            end_date: Filter messages until this date
            limit: Maximum number of words to return
            min_length: Minimum word length to include
        """
        # Filter messages
        filtered = self.messages
        
        if authors:
            filtered = [m for m in filtered if m.author in authors]
        
        if start_date:
            filtered = [m for m in filtered if m.timestamp >= start_date]
        
        if end_date:
            filtered = [m for m in filtered if m.timestamp <= end_date]
        
        # Extract words
        words = []
        for msg in filtered:
            if msg.is_media or msg.is_system or not msg.content:
                continue
            
            msg_words = self._extract_words(msg.content)
            words.extend(msg_words)
        
        # Count frequencies
        word_counts = Counter(words)
        
        # Filter by minimum length and stopwords
        filtered_counts = {
            word: count
            for word, count in word_counts.items()
            if len(word) >= min_length and word.lower() not in self.STOPWORDS
        }
        
        # Sort by frequency
        sorted_words = sorted(filtered_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Limit results
        top_words = sorted_words[:limit]
        
        # Calculate total and frequencies
        total_words = sum(count for _, count in filtered_counts.items())
        unique_words = len(filtered_counts)
        
        word_items = [
            WordFrequencyItem(
                word=word,
                count=count,
                frequency=(count / total_words * 100) if total_words > 0 else 0.0
            )
            for word, count in top_words
        ]
        
        return WordFrequencyResponse(
            words=word_items,
            total_words=total_words,
            unique_words=unique_words
        )
    
    def get_word_frequency_by_author(
        self,
        author: str,
        limit: int = 50,
        min_length: int = 1
    ) -> WordFrequencyResponse:
        """Get word frequency for a specific author."""
        return self.get_word_frequency(
            authors=[author],
            limit=limit,
            min_length=min_length
        )
    
    def _extract_words(self, text: str) -> List[str]:
        """Extract words from text, handling multiple languages."""
        # Remove URLs
        text = re.sub(r'http\S+|www\.\S+', '', text)
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        # Remove special characters but keep accents and unicode
        # Keep letters (including accented) and apostrophes
        text = re.sub(r'[^\w\s\']', ' ', text, flags=re.UNICODE)
        
        # Split into words
        words = re.findall(r'\b\w+\b', text, re.UNICODE)
        
        # Convert to lowercase and filter
        words = [w.lower() for w in words if w]
        
        return words


