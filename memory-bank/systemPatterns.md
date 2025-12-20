# System Patterns

## Architectural Patterns

- **Service Layer Pattern**: Backend separates concerns into dedicated services (StatisticsService, EmojiAnalyzer, WordAnalyzer, InsightsGenerator, RedisClient)
- **Session Storage Pattern**: Redis-backed sessions with UUID keys and automatic TTL expiration
- **API Gateway**: All frontend requests go through `/api/*` endpoints, served by FastAPI
- **Fallback Pattern**: RedisClient falls back to in-memory storage if Redis unavailable

## Design Patterns

- **Factory Pattern**: `WhatsAppParser.parse()` creates Message objects from raw text
- **Strategy Pattern**: Time grouping uses configurable strategy (hour/day/week/month)
- **Singleton Pattern**: RedisClient uses `__new__` for single instance across requests
- **Observer Pattern**: React's `useStats` hook observes filter changes and triggers API calls
- **Adapter Pattern**: RedisClient adapts both Upstash REST API and standard Redis to same interface

## Session Management

```python
# Session flow
1. Upload file → Generate UUID session_id → Store in Redis with TTL
2. API requests include session_id → Retrieve from Redis
3. Sessions auto-expire after 1 hour (SESSION_TTL = 3600)

# Share flow
1. Create share → Snapshot current data → Store with share_id and SHARE_TTL
2. Access /share/{id} → Retrieve snapshot → Display read-only view
```

## Common Idioms

### Backend (Python/FastAPI)

```python
# Upstash REST API pattern
def _upstash_request(self, command: list) -> Optional[Any]:
    response = requests.post(self._upstash_url,
        headers={"Authorization": f"Bearer {self._upstash_token}"},
        json=command)
    return response.json().get('result')

# ZIP file extraction
if filename.endswith('.zip') or content[:4] == b'PK\x03\x04':
    text_content = _extract_txt_from_zip(content)

# Session data retrieval
session_data = redis_client.get(f"session:{session_id}")
```

### Frontend (React/TypeScript)

```typescript
// PDF export with section selection
const exportToPDF = async (sections: string[], filename: string) => {
  const pdf = new jsPDF();
  for (const section of sections) {
    const element = document.getElementById(`chart-${section}`);
    const canvas = await html2canvas(element);
    pdf.addImage(canvas.toDataURL('image/png'), ...);
  }
  pdf.save(filename);
};

// Share link generation
const generateShareLink = async () => {
  const response = await axios.post('/api/share', { cache_key: sessionId });
  setShareUrl(`${window.location.origin}/share/${response.data.share_id}`);
};

// Mobile responsive grid
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
  gap: '20px' 
}}>
```

## File Organization

- **Backend**: `app/` with `api/`, `models/`, `parsers/`, `services/` subdirectories
- **Frontend**: `src/` with `components/`, `hooks/`, `types/`, `utils/`, `i18n/` subdirectories
- **Charts**: Separate file per chart type in `components/charts/`
- **Modals**: Export and Share modals as separate components

## API Conventions

- All endpoints prefixed with `/api/`
- Query parameters for filtering (`?cache_key=X&authors=A,B`)
- Session ID passed as `cache_key` parameter
- JSON responses with consistent structure
- HTTP 400 for validation errors, 404 for not found, 410 for expired sessions