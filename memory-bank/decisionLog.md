# Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024 | Use FastAPI for backend | Modern async Python framework, automatic OpenAPI docs, great performance |
| 2024 | Use VADER for sentiment | Pre-trained, no API costs, works offline, good for social media text |
| 2024 | Add Italian emotion keywords | Target users may have Italian conversations, extend beyond English |
| 2024 | Use Recharts for visualization | React-native, composable, good TypeScript support |
| 2024 | In-memory caching | Simplicity over persistence, stateless deployment friendly |
| 2024 | Deploy on fly.io | Easy Docker deployment, free tier, European region (ams) |
| 2024 | Multi-stage Docker build | Reduce image size, separate build and runtime dependencies |
| 2024 | UUID for file_id | Unique identification without exposing file names or paths |
| 2024 | No authentication | Single-user tool, privacy through non-persistence |
| 2024 | Stopwords for IT + EN | Support bilingual conversations common in target audience |
| 2024 | Separate chart components | Maintainability, easy to add/modify individual visualizations |
| 2024 | Custom useStats hook | Centralize API logic, consistent loading/error states |
| 2024 | Regex-based parsing | WhatsApp format is predictable, regex is efficient |
| Dec 2024 | Populate memory bank | Enable effective AI-assisted development with .github chat modes |
