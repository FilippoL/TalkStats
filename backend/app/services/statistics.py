from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from collections import defaultdict
import statistics
import re

from ..models.message import Message
from ..models.stats import (
    StatsResponse, AuthorStats,
    TimeSeriesDataPoint, MediaStats
)


class StatisticsService:
    """Service for computing conversation statistics."""
    
    def __init__(self, messages: List[Message], language: str = 'en'):
        self.messages = messages
        self.filtered_messages = messages
        self.language = language
    
    def filter_messages(
        self,
        authors: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> 'StatisticsService':
        """Filter messages and return a new service instance with filtered data."""
        filtered = self.messages
        
        if authors:
            filtered = [m for m in filtered if m.author in authors]
        
        if start_date:
            filtered = [m for m in filtered if m.timestamp >= start_date]
        
        if end_date:
            filtered = [m for m in filtered if m.timestamp <= end_date]
        
        service = StatisticsService(filtered, language=self.language)
        return service
    
    def compute_stats(
        self,
        time_group: str = 'day',
        group_by_author: bool = False
    ) -> StatsResponse:
        """
        Compute comprehensive statistics.
        
        Args:
            time_group: One of 'hour', 'day', 'week', 'month'
            group_by_author: Whether to include author-specific stats
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
    
    def _load_profanity_patterns(self) -> Dict[str, re.Pattern]:
        """
        Load profanity patterns based on language.
        Italian: bestemmie.txt (blasphemies)
        English: swearwords.txt (profanity)
        """
        import os
        patterns = {}
        
        # Select file based on language
        filename = 'bestemmie.txt' if self.language == 'it' else 'swearwords.txt'
        
        # Try multiple paths (local dev vs Docker)
        possible_paths = [
            # Docker path: /app/data/
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', filename),
            # Local dev path: project_root/data/
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data', filename),
        ]
        
        file_path = None
        for path in possible_paths:
            if os.path.exists(path):
                file_path = path
                break
        
        if not file_path:
            # Fallback patterns based on language
            if self.language == 'it':
                return {
                    'porco dio': re.compile(r'\bporco\s*di+o+\b', re.IGNORECASE),
                    'dio porco': re.compile(r'\bdio\s*porco\b', re.IGNORECASE),
                    'porca madonna': re.compile(r'\bporca\s*madonna\b', re.IGNORECASE),
                    'dio cane': re.compile(r'\bdio\s*cane\b', re.IGNORECASE),
                }
            else:
                return {
                    'fuck': re.compile(r'\bfuck\w*\b', re.IGNORECASE),
                    'shit': re.compile(r'\bshit\w*\b', re.IGNORECASE),
                    'damn': re.compile(r'\bdamn\w*\b', re.IGNORECASE),
                    'ass': re.compile(r'\bass(?:hole)?\b', re.IGNORECASE),
                }
        
        seen_patterns = set()
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                phrase = line.strip().lower()
                if not phrase or phrase in seen_patterns:
                    continue
                seen_patterns.add(phrase)
                
                # Create pattern that handles word boundaries
                words = phrase.split()
                if len(words) >= 2:
                    # Multi-word: allow optional spaces
                    pattern_str = r'\b' + r'\s*'.join(re.escape(w) for w in words) + r'\b'
                elif len(words) == 1:
                    # Single word - match with optional suffixes for English
                    if self.language == 'en':
                        pattern_str = r'\b' + re.escape(phrase) + r'\w*\b'
                    else:
                        pattern_str = r'\b' + re.escape(phrase) + r'\b'
                else:
                    continue
                
                # Normalize pattern name
                canonical = ' '.join(words) if len(words) > 1 else phrase
                
                try:
                    patterns[canonical] = re.compile(pattern_str, re.IGNORECASE)
                except re.error:
                    continue
        
        return patterns
    
    def _detect_climax_patterns(self, content: str) -> List[Dict[str, Any]]:
        """
        Detect climax patterns where vowels are repeated for emphasis.
        E.g., "porco diooooo", "diooooo", "madonnaaaa"
        Returns list of detected climax instances with intensity score.
        """
        climax_matches = []
        content_lower = content.lower()
        
        # Pattern to find words ending in repeated vowels (3+ repetitions)
        # This captures the emotional intensity/"climax" of the expression
        climax_pattern = re.compile(
            r'\b(\w*?)((?:dio|porco|madonna|cane|merda|bestia|boia|maiale)\w*?)([aeiou])\3{2,}\b',
            re.IGNORECASE
        )
        
        for match in climax_pattern.finditer(content_lower):
            full_match = match.group(0)
            repeated_vowel = match.group(3)
            repetitions = len(full_match) - len(full_match.rstrip(repeated_vowel)) + 1
            
            # Intensity score based on repetitions (3 = mild, 5+ = intense)
            intensity = min(repetitions - 2, 5)  # Cap at 5
            
            climax_matches.append({
                'text': full_match,
                'intensity': intensity,
                'repetitions': repetitions
            })
        
        return climax_matches
    
    def _compute_bestemmiometro(self, messages: List[Message]) -> Dict[str, Any]:
        """
        Compute profanity statistics.
        Italian: Bestemmiometro (blasphemies from bestemmie.txt)
        English: Swear-O-Meter (profanity from swearwords.txt)
        
        Features:
        - Loads patterns from language-specific file
        - Normalizes text to lowercase
        - Detects climax patterns (repeated vowels like "diooooo") for Italian
        - Tracks consecutive profanities in messages
        - Provides per-capita stats (profanities per 100 messages)
        
        Returns counts by phrase, by author, total, patterns, and per-capita stats.
        """
        # Load patterns from file based on language
        PROFANITY_PATTERNS = self._load_profanity_patterns()
        
        # Initialize counters
        by_phrase = {phrase: 0 for phrase in PROFANITY_PATTERNS}
        by_author = defaultdict(lambda: {phrase: 0 for phrase in PROFANITY_PATTERNS})
        by_author_total = defaultdict(int)
        by_author_message_count = defaultdict(int)
        total = 0
        
        # Track consecutive patterns and climax
        consecutive_profanities = []  # List of (author, count, timestamp) for consecutive msgs
        climax_instances = []  # List of climax detections
        current_streak = {'author': None, 'count': 0, 'start_timestamp': None}
        
        # Track profanities over time for patterns
        profanity_timeline = defaultdict(int)
        
        prev_msg_had_profanity = False
        prev_author = None
        
        for msg in messages:
            if msg.is_system:
                continue
            
            # Count messages per author (for per-capita calculation)
            by_author_message_count[msg.author] += 1
            
            if msg.is_media or not msg.content:
                prev_msg_had_profanity = False
                continue
            
            # IMPORTANT: Normalize to lowercase for analysis
            content = msg.content.lower()
            msg_profanity_count = 0
            
            for phrase, pattern in PROFANITY_PATTERNS.items():
                matches = len(pattern.findall(content))
                if matches > 0:
                    by_phrase[phrase] += matches
                    by_author[msg.author][phrase] += matches
                    by_author_total[msg.author] += matches
                    total += matches
                    msg_profanity_count += matches
            
            # Detect climax patterns (mainly for Italian)
            if self.language == 'it':
                climax_in_msg = self._detect_climax_patterns(content)
                for climax in climax_in_msg:
                    climax_instances.append({
                        'author': msg.author,
                        'timestamp': msg.timestamp.isoformat() if msg.timestamp else None,
                        **climax
                    })
            
            # Track consecutive profanities (same author, consecutive messages)
            if msg_profanity_count > 0:
                # Track timeline
                time_key = msg.timestamp.replace(minute=0, second=0, microsecond=0)
                profanity_timeline[time_key.isoformat()] += msg_profanity_count
                
                if prev_msg_had_profanity and prev_author == msg.author:
                    # Continue streak
                    current_streak['count'] += 1
                else:
                    # Save previous streak if it was >= 2
                    if current_streak['count'] >= 2:
                        consecutive_profanities.append({
                            'author': current_streak['author'],
                            'count': current_streak['count'],
                            'timestamp': current_streak['start_timestamp']
                        })
                    # Start new streak
                    current_streak = {
                        'author': msg.author,
                        'count': 1,
                        'start_timestamp': msg.timestamp.isoformat() if msg.timestamp else None
                    }
                prev_msg_had_profanity = True
                prev_author = msg.author
            else:
                # No profanity in this message
                if current_streak['count'] >= 2:
                    consecutive_profanities.append({
                        'author': current_streak['author'],
                        'count': current_streak['count'],
                        'timestamp': current_streak['start_timestamp']
                    })
                current_streak = {'author': None, 'count': 0, 'start_timestamp': None}
                prev_msg_had_profanity = False
                prev_author = msg.author
        
        # Don't forget last streak
        if current_streak['count'] >= 2:
            consecutive_profanities.append({
                'author': current_streak['author'],
                'count': current_streak['count'],
                'timestamp': current_streak['start_timestamp']
            })
        
        # Calculate per-capita stats (profanities per 100 messages)
        per_capita = {}
        for author, profanity_count in by_author_total.items():
            msg_count = by_author_message_count.get(author, 1)
            per_capita[author] = round((profanity_count / msg_count) * 100, 2) if msg_count > 0 else 0
        
        # Calculate total per-capita
        total_messages = sum(by_author_message_count.values())
        total_per_capita = round((total / total_messages) * 100, 2) if total_messages > 0 else 0
        
        # Get top phrases (filter out zeros and sort by count)
        top_phrases = sorted(
            [(phrase, count) for phrase, count in by_phrase.items() if count > 0],
            key=lambda x: x[1],
            reverse=True
        )[:20]  # Top 20
        
        # Climax statistics (mainly for Italian)
        climax_by_author = defaultdict(int)
        total_intensity = 0
        for climax in climax_instances:
            climax_by_author[climax['author']] += 1
            total_intensity += climax['intensity']
        
        avg_climax_intensity = round(total_intensity / len(climax_instances), 2) if climax_instances else 0
        
        return {
            'by_phrase': {phrase: count for phrase, count in top_phrases},
            'by_author': {author: {p: c for p, c in counts.items() if c > 0} for author, counts in by_author.items() if by_author_total[author] > 0},
            'by_author_total': dict(by_author_total),
            'total': total,
            'per_capita': per_capita,
            'total_per_capita': total_per_capita,
            'consecutive_streaks': sorted(consecutive_profanities, key=lambda x: x['count'], reverse=True)[:10],
            'climax_instances': climax_instances[:50],  # Limit to 50
            'climax_by_author': dict(climax_by_author),
            'avg_climax_intensity': avg_climax_intensity,
            'timeline': dict(sorted(profanity_timeline.items())),
            'language': self.language,  # Include language for frontend
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
            media_stats=None,
            time_series=[],
            grouped_data={}
        )


