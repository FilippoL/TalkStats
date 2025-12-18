from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class TimeSeriesDataPoint(BaseModel):
    """A single data point in a time series."""
    timestamp: datetime
    value: int


class AuthorStats(BaseModel):
    """Statistics for a specific author."""
    author: str
    message_count: int
    avg_message_length: float
    total_chars: int
    media_count: int


class MediaStats(BaseModel):
    """Statistics about media messages."""
    total_media: int
    media_percentage: float  # Percentage of total messages that are media
    media_by_author: Dict[str, int]  # Media count per author
    media_over_time: List[TimeSeriesDataPoint]  # Media messages over time


class StatsResponse(BaseModel):
    """Response containing aggregated statistics."""
    total_messages: int
    total_authors: int
    date_range: Dict[str, Optional[datetime]]
    author_stats: List[AuthorStats]
    media_stats: Optional[MediaStats] = None
    time_series: List[TimeSeriesDataPoint]
    grouped_data: Dict[str, Any]  # Flexible structure for various groupings


class WordFrequencyItem(BaseModel):
    """A word with its frequency."""
    word: str
    count: int
    frequency: float  # Percentage


class WordFrequencyResponse(BaseModel):
    """Response containing word frequency data."""
    words: List[WordFrequencyItem]
    total_words: int
    unique_words: int


class Insight(BaseModel):
    """A single insight about the conversation."""
    title: str
    description: str
    value: Optional[Any] = None
    category: str


class InsightResponse(BaseModel):
    """Response containing conversation insights."""
    insights: List[Insight]


