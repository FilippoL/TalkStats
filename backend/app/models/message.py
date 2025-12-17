from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Message(BaseModel):
    """Represents a WhatsApp message."""
    timestamp: datetime
    author: str
    content: str
    is_system: bool = False
    is_media: bool = False
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


