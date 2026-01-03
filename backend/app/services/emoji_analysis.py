"""Emoji analysis service for WhatsApp conversations."""
import emoji
from collections import defaultdict
from typing import List, Dict, Any
from ..models.message import Message


class EmojiAnalyzer:
    """Analyzes emoji usage in WhatsApp conversations."""
    
    def __init__(self, messages: List[Message]):
        self.messages = messages
    
    def extract_emojis(self, text: str) -> List[str]:
        """Extract all individual emojis from text using the emoji library."""
        return [char['emoji'] for char in emoji.emoji_list(text)]
    
    def analyze(self) -> Dict[str, Any]:
        """
        Analyze emoji usage across all messages.
        
        Returns:
            Dictionary containing:
            - total_emojis: Total number of emojis used
            - unique_emojis: Number of unique emojis
            - top_emojis: List of (emoji, count) tuples, sorted by count
            - by_author: Dict mapping author to their emoji stats
            - emojis_per_message: Average emojis per message
        """
        user_messages = [m for m in self.messages if not m.is_system and not m.is_media]
        
        if not user_messages:
            return self._empty_response()
        
        # Overall emoji counts
        total_emoji_counts: Dict[str, int] = defaultdict(int)
        
        # Per-author emoji counts
        author_emoji_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        author_total_emojis: Dict[str, int] = defaultdict(int)
        author_message_counts: Dict[str, int] = defaultdict(int)
        
        total_emojis = 0
        
        for msg in user_messages:
            emojis = self.extract_emojis(msg.content)
            author_message_counts[msg.author] += 1
            
            for e in emojis:
                # Handle compound emojis (with ZWJ sequences)
                total_emoji_counts[e] += 1
                author_emoji_counts[msg.author][emoji] += 1
                author_total_emojis[msg.author] += 1
                total_emojis += 1
        
        # Sort emojis by count
        top_emojis = sorted(
            total_emoji_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:30]  # Top 30 emojis
        
        # Per-author stats
        by_author = {}
        for author in author_emoji_counts:
            author_top = sorted(
                author_emoji_counts[author].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]  # Top 10 per author
            
            msg_count = author_message_counts.get(author, 1)
            by_author[author] = {
                'total': author_total_emojis[author],
                'unique': len(author_emoji_counts[author]),
                'top_emojis': [{'emoji': e, 'count': c} for e, c in author_top],
                'per_message': round(author_total_emojis[author] / msg_count, 2)
            }
        
        # Sort by_author by total emoji count
        by_author = dict(sorted(
            by_author.items(),
            key=lambda x: x[1]['total'],
            reverse=True
        ))
        
        return {
            'total_emojis': total_emojis,
            'unique_emojis': len(total_emoji_counts),
            'top_emojis': [{'emoji': e, 'count': c} for e, c in top_emojis],
            'by_author': by_author,
            'emojis_per_message': round(total_emojis / len(user_messages), 2) if user_messages else 0
        }
    
    def _empty_response(self) -> Dict[str, Any]:
        """Return empty response structure."""
        return {
            'total_emojis': 0,
            'unique_emojis': 0,
            'top_emojis': [],
            'by_author': {},
            'emojis_per_message': 0
        }
