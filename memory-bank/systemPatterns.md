# System Patterns

## Architectural Patterns

- **Service Layer Pattern**: Backend separates concerns into dedicated services (StatisticsService, SentimentAnalyzer, WordAnalyzer, InsightsGenerator)
- **Repository Pattern (Simplified)**: `_file_cache` dictionary acts as in-memory repository for parsed messages
- **API Gateway**: All frontend requests go through `/api/*` endpoints, served by FastAPI

## Design Patterns

- **Factory Pattern**: `WhatsAppParser.parse()` creates Message objects from raw text
- **Strategy Pattern**: Time grouping uses configurable strategy (hour/day/week/month)
- **Singleton Pattern**: Service instances created once and reused across requests
- **Observer Pattern**: React's `useStats` hook observes filter changes and triggers API calls

## Common Idioms

### Backend (Python/FastAPI)

```python
# Regex pattern for WhatsApp message parsing
PATTERN = r'(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.*)'

# Filter messages with list comprehension
filtered = [m for m in messages if m.author in authors]

# Sentiment analysis with VADER
analyzer = SentimentIntensityAnalyzer()
scores = analyzer.polarity_scores(text)
```

### Frontend (React/TypeScript)

```typescript
// Custom hook pattern for data fetching
const { stats, loading, error, fetchStats } = useStats();

// Filter state lifted to Dashboard component
const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
const [timeGrouping, setTimeGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('day');

// Conditional rendering pattern
{loading ? <Spinner /> : <Chart data={stats} />}
```

## File Organization

- **Backend**: `app/` with `api/`, `models/`, `parsers/`, `services/` subdirectories
- **Frontend**: `src/` with `components/`, `hooks/`, `types/` subdirectories
- **Charts**: Separate file per chart type in `components/charts/`

## API Conventions

- All endpoints prefixed with `/api/`
- Query parameters for filtering (`?file_id=X&authors=A,B&sentiment=positive`)
- JSON responses with consistent structure
- HTTP 400 for validation errors, 404 for not found