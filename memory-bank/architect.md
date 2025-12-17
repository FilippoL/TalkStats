# WhatsApp Conversation Analyzer: System Architecture

## Overview
Full-stack application with FastAPI backend and React frontend. Backend handles file parsing, analysis, and caching. Frontend provides interactive visualizations and filtering.

## System Components

### Backend Services (`backend/app/services/`)

| Service | File | Responsibility |
|---------|------|----------------|
| WhatsAppParser | `parsers/whatsapp.py` | Parse chat export files, extract messages |
| StatisticsService | `services/statistics.py` | Calculate author stats, time series, distributions |
| SentimentAnalyzer | `services/sentiment.py` | VADER sentiment + emotion keyword detection |
| WordAnalyzer | `services/word_analysis.py` | Word frequency with stopword filtering |
| InsightsGenerator | `services/insights.py` | Generate AI-like observations |

### API Endpoints (`backend/app/api/routes.py`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload and parse WhatsApp chat file |
| `/api/authors` | GET | List all conversation authors |
| `/api/stats` | GET | Get filtered statistics |
| `/api/words` | GET | Get word frequency analysis |
| `/api/insights` | GET | Get generated insights |
| `/api/health` | GET | Health check for deployment |

### Data Models (`backend/app/models/`)

- **Message**: timestamp, author, content, is_system, is_media, sentiment
- **StatsResponse**: author_stats, sentiment_distribution, time_series, message_length_distribution
- **WordFrequency**: word, count, percentage
- **Insight**: title, description, category

### Frontend Components (`frontend/src/components/`)

**Core Flow**:
```
App.tsx → FileUpload.tsx → Dashboard.tsx
                              ├── AuthorSelector.tsx
                              ├── TimeRangeSelector.tsx
                              ├── SentimentFilter.tsx
                              └── charts/*.tsx (11 visualizations)
```

**Chart Components**:
1. MessageTimeline - Messages over time
2. HourlyTimeline - Activity by hour
3. AuthorActivity - Per-author comparison
4. SentimentDistribution - Sentiment breakdown
5. SentimentOverTime - Sentiment trends
6. WordFrequency - Top words visualization
7. ActivityHeatmap - Day/hour heatmap
8. MessageLengthDistribution - Length stats
9. MessageLengthHistogram - Length histogram
10. MessageLengthComparison - Author comparison
11. MediaStatistics - Media message stats

### Data Flow

```
1. User uploads .txt file → POST /api/upload
2. WhatsAppParser extracts messages → cached in _file_cache[file_id]
3. User selects filters → GET /api/stats?file_id=X&authors=...
4. StatisticsService computes filtered stats
5. Frontend receives JSON → Recharts renders visualizations
```

## Caching Strategy

- In-memory dictionary cache (`_file_cache`)
- Key: UUID file_id generated on upload
- Value: List of parsed Message objects
- Cleared on server restart (no persistence)

