# Product Context

WhatsApp Conversation Analyzer (TalkStats) - A full-stack web application for parsing and visualizing WhatsApp chat exports.

## Overview

This application allows users to upload WhatsApp chat export files (.txt or .zip) and explore comprehensive analytics through an interactive dashboard. The backend parses the chat format, calculates statistics, detects emoji usage, tracks Italian blasphemies (Bestemmiometro), and generates insights. The frontend displays 11 different chart visualizations with filtering capabilities.

## Core Features

- **Chat Parsing**: Parse WhatsApp export format (multiple formats supported)
- **ZIP Upload**: Direct upload of .zip files without extracting
- **Author Statistics**: Message count, avg length, media count per author
- **Time Series Analysis**: Grouping by hour/day/week/month
- **Word Frequency**: Top words with stopword filtering (Italian + English)
- **Emoji Statistics**: Top emojis and per-author breakdown
- **Bestemmiometro**: Italian blasphemy tracking with climax detection
- **Media Detection**: Track images, videos, audio, stickers, documents
- **AI Insights**: Auto-generated observations about patterns
- **Interactive Filters**: Filter by author, date range, time grouping
- **PDF Export**: Export full report or selected sections
- **Share Links**: Generate 1-hour expiring shareable links
- **Session Isolation**: Proper user isolation with Redis sessions
- **Mobile Responsive**: Works on all screen sizes

## Technical Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Language**: Python 3.11+
- **Session Storage**: Redis (Upstash REST API)
- **Date Parsing**: python-dateutil
- **Data Processing**: pandas, numpy
- **Emoji Detection**: emoji library
- **Validation**: Pydantic

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.0
- **Charts**: Recharts 2.10
- **PDF Export**: html2canvas + jspdf
- **HTTP Client**: Axios
- **Date Utils**: date-fns

### Deployment
- **Platform**: Google Cloud Run
- **Region**: europe-west1
- **Container**: Docker multi-stage build
- **CI/CD**: Google Cloud Build
- **Session Storage**: Upstash Redis (free tier)
- **Resources**: 512MB RAM, 1 CPU, auto-scaling 0-10 instances