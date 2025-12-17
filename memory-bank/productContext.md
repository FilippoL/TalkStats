# Product Context

WhatsApp Conversation Analyzer - A full-stack web application for parsing and visualizing WhatsApp chat exports.

## Overview

This application allows users to upload WhatsApp chat export files and explore comprehensive analytics through an interactive dashboard. The backend parses the chat format, performs sentiment analysis using VADER, calculates statistics, and generates insights. The frontend displays 11 different chart visualizations with filtering capabilities.

## Core Features

- **Chat Parsing**: Parse WhatsApp export format (`DD/MM/YY, HH:MM - Author: Message`)
- **Sentiment Analysis**: VADER-based sentiment with Italian/English emotion keywords
- **Author Statistics**: Message count, avg length, media count per author
- **Time Series Analysis**: Grouping by hour/day/week/month
- **Word Frequency**: Top words with stopword filtering (Italian + English)
- **Media Detection**: Track images, videos, audio, stickers, documents
- **AI Insights**: Auto-generated observations about patterns
- **Interactive Filters**: Filter by author, date range, sentiment
- **11 Chart Types**: Timeline, heatmap, sentiment distribution, word cloud, etc.

## Technical Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Language**: Python 3.11+
- **Sentiment**: NLTK VADER SentimentIntensityAnalyzer
- **Date Parsing**: python-dateutil
- **Data Processing**: pandas, numpy
- **Validation**: Pydantic

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.0
- **Charts**: Recharts 2.10
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Date Utils**: date-fns

### Deployment
- **Platform**: fly.io
- **Region**: Amsterdam (ams)
- **Container**: Docker multi-stage build
- **Resources**: 512MB RAM, 1 CPU