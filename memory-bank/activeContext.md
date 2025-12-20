# Active Context

## Current Goals

- Production deployment on Google Cloud Run with Upstash Redis
- Cost optimization (using Upstash free tier instead of Memorystore)

## Current Focus

The application is **fully functional** and deployed at:
**https://whatsapp-analyzer-446573060004.europe-west1.run.app**

## Working State

- **Backend**: FastAPI running on Cloud Run, Redis sessions via Upstash
- **Frontend**: React SPA with PDF export, share links, mobile responsive
- **Deployment**: Google Cloud Run with Cloud Build CI/CD
- **Session Storage**: Upstash Redis (free tier, REST API)

## Recent Changes (December 2024)

- ✅ Implemented Redis session isolation (fixes data leaks between users)
- ✅ Added PDF export with section selection
- ✅ Added share links (1-hour expiration)
- ✅ Added ZIP file upload support
- ✅ Mobile responsive UI improvements
- ✅ Removed emojis from buttons for cleaner UI
- ✅ Migrated from Memorystore to Upstash (saves ~$42/month)
- ✅ Updated README with new deployment instructions

## Current Blockers

- None - application is in production

## Key Files to Know

| Purpose | File |
|---------|------|
| Main API | `backend/app/api/routes.py` |
| Redis Client | `backend/app/services/redis_client.py` |
| Parser | `backend/app/parsers/whatsapp.py` |
| Dashboard | `frontend/src/components/Dashboard.tsx` |
| PDF Export | `frontend/src/utils/pdfExport.ts` |
| Share Modal | `frontend/src/components/ShareModal.tsx` |
| Export Modal | `frontend/src/components/ExportModal.tsx` |
| Shared View | `frontend/src/components/SharedDashboard.tsx` |
| Translations | `frontend/src/i18n/translations.ts` |