from datetime import datetime, timedelta
from typing import List, Dict
from collections import Counter, defaultdict
from statistics import mean, median, mode

from ..models.message import Message
from ..models.stats import Insight, InsightResponse
from .statistics import StatisticsService
from .word_analysis import WordAnalyzer


class InsightsGenerator:
    """Generates actionable insights from conversation data."""
    
    def __init__(self, messages: List[Message]):
        self.messages = messages
        self.user_messages = [m for m in messages if not m.is_system]
        self.stats_service = StatisticsService(messages)
        self.word_analyzer = WordAnalyzer(messages)
    
    def generate_insights(self) -> InsightResponse:
        """Generate comprehensive insights about the conversation."""
        insights = []
        
        # Activity insights
        insights.extend(self._get_activity_insights())
        
        # Author insights
        insights.extend(self._get_author_insights())
        
        # Temporal insights
        insights.extend(self._get_temporal_insights())
        
        # Sentiment insights
        insights.extend(self._get_sentiment_insights())
        
        # Word insights
        insights.extend(self._get_word_insights())
        
        # Conversation pattern insights
        insights.extend(self._get_pattern_insights())
        
        return InsightResponse(insights=insights)
    
    def _get_activity_insights(self) -> List[Insight]:
        """Generate insights about overall activity."""
        insights = []
        total = len(self.user_messages)
        
        if total == 0:
            return insights
        
        # Total messages
        insights.append(Insight(
            title="Total Messages",
            description=f"Your conversation contains {total:,} messages",
            value=total,
            category="activity"
        ))
        
        # Date range
        timestamps = [m.timestamp for m in self.user_messages]
        date_range = max(timestamps) - min(timestamps)
        days = date_range.days
        insights.append(Insight(
            title="Conversation Duration",
            description=f"The conversation spans {days} days (from {min(timestamps).strftime('%Y-%m-%d')} to {max(timestamps).strftime('%Y-%m-%d')})",
            value=days,
            category="activity"
        ))
        
        # Messages per day average
        avg_per_day = total / days if days > 0 else total
        insights.append(Insight(
            title="Average Activity",
            description=f"On average, {avg_per_day:.1f} messages are sent per day",
            value=round(avg_per_day, 1),
            category="activity"
        ))
        
        return insights
    
    def _get_author_insights(self) -> List[Insight]:
        """Generate insights about authors."""
        insights = []
        
        if not self.user_messages:
            return insights
        
        # Message counts per author
        author_counts = Counter(m.author for m in self.user_messages)
        total = len(self.user_messages)
        
        # Most active author
        most_active = author_counts.most_common(1)[0]
        percentage = (most_active[1] / total * 100) if total > 0 else 0
        insights.append(Insight(
            title="Most Active Participant",
            description=f"{most_active[0]} sent the most messages ({most_active[1]:,} messages, {percentage:.1f}% of total)",
            value=most_active[0],
            category="authors"
        ))
        
        # Participation distribution
        if len(author_counts) > 1:
            counts = list(author_counts.values())
            insights.append(Insight(
                title="Participation Balance",
                description=f"Messages are distributed among {len(author_counts)} participants, with {most_active[1]} messages from the most active member",
                value=len(author_counts),
                category="authors"
            ))
        
        return insights
    
    def _get_temporal_insights(self) -> List[Insight]:
        """Generate insights about timing patterns."""
        insights = []
        
        if not self.user_messages:
            return insights
        
        # Peak hour
        hour_counts = Counter(m.timestamp.hour for m in self.user_messages)
        peak_hour = hour_counts.most_common(1)[0][0]
        insights.append(Insight(
            title="Peak Conversation Hour",
            description=f"Most messages are sent around {peak_hour}:00 (hour {peak_hour})",
            value=peak_hour,
            category="temporal"
        ))
        
        # Peak day of week
        weekday_counts = Counter(m.timestamp.weekday() for m in self.user_messages)
        peak_weekday = weekday_counts.most_common(1)[0][0]
        weekday_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        insights.append(Insight(
            title="Most Active Day",
            description=f"{weekday_names[peak_weekday]} is the most active day of the week",
            value=weekday_names[peak_weekday],
            category="temporal"
        ))
        
        # Activity over time trend
        timestamps = [m.timestamp for m in self.user_messages]
        if len(timestamps) > 1:
            # Compare first and second half
            mid_point = len(timestamps) // 2
            first_half = len([t for t in timestamps[:mid_point]])
            second_half = len([t for t in timestamps[mid_point:]])
            period = mid_point  # approximate days
            trend = "increasing" if second_half > first_half else "decreasing" if first_half > second_half else "stable"
            insights.append(Insight(
                title="Activity Trend",
                description=f"Conversation activity is {trend} over time",
                value=trend,
                category="temporal"
            ))
        
        return insights
    
    def _get_sentiment_insights(self) -> List[Insight]:
        """Generate insights about sentiment."""
        insights = []
        
        messages_with_sentiment = [m for m in self.user_messages if m.sentiment]
        if not messages_with_sentiment:
            return insights
        
        # Overall sentiment distribution
        sentiment_counts = Counter(m.sentiment for m in messages_with_sentiment)
        total_with_sentiment = len(messages_with_sentiment)
        
        # Dominant sentiment
        dominant = sentiment_counts.most_common(1)[0]
        percentage = (dominant[1] / total_with_sentiment * 100) if total_with_sentiment > 0 else 0
        insights.append(Insight(
            title="Dominant Sentiment",
            description=f"The conversation is mostly {dominant[0]} ({percentage:.1f}% of analyzed messages)",
            value=dominant[0],
            category="sentiment"
        ))
        
        # Positive vs negative ratio
        positive_count = sentiment_counts.get('positive', 0) + sentiment_counts.get('joy', 0)
        negative_count = sentiment_counts.get('negative', 0) + sentiment_counts.get('anger', 0) + sentiment_counts.get('sadness', 0) + sentiment_counts.get('fear', 0)
        
        if positive_count + negative_count > 0:
            ratio = positive_count / (positive_count + negative_count) if (positive_count + negative_count) > 0 else 0
            insights.append(Insight(
                title="Positive vs Negative Ratio",
                description=f"{ratio*100:.1f}% of emotional messages are positive, {((1-ratio)*100):.1f}% are negative",
                value=round(ratio, 2),
                category="sentiment"
            ))
        
        return insights
    
    def _get_word_insights(self) -> List[Insight]:
        """Generate insights about word usage."""
        insights = []
        
        word_freq = self.word_analyzer.get_word_frequency(limit=10, min_length=4)
        if word_freq.words:
            top_word = word_freq.words[0]
            insights.append(Insight(
                title="Most Used Word",
                description=f"'{top_word.word}' is the most frequently used word (appears {top_word.count} times)",
                value=top_word.word,
                category="words"
            ))
        
        # Average message length
        lengths = [len(m.content) for m in self.user_messages if m.content and not m.is_media]
        if lengths:
            avg_length = mean(lengths)
            insights.append(Insight(
                title="Average Message Length",
                description=f"Messages average {avg_length:.0f} characters in length",
                value=round(avg_length),
                category="words"
            ))
        
        return insights
    
    def _get_pattern_insights(self) -> List[Insight]:
        """Generate insights about conversation patterns."""
        insights = []
        
        if len(self.user_messages) < 2:
            return insights
        
        # Media messages
        media_count = sum(1 for m in self.user_messages if m.is_media)
        total = len(self.user_messages)
        media_percentage = (media_count / total * 100) if total > 0 else 0
        if media_count > 0:
            insights.append(Insight(
                title="Media Sharing",
                description=f"{media_count:,} media messages were shared ({media_percentage:.1f}% of all messages)",
                value=media_count,
                category="patterns"
            ))
        
        # Conversation density (messages per hour in peak times)
        # This is a simple approximation
        if total > 10:
            insights.append(Insight(
                title="Conversation Style",
                description=f"With {total:,} messages, this is a {'highly' if total > 1000 else 'moderately' if total > 100 else 'lightly'} active conversation",
                value=total,
                category="patterns"
            ))
        
        return insights


