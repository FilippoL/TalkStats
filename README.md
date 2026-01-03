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

### Export & Share Features
- **PDF Export** - Export the full report or select specific sections (Bestemmiometro only option included!)
- **Share Links** - Generate shareable links that expire after 1 hour
- **Session Isolation** - Proper session management ensures your data stays yours

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

### Development with Docker Compose

```bash
# Start all services (Redis, Backend, Frontend)
docker-compose -f docker-compose.dev.yml up

# Backend at http://localhost:8000
# Frontend at http://localhost:3000
# Redis at localhost:6379
```

### Local Docker Build

```bash
docker build -t whatsapp-analyzer .
docker run -p 8000:8000 whatsapp-analyzer
```

### Deploy to Google Cloud Run with Upstash Redis (Recommended - FREE)

For production session storage, we recommend **Upstash Redis** - a serverless Redis with a generous free tier (saves ~$42/month vs Google Memorystore).

#### 1. Create Free Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up (GitHub login works)
3. Click **Create Database**
4. Name: `whatsapp-sessions`
5. Region: **EU West** (or closest to your Cloud Run region)
6. Type: **Regional** (free tier)

#### 2. Get Your Credentials

From the Upstash dashboard, copy:
- **REST URL**: `https://xxxx.upstash.io`
- **REST Token**: `AXxxxx...`

#### 3. Update cloudbuild.yaml

Edit `cloudbuild.yaml` and update with your Upstash credentials:

```yaml
substitutions:
  _UPSTASH_URL: 'https://your-instance.upstash.io'  # Your Upstash REST URL
  _UPSTASH_TOKEN: 'your-token-here'                  # Your Upstash REST Token
```

#### 4. Deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

#### Alternative: Google Memorystore (More Expensive)

If you prefer Google-native services, you can use Memorystore (~$42/month):

```bash
# Create Redis instance
gcloud redis instances create whatsapp-redis --size=1 --region=europe-west1 --redis-version=redis_7_0 --tier=basic

# Create VPC connector
gcloud compute networks vpc-access connectors create redis-connector --region=europe-west1 --range=10.8.0.0/28
```

Then update `cloudbuild.yaml` to use `REDIS_HOST` instead of Upstash variables.

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
│   │   │   ├── redis_client.py # Redis session storage
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
│   │   │   ├── ExportModal.tsx # PDF export options
│   │   │   ├── ShareModal.tsx  # Share link generation
│   │   │   ├── SharedDashboard.tsx # Read-only shared view
│   │   │   └── ...             # Filters & selectors
│   │   ├── hooks/
│   │   │   └── useStats.ts     # API hook
│   │   ├── utils/
│   │   │   └── pdfExport.ts    # PDF export utility
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── data/                        # Wordlists (bestemmie, swearwords)
├── memory-bank/                 # AI assistant context
├── Dockerfile                   # Production build
├── docker-compose.dev.yml       # Dev environment with Redis
└── cloudbuild.yaml              # Google Cloud Build config
```

---

## How to Export WhatsApp Chats

### On Android
1. Open WhatsApp → Go to the chat
2. Tap **⋮** (three dots) → **More** → **Export chat**
3. Choose **Without Media**
4. Save/share the `.txt` or `.zip` file

### On iPhone
1. Open WhatsApp → Go to the chat
2. Tap the contact/group name at the top
3. Scroll down → **Export Chat**
4. Choose **Without Media**
5. Save the `.txt` or `.zip` file

> **Tip:** You can upload the `.zip` file directly - no need to unzip it first!

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
| `/api/upload` | POST | Upload WhatsApp chat file (.txt or .zip) |
| `/api/authors` | GET | Get list of chat participants |
| `/api/stats` | GET | Get filtered statistics |
| `/api/words` | GET | Get word frequency analysis |
| `/api/emojis` | GET | Get emoji statistics |
| `/api/insights` | GET | Get AI-generated insights |
| `/api/share` | POST | Generate a shareable link (expires in 1 hour) |
| `/api/share/{id}` | GET | Get shared report data |
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

### 4. Session Storage
Sessions are stored in Redis (Upstash or Memorystore) with automatic 1-hour expiration. Each user gets a unique session ID - your data is isolated and automatically deleted after the TTL. Privacy by design!

---

## Contributing

PRs welcome! Some ideas:
- [ ] More WhatsApp export format support
- [x] ~~Export to PDF~~ ✅ Done!
- [x] ~~Share links~~ ✅ Done!
- [ ] Dark mode
- [ ] More languages for stopwords/sentiment
- [x] ~~Unit tests~~ ✅ Started! (emoji analysis test suite added)

---

## License

MIT - Do whatever you want with it.

---

## Acknowledgments

- [emoji](https://github.com/carpedm20/emoji) for comprehensive emoji detection
- [Recharts](https://recharts.org/) for beautiful charts
- [FastAPI](https://fastapi.tiangolo.com/) for making Python APIs fun
- [Upstash](https://upstash.com/) for serverless Redis with amazing free tier
- [Rattlyy/bestemmiometro](https://github.com/Rattlyy/bestemmiometro) for the comprehensive bestemmie.txt wordlist
- My Italian friends for... inspiring the Bestemmiometro feature

---

*Made with mass amounts of coffee and probably too many WhatsApp messages*


