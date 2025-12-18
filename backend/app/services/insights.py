from datetime import datetime, timedelta
from typing import List, Dict
from collections import Counter, defaultdict
from statistics import mean, median, mode

from ..models.message import Message
from ..models.stats import Insight, InsightResponse
from .statistics import StatisticsService
from .word_analysis import WordAnalyzer


# Translation dictionary for insights
INSIGHT_TRANSLATIONS = {
    'en': {
        'total_messages_title': 'Total Messages',
        'total_messages_desc': 'Your conversation contains {count:,} messages',
        'conversation_duration_title': 'Conversation Duration',
        'conversation_duration_desc': 'The conversation spans {days} days (from {start} to {end})',
        'average_activity_title': 'Average Activity',
        'average_activity_desc': 'On average, {avg:.1f} messages are sent per day',
        'most_active_title': 'Most Active Participant',
        'most_active_desc': '{author} sent the most messages ({count:,} messages, {percentage:.1f}% of total)',
        'participation_balance_title': 'Participation Balance',
        'participation_balance_desc': 'Messages are distributed among {count} participants, with {most_active} messages from the most active member',
        'peak_hour_title': 'Peak Conversation Hour',
        'peak_hour_desc': 'Most messages are sent around {hour}:00 (hour {hour})',
        'most_active_day_title': 'Most Active Day',
        'most_active_day_desc': '{day} is the most active day of the week',
        'activity_trend_title': 'Activity Trend',
        'activity_trend_desc': 'Conversation activity is {trend} over time',
        'most_used_word_title': 'Most Used Word',
        'most_used_word_desc': "'{word}' is the most frequently used word (appears {count} times)",
        'avg_message_length_title': 'Average Message Length',
        'avg_message_length_desc': 'Messages average {avg:.0f} characters in length',
        'media_sharing_title': 'Media Sharing',
        'media_sharing_desc': '{count:,} media messages were shared ({percentage:.1f}% of all messages)',
        'conversation_style_title': 'Conversation Style',
        'conversation_style_desc': 'With {count:,} messages, this is a {activity} active conversation',
        'trend_increasing': 'increasing',
        'trend_decreasing': 'decreasing',
        'trend_stable': 'stable',
        'highly_active': 'highly',
        'moderately_active': 'moderately',
        'lightly_active': 'lightly',
        'weekdays': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    'it': {
        'total_messages_title': 'Messaggi Totali',
        'total_messages_desc': 'La tua conversazione contiene {count:,} messaggi',
        'conversation_duration_title': 'Durata Conversazione',
        'conversation_duration_desc': 'La conversazione copre {days} giorni (dal {start} al {end})',
        'average_activity_title': 'Attività Media',
        'average_activity_desc': 'In media, {avg:.1f} messaggi vengono inviati al giorno',
        'most_active_title': 'Partecipante Più Attivo',
        'most_active_desc': '{author} ha inviato più messaggi ({count:,} messaggi, {percentage:.1f}% del totale)',
        'participation_balance_title': 'Bilanciamento Partecipazione',
        'participation_balance_desc': 'I messaggi sono distribuiti tra {count} partecipanti, con {most_active} messaggi dal membro più attivo',
        'peak_hour_title': 'Ora di Picco',
        'peak_hour_desc': 'La maggior parte dei messaggi viene inviata intorno alle {hour}:00',
        'most_active_day_title': 'Giorno Più Attivo',
        'most_active_day_desc': '{day} è il giorno più attivo della settimana',
        'activity_trend_title': 'Tendenza Attività',
        'activity_trend_desc': "L'attività della conversazione è {trend} nel tempo",
        'most_used_word_title': 'Parola Più Usata',
        'most_used_word_desc': "'{word}' è la parola più frequente (appare {count} volte)",
        'avg_message_length_title': 'Lunghezza Media Messaggi',
        'avg_message_length_desc': 'I messaggi hanno in media {avg:.0f} caratteri',
        'media_sharing_title': 'Condivisione Media',
        'media_sharing_desc': '{count:,} messaggi media sono stati condivisi ({percentage:.1f}% di tutti i messaggi)',
        'conversation_style_title': 'Stile Conversazione',
        'conversation_style_desc': 'Con {count:,} messaggi, questa è una conversazione {activity} attiva',
        'trend_increasing': 'in aumento',
        'trend_decreasing': 'in diminuzione',
        'trend_stable': 'stabile',
        'highly_active': 'molto',
        'moderately_active': 'moderatamente',
        'lightly_active': 'poco',
        'weekdays': ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
    }
}


class InsightsGenerator:
    """Generates actionable insights from conversation data."""
    
    def __init__(self, messages: List[Message], language: str = 'en'):
        self.messages = messages
        self.user_messages = [m for m in messages if not m.is_system]
        self.stats_service = StatisticsService(messages)
        self.word_analyzer = WordAnalyzer(messages)
        self.lang = language if language in INSIGHT_TRANSLATIONS else 'en'
        self.tr = INSIGHT_TRANSLATIONS[self.lang]
    
    def generate_insights(self) -> InsightResponse:
        """Generate comprehensive insights about the conversation."""
        insights = []
        
        # Activity insights
        insights.extend(self._get_activity_insights())
        
        # Author insights
        insights.extend(self._get_author_insights())
        
        # Temporal insights
        insights.extend(self._get_temporal_insights())
        
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
            title=self.tr['total_messages_title'],
            description=self.tr['total_messages_desc'].format(count=total),
            value=total,
            category="activity"
        ))
        
        # Date range
        timestamps = [m.timestamp for m in self.user_messages]
        date_range = max(timestamps) - min(timestamps)
        days = date_range.days
        date_format = '%d/%m/%Y' if self.lang == 'it' else '%Y-%m-%d'
        insights.append(Insight(
            title=self.tr['conversation_duration_title'],
            description=self.tr['conversation_duration_desc'].format(
                days=days,
                start=min(timestamps).strftime(date_format),
                end=max(timestamps).strftime(date_format)
            ),
            value=days,
            category="activity"
        ))
        
        # Messages per day average
        avg_per_day = total / days if days > 0 else total
        insights.append(Insight(
            title=self.tr['average_activity_title'],
            description=self.tr['average_activity_desc'].format(avg=avg_per_day),
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
            title=self.tr['most_active_title'],
            description=self.tr['most_active_desc'].format(
                author=most_active[0],
                count=most_active[1],
                percentage=percentage
            ),
            value=most_active[0],
            category="authors"
        ))
        
        # Participation distribution
        if len(author_counts) > 1:
            counts = list(author_counts.values())
            insights.append(Insight(
                title=self.tr['participation_balance_title'],
                description=self.tr['participation_balance_desc'].format(
                    count=len(author_counts),
                    most_active=most_active[1]
                ),
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
            title=self.tr['peak_hour_title'],
            description=self.tr['peak_hour_desc'].format(hour=peak_hour),
            value=peak_hour,
            category="temporal"
        ))
        
        # Peak day of week
        weekday_counts = Counter(m.timestamp.weekday() for m in self.user_messages)
        peak_weekday = weekday_counts.most_common(1)[0][0]
        weekday_name = self.tr['weekdays'][peak_weekday]
        insights.append(Insight(
            title=self.tr['most_active_day_title'],
            description=self.tr['most_active_day_desc'].format(day=weekday_name),
            value=weekday_name,
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
            if second_half > first_half:
                trend = self.tr['trend_increasing']
            elif first_half > second_half:
                trend = self.tr['trend_decreasing']
            else:
                trend = self.tr['trend_stable']
            insights.append(Insight(
                title=self.tr['activity_trend_title'],
                description=self.tr['activity_trend_desc'].format(trend=trend),
                value=trend,
                category="temporal"
            ))
        
        return insights
    
    def _get_word_insights(self) -> List[Insight]:
        """Generate insights about word usage."""
        insights = []
        
        word_freq = self.word_analyzer.get_word_frequency(limit=10, min_length=4)
        if word_freq.words:
            top_word = word_freq.words[0]
            insights.append(Insight(
                title=self.tr['most_used_word_title'],
                description=self.tr['most_used_word_desc'].format(
                    word=top_word.word,
                    count=top_word.count
                ),
                value=top_word.word,
                category="words"
            ))
        
        # Average message length
        lengths = [len(m.content) for m in self.user_messages if m.content and not m.is_media]
        if lengths:
            avg_length = mean(lengths)
            insights.append(Insight(
                title=self.tr['avg_message_length_title'],
                description=self.tr['avg_message_length_desc'].format(avg=avg_length),
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
                title=self.tr['media_sharing_title'],
                description=self.tr['media_sharing_desc'].format(
                    count=media_count,
                    percentage=media_percentage
                ),
                value=media_count,
                category="patterns"
            ))
        
        # Conversation density (messages per hour in peak times)
        # This is a simple approximation
        if total > 10:
            if total > 1000:
                activity_level = self.tr['highly_active']
            elif total > 100:
                activity_level = self.tr['moderately_active']
            else:
                activity_level = self.tr['lightly_active']
            insights.append(Insight(
                title=self.tr['conversation_style_title'],
                description=self.tr['conversation_style_desc'].format(
                    count=total,
                    activity=activity_level
                ),
                value=total,
                category="patterns"
            ))
        
        return insights


