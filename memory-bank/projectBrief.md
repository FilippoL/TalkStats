# Project Brief

## Purpose

WhatsApp Conversation Analyzer is a web application that parses WhatsApp chat exports and provides comprehensive analytics including sentiment analysis, statistics, word frequency analysis, and AI-generated insights. Users can upload their exported WhatsApp conversations and explore them through 11 interactive visualizations.

## Target Users

- Individuals who want to analyze their personal WhatsApp conversations
- Researchers studying messaging patterns and communication behavior
- Anyone curious about their chat statistics, most active times, sentiment trends, and frequently used words

## Key Goals

1. Parse WhatsApp chat export files (`.txt` format) reliably
2. Provide sentiment analysis with emotional categorization
3. Generate meaningful statistics per author and overall
4. Visualize data through interactive charts
5. Generate AI-powered insights about conversation patterns
6. Support filtering by author, date range, and sentiment

## Constraints

- Client-side file processing (files uploaded to backend but not persisted)
- In-memory caching (data lost on server restart)
- Single-user focus (no authentication required)
- WhatsApp export format dependency (DD/MM/YY or DD/MM/YYYY)
