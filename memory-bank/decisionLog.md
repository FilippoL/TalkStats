# Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024 | Use FastAPI for backend | Modern async Python framework, automatic OpenAPI docs, great performance |
| 2024 | Use Recharts for visualization | React-native, composable, good TypeScript support |
| 2024 | In-memory caching (initial) | Simplicity over persistence, stateless deployment friendly |
| 2024 | Multi-stage Docker build | Reduce image size, separate build and runtime dependencies |
| 2024 | UUID for session_id | Unique identification, user isolation, no collision |
| 2024 | No authentication | Single-user tool, privacy through session expiration |
| 2024 | Stopwords for IT + EN | Support bilingual conversations common in target audience |
| 2024 | Separate chart components | Maintainability, easy to add/modify individual visualizations |
| 2024 | Custom useStats hook | Centralize API logic, consistent loading/error states |
| 2024 | Regex-based parsing | WhatsApp format is predictable, regex is efficient |
| Dec 2024 | Migrate to Google Cloud Run | Better European hosting, easy Cloud Build CI/CD |
| Dec 2024 | Add Redis session storage | Fix data leaks between users, proper session isolation |
| Dec 2024 | Use Upstash over Memorystore | Free tier saves ~$42/month, REST API (no VPC needed) |
| Dec 2024 | Add PDF export | User request, html2canvas + jspdf for client-side generation |
| Dec 2024 | Add share links | User request, 1-hour TTL, snapshot of data at share time |
| Dec 2024 | Support ZIP uploads | User convenience, auto-extract .txt from WhatsApp export |
| Dec 2024 | Remove emojis from UI | Cleaner look, better accessibility, user request |
| Dec 2024 | Mobile responsive design | Flexbox/grid with auto-fit, media queries for small screens |
