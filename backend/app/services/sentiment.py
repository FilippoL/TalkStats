import re
from typing import Dict, Tuple
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class SentimentAnalyzer:
    """Analyzes sentiment and emotion of messages."""
    
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
        # Keywords for emotion detection
        self.emotion_keywords = {
            'joy': [
                'felice', 'contento', 'felicità', 'gioia', 'allegro', 'divertente',
                'happy', 'joy', 'glad', 'excited', 'great', 'wonderful', 'amazing',
                'fantastic', 'love', 'like', '😊', '😄', '😂', 'hahah', 'ahah'
            ],
            'anger': [
                'arrabbiato', 'rabbia', 'incazzato', 'stronzo', 'merda', 'cazzo',
                'angry', 'mad', 'furious', 'hate', 'damn', 'shit', 'fuck', 'asshole'
            ],
            'sadness': [
                'triste', 'tristezza', 'depresso', 'malinconico', 'piangere',
                'sad', 'depressed', 'sorrow', 'unhappy', 'cry', 'tears', '😢', '😞'
            ],
            'fear': [
                'paura', 'spaventato', 'timore', 'ansia', 'preoccupato',
                'fear', 'afraid', 'scared', 'worried', 'anxious', 'nervous'
            ]
        }
    
    def analyze(self, text: str) -> Tuple[str, float]:
        """
        Analyze sentiment and emotion of a message.
        
        Args:
            text: The message text to analyze
            
        Returns:
            Tuple of (sentiment_category, sentiment_score)
            sentiment_category: one of 'positive', 'negative', 'neutral', 'joy', 'anger', 'sadness', 'fear'
            sentiment_score: float between -1 and 1
        """
        if not text or len(text.strip()) == 0:
            return 'neutral', 0.0
        
        # Clean text (remove media markers, URLs, etc.)
        cleaned_text = self._clean_text(text)
        
        # Get VADER sentiment scores
        scores = self.analyzer.polarity_scores(cleaned_text)
        compound = scores['compound']
        
        # Check for specific emotions first
        text_lower = cleaned_text.lower()
        for emotion, keywords in self.emotion_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                # Use emotion category but weight with VADER score
                if emotion == 'joy' and compound >= -0.1:
                    return emotion, compound
                elif emotion == 'anger' and compound <= 0.1:
                    return emotion, compound
                elif emotion == 'sadness' and compound <= 0.2:
                    return emotion, compound
                elif emotion == 'fear' and compound <= 0.1:
                    return emotion, compound
        
        # Otherwise use VADER classification
        if compound >= 0.05:
            return 'positive', compound
        elif compound <= -0.05:
            return 'negative', compound
        else:
            return 'neutral', compound
    
    def _clean_text(self, text: str) -> str:
        """Clean text for sentiment analysis."""
        # Remove URLs
        text = re.sub(r'http\S+|www\.\S+', '', text)
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()


