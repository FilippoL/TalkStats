from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from collections import defaultdict
import statistics
import re

from ..models.message import Message
from ..models.stats import (
    StatsResponse, AuthorStats, SentimentDistribution,
    TimeSeriesDataPoint, MediaStats
)


class StatisticsService:
    """Service for computing conversation statistics."""
    
    def __init__(self, messages: List[Message]):
        self.messages = messages
        self.filtered_messages = messages
    
    def filter_messages(
        self,
        authors: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sentiment: Optional[str] = None
    ) -> 'StatisticsService':
        """Filter messages and return a new service instance with filtered data."""
        filtered = self.messages
        
        if authors:
            filtered = [m for m in filtered if m.author in authors]
        
        if start_date:
            filtered = [m for m in filtered if m.timestamp >= start_date]
        
        if end_date:
            filtered = [m for m in filtered if m.timestamp <= end_date]
        
        if sentiment:
            filtered = [m for m in filtered if m.sentiment == sentiment]
        
        service = StatisticsService(filtered)
        return service
    
    def compute_stats(
        self,
        time_group: str = 'day',
        group_by_author: bool = False,
        group_by_sentiment: bool = False
    ) -> StatsResponse:
        """
        Compute comprehensive statistics.
        
        Args:
            time_group: One of 'hour', 'day', 'week', 'month'
            group_by_author: Whether to include author-specific stats
            group_by_sentiment: Whether to include sentiment-specific stats
        """
        messages = self.filtered_messages
        user_messages = [m for m in messages if not m.is_system]
        
        if not user_messages:
            return self._empty_stats_response()
        
        # Basic stats
        total_messages = len(user_messages)
        authors = list(set(m.author for m in user_messages))
        total_authors = len(authors)
        
        # Date range
        timestamps = [m.timestamp for m in user_messages]
        date_range = {
            'start': min(timestamps) if timestamps else None,
            'end': max(timestamps) if timestamps else None
        }
        
        # Author stats
        author_stats = self._compute_author_stats(user_messages)
        
        # Sentiment distribution
        sentiment_dist = self._compute_sentiment_distribution(user_messages)
        
        # Media statistics
        media_stats = self._compute_media_stats(user_messages, time_group)
        
        # Time series
        time_series = self._compute_time_series(user_messages, time_group)
        
        # Hourly breakdown for day grouping
        hourly_breakdown = None
        if time_group == 'day':
            hourly_breakdown = self._compute_hourly_breakdown(user_messages)
        
        # Grouped data
        grouped_data = {}
        if group_by_author:
            grouped_data['by_author'] = self._group_by_author(user_messages, time_group)
        if group_by_sentiment:
            grouped_data['by_sentiment'] = self._group_by_sentiment(user_messages, time_group)
        if hourly_breakdown:
            grouped_data['hourly'] = hourly_breakdown
        
        # Message length distribution
        grouped_data['message_lengths'] = self._compute_message_length_distribution(user_messages)
        
        # Bestemmiometro - Italian blasphemy counter
        grouped_data['bestemmiometro'] = self._compute_bestemmiometro(user_messages)
        
        return StatsResponse(
            total_messages=total_messages,
            total_authors=total_authors,
            date_range=date_range,
            author_stats=author_stats,
            sentiment_distribution=sentiment_dist,
            media_stats=media_stats,
            time_series=time_series,
            grouped_data=grouped_data
        )
    
    def _compute_author_stats(self, messages: List[Message]) -> List[AuthorStats]:
        """Compute statistics per author."""
        author_data = defaultdict(lambda: {'messages': [], 'media_count': 0})
        
        for msg in messages:
            author_data[msg.author]['messages'].append(msg)
            if msg.is_media:
                author_data[msg.author]['media_count'] += 1
        
        stats = []
        for author, data in author_data.items():
            msg_list = data['messages']
            message_lengths = [len(msg.content) for msg in msg_list if msg.content]
            avg_length = statistics.mean(message_lengths) if message_lengths else 0
            total_chars = sum(message_lengths)
            
            stats.append(AuthorStats(
                author=author,
                message_count=len(msg_list),
                avg_message_length=avg_length,
                total_chars=total_chars,
                media_count=data['media_count']
            ))
        
        # Sort by message count descending
        stats.sort(key=lambda x: x.message_count, reverse=True)
        return stats
    
    def _compute_sentiment_distribution(self, messages: List[Message]) -> SentimentDistribution:
        """Compute sentiment distribution."""
        dist = SentimentDistribution()
        
        for msg in messages:
            if not msg.sentiment:
                continue
            
            sentiment = msg.sentiment.lower()
            if sentiment == 'positive':
                dist.positive += 1
            elif sentiment == 'negative':
                dist.negative += 1
            elif sentiment == 'neutral':
                dist.neutral += 1
            elif sentiment == 'joy':
                dist.joy += 1
            elif sentiment == 'anger':
                dist.anger += 1
            elif sentiment == 'sadness':
                dist.sadness += 1
            elif sentiment == 'fear':
                dist.fear += 1
        
        return dist
    
    def _compute_time_series(
        self,
        messages: List[Message],
        time_group: str
    ) -> List[TimeSeriesDataPoint]:
        """Compute time series data grouped by time period."""
        grouped = defaultdict(int)
        
        for msg in messages:
            key = self._get_time_key(msg.timestamp, time_group)
            grouped[key] += 1
        
        # Convert to sorted list
        series = [
            TimeSeriesDataPoint(timestamp=key, value=count)
            for key, count in sorted(grouped.items())
        ]
        
        return series
    
    def _get_time_key(self, timestamp: datetime, time_group: str) -> datetime:
        """Get time key for grouping."""
        if time_group == 'hour':
            return timestamp.replace(minute=0, second=0, microsecond=0)
        elif time_group == 'day':
            return timestamp.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_group == 'week':
            # Start of week (Monday)
            days_since_monday = timestamp.weekday()
            week_start = timestamp - timedelta(days=days_since_monday)
            return week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_group == 'month':
            return timestamp.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            return timestamp.replace(minute=0, second=0, microsecond=0)
    
    def _group_by_author(
        self,
        messages: List[Message],
        time_group: str
    ) -> Dict[str, List[TimeSeriesDataPoint]]:
        """Group messages by author and time."""
        author_groups = defaultdict(lambda: defaultdict(int))
        
        for msg in messages:
            author = msg.author
            time_key = self._get_time_key(msg.timestamp, time_group)
            author_groups[author][time_key] += 1
        
        result = {}
        for author, time_data in author_groups.items():
            result[author] = [
                TimeSeriesDataPoint(timestamp=key, value=count)
                for key, count in sorted(time_data.items())
            ]
        
        return result
    
    def _group_by_sentiment(
        self,
        messages: List[Message],
        time_group: str
    ) -> Dict[str, List[TimeSeriesDataPoint]]:
        """Group messages by sentiment and time."""
        sentiment_groups = defaultdict(lambda: defaultdict(int))
        
        for msg in messages:
            if not msg.sentiment:
                continue
            sentiment = msg.sentiment.lower()
            time_key = self._get_time_key(msg.timestamp, time_group)
            sentiment_groups[sentiment][time_key] += 1
        
        result = {}
        for sentiment, time_data in sentiment_groups.items():
            result[sentiment] = [
                TimeSeriesDataPoint(timestamp=key, value=count)
                for key, count in sorted(time_data.items())
            ]
        
        return result
    
    def _compute_media_stats(
        self,
        messages: List[Message],
        time_group: str
    ) -> MediaStats:
        """Compute statistics about media messages."""
        # Count total media
        total_media = sum(1 for msg in messages if msg.is_media)
        media_percentage = (total_media / len(messages) * 100) if messages else 0.0
        
        # Count media by author
        media_by_author = defaultdict(int)
        for msg in messages:
            if msg.is_media:
                media_by_author[msg.author] += 1
        
        # Compute media over time
        media_messages = [msg for msg in messages if msg.is_media]
        media_over_time = self._compute_time_series(media_messages, time_group)
        
        return MediaStats(
            total_media=total_media,
            media_percentage=media_percentage,
            media_by_author=dict(media_by_author),
            media_over_time=media_over_time
        )
    
    def _compute_message_length_distribution(self, messages: List[Message]) -> List[int]:
        """Extract all message lengths for histogram visualization."""
        return [len(msg.content) for msg in messages if msg.content and not msg.is_media]
    
    def _compute_bestemmiometro(self, messages: List[Message]) -> Dict[str, Any]:
        """
        Compute Bestemmiometro statistics - counts of Italian blasphemies.
        
        Tracks specific phrases: 'porco dio', 'dio porco', 'porca madonna', 'dio cane'
        Handles variants with or without spaces (e.g., 'porcodio', 'diop0rco').
        Returns counts by phrase, by author, and total.
        """
        # Define the blasphemy patterns (case insensitive)
        # \s* allows optional whitespace between words
        BLASPHEMY_PATTERNS = {
            'porco dio': re.compile(r'\bporco\s*dio\b', re.IGNORECASE),
            'dio porco': re.compile(r'\bdio\s*porco\b', re.IGNORECASE),
            'porca madonna': re.compile(r'\bporca\s*madonna\b', re.IGNORECASE),
            'dio cane': re.compile(r'\bdio\s*cane\b', re.IGNORECASE),
        }
        
        # Initialize counters
        by_phrase = {phrase: 0 for phrase in BLASPHEMY_PATTERNS}
        by_author = defaultdict(lambda: {phrase: 0 for phrase in BLASPHEMY_PATTERNS})
        by_author_total = defaultdict(int)
        total = 0
        
        for msg in messages:
            if msg.is_system or msg.is_media or not msg.content:
                continue
                
            content = msg.content
            for phrase, pattern in BLASPHEMY_PATTERNS.items():
                matches = len(pattern.findall(content))
                if matches > 0:
                    by_phrase[phrase] += matches
                    by_author[msg.author][phrase] += matches
                    by_author_total[msg.author] += matches
                    total += matches
        
        return {
            'by_phrase': by_phrase,
            'by_author': {author: dict(counts) for author, counts in by_author.items()},
            'by_author_total': dict(by_author_total),
            'total': total,
        }

    def _compute_hourly_breakdown(self, messages: List[Message]) -> List[TimeSeriesDataPoint]:
        """Compute hourly breakdown (0-23 hours) across all messages."""
        hourly_counts = defaultdict(int)
        
        # Aggregate messages by hour of day (0-23)
        for msg in messages:
            hour = msg.timestamp.hour
            hourly_counts[hour] += 1
        
        # Convert to TimeSeriesDataPoint format with hour as timestamp (using a reference date)
        # Include all 24 hours, even if count is 0
        reference_date = datetime(2000, 1, 1)  # Arbitrary reference date
        series = [
            TimeSeriesDataPoint(
                timestamp=reference_date.replace(hour=hour),
                value=hourly_counts.get(hour, 0)
            )
            for hour in range(24)
        ]
        
        return series
    
    def _empty_stats_response(self) -> StatsResponse:
        """Return an empty stats response."""
        return StatsResponse(
            total_messages=0,
            total_authors=0,
            date_range={'start': None, 'end': None},
            author_stats=[],
            sentiment_distribution=SentimentDistribution(),
            media_stats=None,
            time_series=[],
            grouped_data={}
        )


