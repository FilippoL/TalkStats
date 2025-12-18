from datetime import datetime
from pydantic import BaseModel


class Message(BaseModel):
    """Represents a WhatsApp message."""
    timestamp: datetime
    author: str
    content: str
    is_system: bool = False
    is_media: bool = False

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


