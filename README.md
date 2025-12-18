# TalkStats - WhatsApp Chat Analyzer

> Ever wondered who sends the most messages in your group chat? Or what time your friends are most active? Maybe you're curious about your group's favorite emojis? Well, wonder no more!

A full-stack web app that turns your boring WhatsApp chat exports into beautiful, insightful analytics. No login required, no data stored on servers - just pure chat analysis goodness.

**Live Demo: [whatsapp-analyzer-446573060004.europe-west1.run.app](https://whatsapp-analyzer-446573060004.europe-west1.run.app)**

---

## What Can It Do?

### Statistics & Analytics
- **Message counts** per author - finally settle who's the chattiest
- **Time-based analysis** - are you a morning person or a midnight messenger?
- **Word frequency** - discover your group's favorite words (stopwords filtered for EN/IT)
- **Message length stats** - who writes novels vs who sends "ok"

### Emoji Statistics
- **Top emojis** - see the most used emojis in the chat
- **Per-author emoji breakdown** - who uses the most 😂? Who's the ❤️ spammer?
- **Total emoji count** - quantify the expressiveness of your conversations

### Bestemmiometro (The Blasphemy Meter)
A *very serious* feature for **Italian chats only** that tracks... let's say *colorful expressions*. Includes 270+ patterns covering various creative combinations of Italian blasphemies.

**Note:** This feature is specifically designed for Italian language analysis. It will not detect blasphemies in other languages.

Features:
- Per-author rankings and per-capita stats (bestemmie per 100 messages)
- Climax detection (repeated vowels like "diooooo" or "madonnaaaa")
- Consecutive streak tracking
- Timeline visualization
- Beautiful pie charts and stacked bar visualizations

Because science.

### 11 Interactive Visualizations
1. **Message Timeline** - messages over time
2. **Hourly Timeline** - activity by hour of day
3. **Author Activity** - per-author comparison
4. **Word Frequency** - top words bar chart
5. **Activity Heatmap** - day/hour heatmap
6. **Message Length Distribution** - length statistics
7. **Message Length Histogram** - distribution curve
8. **Message Length Comparison** - author comparison
9. **Media Statistics** - images, videos, audio, stickers
10. **Emoji Statistics** - top emojis and per-author breakdown
11. **Bestemmiometro** - the sacred blasphemy charts (Italian only)

### Filter Everything
- Filter by **author** (multi-select)
- Filter by **date range** (with date picker)
- Group by **hour/day/week/month**

---

## Tech Stack

### Backend
- **FastAPI 0.104.1** - Modern Python web framework with automatic OpenAPI docs
- **Python 3.11+** - Because we're not animals
- **emoji** - Comprehensive emoji detection library
- **pandas & numpy** - Data crunching
- **python-dateutil** - Date parsing wizardry
- **Pydantic** - Data validation that doesn't suck

### Frontend
- **React 18** - UI library
- **TypeScript** - Types are your friends
- **Vite 5.0** - Fast build tool
- **Recharts 2.10** - Beautiful charts
- **Tailwind CSS** - Styling without crying
- **Axios** - HTTP client
- **date-fns** - Date utilities

### Deployment
- **Docker** - Multi-stage builds for small images
- **Google Cloud Run** - Serverless deployment, European servers

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:3000`

The Vite dev server proxies `/api/*` requests to the backend automatically.

---

## Docker Deployment

### Local Docker Build

```bash
docker build -t whatsapp-analyzer .
docker run -p 8000:8000 whatsapp-analyzer
```

### Deploy to Google Cloud Run

```bash
# Login to Google Cloud
gcloud auth login

# Deploy (creates service if needed)
gcloud run deploy whatsapp-analyzer --source . --region europe-west1

# Open in browser
# URL will be displayed after deployment
```

---

## Project Structure

```
WhatsAppConvAnalyzer/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py       # API endpoints
│   │   ├── models/
│   │   │   ├── message.py      # Message data model
│   │   │   └── stats.py        # Statistics models
│   │   ├── parsers/
│   │   │   └── whatsapp.py     # Chat parser (dual format support)
│   │   ├── services/
│   │   │   ├── emoji_analysis.py # Emoji detection and statistics
│   │   │   ├── statistics.py   # Stats calculation + Bestemmiometro
│   │   │   ├── word_analysis.py # Word frequency
│   │   │   └── insights.py     # AI-like observations
│   │   └── main.py             # FastAPI app entry
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # 12 chart components
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── FileUpload.tsx  # Drag & drop upload
│   │   │   └── ...             # Filters & selectors
│   │   ├── hooks/
│   │   │   └── useStats.ts     # API hook
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── data/                        # Wordlists (bestemmie, swearwords)
├── memory-bank/                 # AI assistant context
├── Dockerfile                   # Production build
└── cloudbuild.yaml              # Google Cloud Build config
```

---

## How to Export WhatsApp Chats

### On Android
1. Open WhatsApp → Go to the chat
2. Tap **⋮** (three dots) → **More** → **Export chat**
3. Choose **Without Media**
4. Save/share the `.txt` file

### On iPhone
1. Open WhatsApp → Go to the chat
2. Tap the contact/group name at the top
3. Scroll down → **Export Chat**
4. Choose **Without Media**
5. Save the `.txt` file

### Supported Formats
The parser handles multiple WhatsApp export formats:

```
# Dash format (common in English exports)
12/25/23, 14:30 - John: Hello!

# Bracket format (common in Italian/European exports)  
[25/12/23, 14:30:45] John: Ciao!

# Also handles:
- 2-digit and 4-digit years (23 or 2023)
- With or without seconds
- Various date separators
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload WhatsApp chat file |
| `/api/authors` | GET | Get list of chat participants |
| `/api/stats` | GET | Get filtered statistics |
| `/api/words` | GET | Get word frequency analysis |
| `/api/emojis` | GET | Get emoji statistics |
| `/api/insights` | GET | Get AI-generated insights |
| `/api/health` | GET | Health check for deployments |

### Query Parameters for `/api/stats`

| Parameter | Type | Description |
|-----------|------|-------------|
| `file_id` | string | Required. File identifier from upload |
| `authors` | string | Comma-separated author names |
| `start_date` | ISO date | Filter messages after this date |
| `end_date` | ISO date | Filter messages before this date |
| `time_grouping` | string | `hour`, `day`, `week`, or `month` |

---

## How It Works

### 1. Parsing
The WhatsApp parser uses dual regex patterns to handle both dash and bracket formats. It:
- Skips the first 5 lines (group name/encryption notice)
- Detects system messages (joins, leaves, etc.)
- Detects media messages (in both English and Italian)
- Handles multi-line messages

### 2. Emoji Analysis
Using the `emoji` library for comprehensive emoji detection:
- Detects all Unicode emojis including skin tone variants
- Counts individual emojis (not just sequences)
- Per-author emoji breakdown

### 3. Statistics Calculation
Aggregates data by:
- Author (message count, avg length, media count)
- Time series (configurable grouping)
- Emoji usage statistics
- Bestemmiometro (Italian blasphemies with no-space variants)

### 4. Caching
In-memory caching per upload session. Data is **not persisted** - when you close the tab or the server restarts, everything is gone. Privacy by design!

---

## Contributing

PRs welcome! Some ideas:
- [ ] More WhatsApp export format support
- [ ] Export to PDF/CSV
- [ ] Dark mode
- [ ] More languages for stopwords/sentiment
- [ ] Unit tests (yeah, I know...)

---

## License

MIT - Do whatever you want with it.

---

## Acknowledgments

- [emoji](https://github.com/carpedm20/emoji) for comprehensive emoji detection
- [Recharts](https://recharts.org/) for beautiful charts
- [FastAPI](https://fastapi.tiangolo.com/) for making Python APIs fun
- [Rattlyy/bestemmiometro](https://github.com/Rattlyy/bestemmiometro) for the comprehensive bestemmie.txt wordlist
- My Italian friends for... inspiring the Bestemmiometro feature

---

*Made with mass amounts of coffee and probably too many WhatsApp messages*


