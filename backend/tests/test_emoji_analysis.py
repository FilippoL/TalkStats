"""Unit tests for emoji analysis service."""
import pytest
from app.models.message import Message
from app.services.emoji_analysis import EmojiAnalyzer


class TestEmojiAnalyzer:
    """Test suite for EmojiAnalyzer service."""
    
    def test_extract_emojis_single(self):
        """Test extracting a single emoji from text."""
        messages = []
        analyzer = EmojiAnalyzer(messages)
        
        emojis = analyzer.extract_emojis("Hello 😀 world")
        assert len(emojis) == 1
        assert emojis[0] == "😀"
    
    def test_extract_emojis_multiple(self):
        """Test extracting multiple emojis from text."""
        messages = []
        analyzer = EmojiAnalyzer(messages)
        
        emojis = analyzer.extract_emojis("😀 😃 😄 😁")
        assert len(emojis) == 4
        assert "😀" in emojis
        assert "😃" in emojis
    
    def test_extract_emojis_no_emojis(self):
        """Test extracting from text without emojis."""
        messages = []
        analyzer = EmojiAnalyzer(messages)
        
        emojis = analyzer.extract_emojis("Hello world")
        assert len(emojis) == 0
    
    def test_analyze_empty_messages(self):
        """Test analyzing with no messages."""
        messages = []
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        assert result['total_emojis'] == 0
        assert result['unique_emojis'] == 0
        assert result['top_emojis'] == []
        assert result['by_author'] == {}
    
    def test_analyze_single_emoji_single_author(self):
        """Test analyzing a single emoji from one author."""
        messages = [
            Message(
                timestamp="2024-01-01T10:00:00",
                author="Alice",
                content="Hello 😀",
                is_system=False,
                is_media=False
            )
        ]
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        assert result['total_emojis'] == 1
        assert result['unique_emojis'] == 1
        assert len(result['top_emojis']) == 1
        assert result['top_emojis'][0]['emoji'] == "😀"
        assert result['top_emojis'][0]['count'] == 1
        assert 'Alice' in result['by_author']
        assert result['by_author']['Alice']['total'] == 1
    
    def test_analyze_multiple_authors(self):
        """Test analyzing emojis from multiple authors."""
        messages = [
            Message(
                timestamp="2024-01-01T10:00:00",
                author="Alice",
                content="Hello 😀 😀",
                is_system=False,
                is_media=False
            ),
            Message(
                timestamp="2024-01-01T10:01:00",
                author="Bob",
                content="Hi 😀",
                is_system=False,
                is_media=False
            )
        ]
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        assert result['total_emojis'] == 3
        assert result['unique_emojis'] == 1
        assert len(result['by_author']) == 2
        assert result['by_author']['Alice']['total'] == 2
        assert result['by_author']['Bob']['total'] == 1
        assert result['by_author']['Alice']['unique'] == 1
        assert result['by_author']['Bob']['unique'] == 1
    
    def test_analyze_by_author_is_dict_not_module(self):
        """Test that by_author contains proper dictionaries, not module objects.
        
        This test specifically catches the bug where emoji module was used as dict key.
        """
        messages = [
            Message(
                timestamp="2024-01-01T10:00:00",
                author="Alice",
                content="Hello 😀 😃",
                is_system=False,
                is_media=False
            )
        ]
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        # Check that by_author is properly structured
        assert isinstance(result['by_author'], dict)
        assert 'Alice' in result['by_author']
        
        author_data = result['by_author']['Alice']
        assert isinstance(author_data, dict)
        
        # Check that top_emojis contains proper emoji strings
        assert 'top_emojis' in author_data
        assert isinstance(author_data['top_emojis'], list)
        
        for emoji_entry in author_data['top_emojis']:
            assert 'emoji' in emoji_entry
            assert 'count' in emoji_entry
            # Ensure it's a string, not the emoji module
            assert isinstance(emoji_entry['emoji'], str)
            assert isinstance(emoji_entry['count'], int)
            # Make sure it's an actual emoji, not a module object
            assert len(emoji_entry['emoji']) > 0
            assert emoji_entry['emoji'] != 'emoji'  # Not the module name
    
    def test_analyze_top_emojis_sorted(self):
        """Test that top emojis are sorted by count."""
        messages = [
            Message(
                timestamp="2024-01-01T10:00:00",
                author="Alice",
                content="😀 😀 😀 😃 😃 😄",
                is_system=False,
                is_media=False
            )
        ]
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        top = result['top_emojis']
        assert top[0]['emoji'] == "😀"
        assert top[0]['count'] == 3
        assert top[1]['emoji'] == "😃"
        assert top[1]['count'] == 2
        assert top[2]['emoji'] == "😄"
        assert top[2]['count'] == 1
    
    def test_analyze_ignores_system_messages(self):
        """Test that system messages are excluded from analysis."""
        messages = [
            Message(
                timestamp="2024-01-01T10:00:00",
                author="Alice",
                content="Hello 😀",
                is_system=False,
                is_media=False
            ),
            Message(
                timestamp="2024-01-01T10:01:00",
                author="System",
                content="Alice changed the group name 😀",
                is_system=True,
                is_media=False
            )
        ]
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        # Only Alice's message should be counted
        assert result['total_emojis'] == 1
        assert 'System' not in result['by_author']
    
    def test_analyze_ignores_media_messages(self):
        """Test that media-only messages are excluded from analysis."""
        messages = [
            Message(
                timestamp="2024-01-01T10:00:00",
                author="Alice",
                content="Hello 😀",
                is_system=False,
                is_media=False
            ),
            Message(
                timestamp="2024-01-01T10:01:00",
                author="Bob",
                content="<Media omitted> 😀",
                is_system=False,
                is_media=True
            )
        ]
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        # Only Alice's message should be counted
        assert result['total_emojis'] == 1
        assert 'Bob' not in result['by_author']
    
    def test_analyze_emojis_per_message(self):
        """Test emojis per message calculation."""
        messages = [
            Message(
                timestamp="2024-01-01T10:00:00",
                author="Alice",
                content="Hello 😀 😃",
                is_system=False,
                is_media=False
            ),
            Message(
                timestamp="2024-01-01T10:01:00",
                author="Alice",
                content="World 😄",
                is_system=False,
                is_media=False
            )
        ]
        analyzer = EmojiAnalyzer(messages)
        result = analyzer.analyze()
        
        # 3 emojis / 2 messages = 1.5 per message
        assert result['emojis_per_message'] == 1.5
