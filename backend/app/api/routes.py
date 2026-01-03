import uuid
import zipfile
import io
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from fastapi.responses import JSONResponse

from ..parsers.whatsapp import WhatsAppParser
from ..services.statistics import StatisticsService
from ..services.word_analysis import WordAnalyzer
from ..services.insights import InsightsGenerator
from ..services.emoji_analysis import EmojiAnalyzer
from ..services.firestore_client import firestore_client
from ..models.stats import StatsResponse, WordFrequencyResponse, InsightResponse
from ..models.message import Message


router = APIRouter()

# Session TTL in seconds (1 hour)
SESSION_TTL = 3600
# Share link TTL in seconds (1 hour)
SHARE_TTL = 3600


def _generate_session_id() -> str:
    """Generate a unique session ID."""
    return str(uuid.uuid4())


def _extract_txt_from_zip(zip_content: bytes) -> str:
    """
    Extract the WhatsApp chat .txt file from a zip archive.
    WhatsApp exports typically name the file '_chat.txt' or similar.
    """
    try:
        with zipfile.ZipFile(io.BytesIO(zip_content), 'r') as zip_ref:
            # Find .txt files in the archive
            txt_files = [f for f in zip_ref.namelist() if f.lower().endswith('.txt')]
            
            if not txt_files:
                raise ValueError("No .txt file found in the zip archive")
            
            # Prefer files with 'chat' in the name (WhatsApp naming convention)
            chat_files = [f for f in txt_files if 'chat' in f.lower()]
            target_file = chat_files[0] if chat_files else txt_files[0]
            
            # Extract and decode the file content
            with zip_ref.open(target_file) as txt_file:
                return txt_file.read().decode('utf-8', errors='ignore')
    except zipfile.BadZipFile:
        raise ValueError("Invalid zip file")


def _detect_language(text: str) -> str:
    """
    Simple language detection based on common words.
    Returns 'it' for Italian, 'en' for English.
    """
    # Sample first 5000 chars for detection
    sample = text[:5000].lower()
    
    # Italian indicators
    italian_words = ['ciao', 'che', 'sono', 'come', 'anche', 'questo', 'quella', 
                     'perché', 'quando', 'dove', 'cosa', 'fatto', 'bene', 'grazie',
                     'prego', 'buongiorno', 'buonasera', 'allora', 'quindi', 'però']
    
    # English indicators  
    english_words = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you',
                     'this', 'but', 'from', 'they', 'what', 'been', 'would',
                     'there', 'their', 'will', 'when', 'who', 'make', 'like']
    
    italian_count = sum(1 for word in italian_words if f' {word} ' in sample or sample.startswith(f'{word} '))
    english_count = sum(1 for word in english_words if f' {word} ' in sample or sample.startswith(f'{word} '))
    
    return 'it' if italian_count > english_count else 'en'


@router.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    language: Optional[str] = Query(None, description="Language: 'it' or 'en'. Auto-detect if not provided.")
):
    """Upload and parse WhatsApp chat export file (.txt or .zip)."""
    try:
        # Read file content
        try:
            content = await file.read()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

        if not content or len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Check if it's a zip file and extract the txt
        filename = file.filename.lower() if file.filename else ""
        if filename.endswith('.zip') or content[:4] == b'PK\x03\x04':  # ZIP magic bytes
            try:
                text_content = _extract_txt_from_zip(content)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid zip file: {str(e)}")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Unexpected error extracting zip: {str(e)}")
        else:
            try:
                text_content = content.decode('utf-8', errors='ignore')
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to decode file as UTF-8: {str(e)}")

        if not text_content or len(text_content.strip()) == 0:
            raise HTTPException(status_code=400, detail="File contains no readable text.")

        # Detect or use provided language
        try:
            detected_lang = language if language in ['it', 'en'] else _detect_language(text_content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Language detection failed: {str(e)}")

        # Parse messages
        try:
            parser = WhatsAppParser()
            messages = parser.parse(text_content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse WhatsApp messages: {str(e)}")

        if not messages or len(messages) == 0:
            raise HTTPException(status_code=400, detail="No messages found in the file.")

        # Generate unique session ID
        session_id = _generate_session_id()


        # Convert messages to dicts and ensure all datetimes are ISO strings
        def make_json_serializable(obj):
            if isinstance(obj, dict):
                return {k: make_json_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_json_serializable(i) for i in obj]
            elif isinstance(obj, datetime):
                return obj.isoformat()
            else:
                return obj

        try:
            messages_serializable = []
            for m in messages:
                if hasattr(m, 'dict'):
                    d = m.dict()
                elif hasattr(m, '__dict__'):
                    d = dict(m.__dict__)
                else:
                    d = m
                d = make_json_serializable(d)
                messages_serializable.append(d)
        except Exception as e:
            print(f"[ERROR] Failed to convert messages to serializable: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to serialize messages: {str(e)}")

        # Store session data directly in Firestore (messages stored in subcollection)
        session_data = {
            'messages': messages_serializable,  # Will be handled by firestore_client
            'language': detected_lang,
            'created_at': datetime.now().isoformat(),
        }

        # Note: Size check removed - Firestore handles large data via subcollections
        print(f"[INFO] Processing {len(messages_serializable)} messages")

        try:
            result = firestore_client.set(f"session:{session_id}", session_data, SESSION_TTL)
            print(f"[INFO] Firestore set result: {result}")
            if not result:
                print(f"[ERROR] Firestore set returned False for session:{session_id}")
                raise HTTPException(status_code=500, detail="Failed to store session data in Firestore.")
        except Exception as e:
            print(f"[ERROR] Firestore error: {e}")
            raise HTTPException(status_code=500, detail=f"Firestore error: {str(e)}")

        # Get authors
        try:
            authors = list(set(m.author for m in messages if not m.is_system))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to extract authors: {str(e)}")

        return JSONResponse(content={
            "status": "success",
            "message_count": len(messages),
            "authors": authors,
            "cache_key": session_id,
            "language": detected_lang
        })

    except HTTPException as e:
        # Re-raise HTTPExceptions for FastAPI to handle
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


def _get_session_data(session_id: Optional[str]) -> dict:
    """Get session data from Firestore by session ID."""
    if not session_id:
        raise HTTPException(status_code=400, detail="No data available. Please upload a file first.")
    
    session_data = firestore_client.get(f"session:{session_id}")
    
    if not session_data:
        raise HTTPException(status_code=400, detail="No data available. Please upload a file first.")
    
    return session_data


def _get_messages_from_session(session_id: Optional[str]):
    """Get messages from session."""
    session_data = _get_session_data(session_id)
    messages_dicts = session_data['messages']
    return [Message(**msg_dict) for msg_dict in messages_dicts]


def _get_language_from_session(session_id: Optional[str]) -> str:
    """Get language from session."""
    session_data = _get_session_data(session_id)
    return session_data.get('language', 'en')


@router.get("/api/authors")
async def get_authors(cache_key: Optional[str] = Query(None, alias="key")):
    """Get list of all authors."""
    messages = _get_messages_from_session(cache_key)
    authors = list(set(m.author for m in messages if not m.is_system))
    return {"authors": sorted(authors)}


@router.get("/api/stats", response_model=StatsResponse)
async def get_stats(
    cache_key: Optional[str] = Query(None, alias="key"),
    authors: Optional[str] = Query(None, description="Comma-separated list of authors"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    time_group: str = Query("day", regex="^(hour|day|week|month)$", description="Time grouping"),
    group_by_author: bool = Query(False, description="Include author-specific groupings")
):
    """Get aggregated statistics with optional filters."""
    messages = _get_messages_from_session(cache_key)
    
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
    language = _get_language_from_session(cache_key)
    stats_service = StatisticsService(messages, language=language)
    filtered_service = stats_service.filter_messages(
        authors=author_list,
        start_date=start_dt,
        end_date=end_dt
    )
    
    stats = filtered_service.compute_stats(
        time_group=time_group,
        group_by_author=group_by_author
    )
    
    return stats


@router.get("/api/word-frequency", response_model=WordFrequencyResponse)
async def get_word_frequency(
    cache_key: Optional[str] = Query(None, alias="key"),
    authors: Optional[str] = Query(None, description="Comma-separated list of authors"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of words"),
    min_length: int = Query(1, ge=1, description="Minimum word length")
):
    """Get word frequency analysis with optional filters."""
    messages = _get_messages_from_session(cache_key)
    
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
        limit=limit,
        min_length=min_length
    )
    
    return word_freq


@router.get("/api/insights", response_model=InsightResponse)
async def get_insights(cache_key: Optional[str] = Query(None, alias="key")):
    """Generate conversation insights."""
    messages = _get_messages_from_session(cache_key)
    language = _get_language_from_session(cache_key)
    
    insights_generator = InsightsGenerator(messages, language=language)
    insights = insights_generator.generate_insights()
    
    return insights


@router.get("/api/language")
async def get_language(cache_key: Optional[str] = Query(None, alias="key")):
    """Get the detected/selected language for the current session."""
    try:
        language = _get_language_from_session(cache_key)
        return {"language": language}
    except HTTPException:
        return {"language": "en"}


@router.get("/api/emoji-stats")
async def get_emoji_stats(
    cache_key: Optional[str] = Query(None, alias="key"),
    authors: Optional[str] = Query(None, description="Comma-separated list of authors"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get emoji usage statistics."""
    messages = _get_messages_from_session(cache_key)
    
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
    
    # Filter messages if needed
    filtered_messages = messages
    if author_list:
        filtered_messages = [m for m in filtered_messages if m.author in author_list]
    if start_dt:
        filtered_messages = [m for m in filtered_messages if m.timestamp >= start_dt]
    if end_dt:
        filtered_messages = [m for m in filtered_messages if m.timestamp <= end_dt]
    
    # Analyze emojis
    emoji_analyzer = EmojiAnalyzer(filtered_messages)
    emoji_stats = emoji_analyzer.analyze()
    
    return emoji_stats


# ==================== SHARE FUNCTIONALITY ====================

@router.post("/api/share")
async def create_share_link(cache_key: Optional[str] = Query(None, alias="key")):
    """
    Create a shareable link for the current analysis.
    The link expires after 1 hour.
    """
    if not cache_key:
        raise HTTPException(status_code=400, detail="No session key provided")
    
    # Get session data
    session_data = firestore_client.get(f"session:{cache_key}")
    if not session_data:
        raise HTTPException(status_code=400, detail="Session not found or expired")
    
    # Get all the stats for the snapshot
    messages_dicts = session_data['messages']
    messages = [Message(**msg_dict) for msg_dict in messages_dicts]
    language = session_data.get('language', 'en')
    
    # Compute stats
    stats_service = StatisticsService(messages, language=language)
    stats = stats_service.compute_stats(time_group='day', group_by_author=True)
    
    # Get word frequency
    word_analyzer = WordAnalyzer(messages)
    word_freq = word_analyzer.get_word_frequency(limit=50, min_length=1)
    
    # Get insights
    insights_generator = InsightsGenerator(messages, language=language)
    insights = insights_generator.generate_insights()
    
    # Get emoji stats
    emoji_analyzer = EmojiAnalyzer(messages)
    emoji_stats = emoji_analyzer.analyze()
    
    # Create share ID
    share_id = _generate_session_id()
    expires_at = datetime.utcnow() + timedelta(seconds=SHARE_TTL)
    
    # Store snapshot
    snapshot = {
        'stats': stats.dict() if hasattr(stats, 'dict') else stats,
        'word_freq': word_freq.dict() if hasattr(word_freq, 'dict') else word_freq,
        'insights': insights.dict() if hasattr(insights, 'dict') else insights,
        'emoji_stats': emoji_stats,
        'language': language,
        'created_at': datetime.utcnow().isoformat(),
        'expires_at': expires_at.isoformat(),
    }
    
    if not firestore_client.set(f"share:{share_id}", snapshot, SHARE_TTL):
        raise HTTPException(status_code=500, detail="Failed to create share link")
    
    return {
        "share_id": share_id,
        "expires_at": expires_at.isoformat(),
        "ttl_seconds": SHARE_TTL,
    }


@router.get("/api/share/{share_id}")
async def get_shared_data(share_id: str):
    """
    Get shared analysis data by share ID.
    Returns the frozen stats snapshot.
    """
    snapshot = firestore_client.get(f"share:{share_id}")
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="Share link not found or expired")
    
    return snapshot

