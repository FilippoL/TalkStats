import re
from datetime import datetime
from typing import List, Optional
from dateutil import parser as date_parser

from ..models.message import Message


class WhatsAppParser:
    """Parser for WhatsApp chat export files."""
    
    # Pattern 1: "M/D/YY, HH:MM - Author: message" (without brackets)
    MESSAGE_PATTERN_DASH = re.compile(
        r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s+(\d{1,2}:\d{2})\s+-\s+(.+?):\s+(.+)$'
    )
    
    # Pattern 2: "[DD/MM/YY, HH:MM:SS] Author: message" (with brackets, Italian format)
    MESSAGE_PATTERN_BRACKET = re.compile(
        r'^\[(\d{1,2}/\d{1,2}/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s+(.+?):\s+(.+)$'
    )
    
    # System pattern 1: "M/D/YY, HH:MM - System message" (without brackets)
    SYSTEM_PATTERN_DASH = re.compile(
        r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s+(\d{1,2}:\d{2})\s+-\s+(.+)$'
    )
    
    # System pattern 2: "[DD/MM/YY, HH:MM:SS] system message" (with brackets)
    SYSTEM_PATTERN_BRACKET = re.compile(
        r'^\[(\d{1,2}/\d{1,2}/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s+(.+)$'
    )
    
    SYSTEM_KEYWORDS = [
        'created group',
        'added',
        'removed',
        'left',
        'changed',
        'Messages and calls are end-to-end encrypted',
        'changed the subject',
        'changed this group\'s icon',
        'deleted this group\'s icon',
        # Italian keywords
        'ha creato questo gruppo',
        'ti ha aggiunto',
        'ha abbandonato',
        'ha rimosso',
        'ha modificato',
        'crittografati end-to-end',
        'crittografate end-to-end',
    ]
    
    def __init__(self):
        self.messages: List[Message] = []
        self.current_message: Optional[Message] = None
    
    def parse(self, content: str) -> List[Message]:
        """
        Parse WhatsApp chat export content.
        
        Args:
            content: The raw text content of the WhatsApp export
            
        Returns:
            List of parsed Message objects
        """
        self.messages = []
        self.current_message = None
        
        lines = content.split('\n')
        
        # Skip the first 5 lines (usually group name, encryption notice, creation messages)
        lines = lines[5:] if len(lines) > 5 else lines
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Remove invisible characters (like \u200e left-to-right mark)
            line = line.replace('\u200e', '').replace('\u200f', '').replace('\u202a', '').replace('\u202c', '')
            
            # Try both message patterns
            message_match = self.MESSAGE_PATTERN_DASH.match(line) or self.MESSAGE_PATTERN_BRACKET.match(line)
            system_match = self.SYSTEM_PATTERN_DASH.match(line) or self.SYSTEM_PATTERN_BRACKET.match(line)
            
            if message_match:
                # Save previous message if exists
                if self.current_message:
                    self.messages.append(self.current_message)
                
                # Parse new message
                date_str, time_str, author, content = message_match.groups()
                timestamp = self._parse_datetime(date_str, time_str)
                # Check for media messages - support English and Italian formats
                content_stripped = content.strip().lower()
                
                # Media markers in various languages
                MEDIA_MARKERS = [
                    # English
                    '<media omitted>',
                    'media omitted',
                    '<image omitted>',
                    '<video omitted>',
                    '<audio omitted>',
                    '<sticker omitted>',
                    '<gif omitted>',
                    '<document omitted>',
                    '<contact card omitted>',
                    # Italian
                    '<media non incluso>',
                    'media non incluso',
                    '<immagine omessa>',
                    'immagine omessa',
                    '<video omesso>',
                    'video omesso',
                    '<audio omesso>',
                    'audio omesso',
                    '<sticker omesso>',
                    'sticker omesso',
                    '<gif omessa>',
                    'gif omessa',
                    '<documento omesso>',
                    'documento omesso',
                    '<scheda contatto omessa>',
                    'scheda contatto omessa',
                    '<file multimediale omesso>',
                    'file multimediale omesso',
                    # Generic patterns (partial match)
                ]
                is_media = any(marker in content_stripped for marker in MEDIA_MARKERS)
                
                self.current_message = Message(
                    timestamp=timestamp,
                    author=author.strip(),
                    content=content if not is_media else '',
                    is_system=False,
                    is_media=is_media
                )
            
            elif system_match:
                # Save previous message if exists
                if self.current_message:
                    self.messages.append(self.current_message)
                    self.current_message = None
                
                # Parse system message
                date_str, time_str, system_text = system_match.groups()
                timestamp = self._parse_datetime(date_str, time_str)
                is_system = any(keyword in system_text for keyword in self.SYSTEM_KEYWORDS)
                
                if is_system:
                    # Extract author if possible (e.g., "Puccio added you")
                    author_match = re.match(r'^([^:]+?)\s+(added|removed|created|left|changed)', system_text)
                    author = author_match.group(1).strip() if author_match else 'System'
                    
                    self.messages.append(Message(
                        timestamp=timestamp,
                        author=author,
                        content=system_text,
                        is_system=True,
                        is_media=False
                    ))
            
            elif self.current_message:
                # Continuation of previous message (multi-line)
                if self.current_message.content:
                    self.current_message.content += '\n' + line
                else:
                    self.current_message.content = line
        
        # Don't forget the last message
        if self.current_message:
            self.messages.append(self.current_message)
        
        return self.messages
    
    def _parse_datetime(self, date_str: str, time_str: str) -> datetime:
        """
        Parse date and time strings into a datetime object.
        
        Handles multiple formats:
        - "11/4/22, 18:40" (2-digit year)
        - "11/4/2022, 18:40" (4-digit year)
        - "04/11/22, 18:40" (European day/month/year)
        - "04-11-2022, 18:40" (dash separator)
        - "2022-11-04, 18:40" (ISO format)
        - "04.11.2022, 18:40" (dot separator)
        """
        # Normalize separators to /
        normalized_date = date_str.replace('-', '/').replace('.', '/')
        
        # Handle 2-digit years
        parts = normalized_date.split('/')
        if len(parts) == 3:
            # Check if year is last or first (ISO format: YYYY/MM/DD)
            if len(parts[0]) == 4:  # ISO format
                year = int(parts[0])
                month = int(parts[1])
                day = int(parts[2])
            else:
                # Determine if day-first (European) or month-first (US)
                first_num = int(parts[0])
                second_num = int(parts[1])
                year = int(parts[2])
                
                # Handle 2-digit years
                if year < 100:
                    if year <= 50:
                        year += 2000
                    else:
                        year += 1900
                
                # Auto-detect format: if first number > 12, it must be day
                # If second number > 12, first must be month
                # Otherwise, default to day-first (European/Italian format)
                if first_num > 12:
                    # Day-first format (DD/MM/YYYY)
                    day = first_num
                    month = second_num
                elif second_num > 12:
                    # Month-first format (MM/DD/YYYY)
                    month = first_num
                    day = second_num
                else:
                    # Ambiguous: default to day-first (European/Italian)
                    day = first_num
                    month = second_num
            
            # Parse time
            time_parts = time_str.replace('.', ':').split(':')
            hour = int(time_parts[0])
            minute = int(time_parts[1]) if len(time_parts) > 1 else 0
            
            try:
                return datetime(year, month, day, hour, minute)
            except ValueError:
                # Invalid date (e.g., month=13), try swapping day/month
                try:
                    return datetime(year, day, month, hour, minute)
                except ValueError:
                    pass
        
        # Fallback: try dateutil with day-first preference
        try:
            datetime_str = f"{date_str} {time_str}"
            dt = date_parser.parse(datetime_str, dayfirst=True)
            return dt
        except (ValueError, AttributeError):
            # Last resort: return current time
            return datetime.now()


