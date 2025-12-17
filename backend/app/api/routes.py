from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from fastapi.responses import JSONResponse

from ..parsers.whatsapp import WhatsAppParser
from ..services.statistics import StatisticsService
from ..services.sentiment import SentimentAnalyzer
from ..services.word_analysis import WordAnalyzer
from ..services.insights import InsightsGenerator
from ..models.stats import StatsResponse, WordFrequencyResponse, InsightResponse


router = APIRouter()

# In-memory storage for parsed messages (session-based)
# In production, use proper session management or database
_parsed_messages_cache: dict = {}
_sentiment_analyzer = SentimentAnalyzer()


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and parse WhatsApp chat export file."""
    global _parsed_messages_cache
    
    try:
        # Clear all previous cache entries to ensure fresh analysis
        _parsed_messages_cache.clear()
        
        # Read file content
        content = await file.read()
        text_content = content.decode('utf-8', errors='ignore')
        
        # Parse messages
        parser = WhatsAppParser()
        messages = parser.parse(text_content)
        
        # Analyze sentiment for each message
        for message in messages:
            if not message.is_system and message.content and not message.is_media:
                sentiment, score = _sentiment_analyzer.analyze(message.content)
                message.sentiment = sentiment
                message.sentiment_score = score
        
        # Store in cache with a fixed key (single-user mode)
        cache_key = "current"
        _parsed_messages_cache[cache_key] = messages
        
        # Get authors
        authors = list(set(m.author for m in messages if not m.is_system))
        
        return JSONResponse(content={
            "status": "success",
            "message_count": len(messages),
            "authors": authors,
            "cache_key": cache_key
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.get("/api/authors")
async def get_authors(cache_key: Optional[str] = Query(None, alias="key")):
    """Get list of all authors."""
    messages = _get_messages_from_cache(cache_key)
    authors = list(set(m.author for m in messages if not m.is_system))
    return {"authors": sorted(authors)}


@router.get("/api/stats", response_model=StatsResponse)
async def get_stats(
    cache_key: Optional[str] = Query(None, alias="key"),
    authors: Optional[str] = Query(None, description="Comma-separated list of authors"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    time_group: str = Query("day", regex="^(hour|day|week|month)$", description="Time grouping"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    group_by_author: bool = Query(False, description="Include author-specific groupings"),
    group_by_sentiment: bool = Query(False, description="Include sentiment-specific groupings")
):
    """Get aggregated statistics with optional filters."""
    messages = _get_messages_from_cache(cache_key)
    
    # Build filter parameters
    author_list = [a.strip() for a in authors.split(",")] if authors else None
    
    start_dt = None
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
    
    end_dt = None
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
    
    # Filter and compute stats
    stats_service = StatisticsService(messages)
    filtered_service = stats_service.filter_messages(
        authors=author_list,
        start_date=start_dt,
        end_date=end_dt,
        sentiment=sentiment
    )
    
    stats = filtered_service.compute_stats(
        time_group=time_group,
        group_by_author=group_by_author,
        group_by_sentiment=group_by_sentiment
    )
    
    return stats


@router.get("/api/word-frequency", response_model=WordFrequencyResponse)
async def get_word_frequency(
    cache_key: Optional[str] = Query(None, alias="key"),
    authors: Optional[str] = Query(None, description="Comma-separated list of authors"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of words"),
    min_length: int = Query(1, ge=1, description="Minimum word length")
):
    """Get word frequency analysis with optional filters."""
    messages = _get_messages_from_cache(cache_key)
    
    # Build filter parameters
    author_list = [a.strip() for a in authors.split(",")] if authors else None
    
    start_dt = None
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
    
    end_dt = None
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
    
    # Get word frequency
    word_analyzer = WordAnalyzer(messages)
    word_freq = word_analyzer.get_word_frequency(
        authors=author_list,
        start_date=start_dt,
        end_date=end_dt,
        sentiment=sentiment,
        limit=limit,
        min_length=min_length
    )
    
    return word_freq


@router.get("/api/insights", response_model=InsightResponse)
async def get_insights(cache_key: Optional[str] = Query(None, alias="key")):
    """Generate conversation insights."""
    messages = _get_messages_from_cache(cache_key)
    
    insights_generator = InsightsGenerator(messages)
    insights = insights_generator.generate_insights()
    
    return insights


def _get_messages_from_cache(cache_key: Optional[str]):
    """Get messages from cache. Uses fixed 'current' key for single-user mode."""
    # Always use 'current' key in single-user mode
    cache_key = "current"
    
    if cache_key not in _parsed_messages_cache:
        raise HTTPException(status_code=400, detail="No data available. Please upload a file first.")
    
    return _parsed_messages_cache[cache_key]


