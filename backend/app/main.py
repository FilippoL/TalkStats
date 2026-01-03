from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .api.routes import router

app = FastAPI(
    title="WhatsApp Conversation Analyzer",
    description="API for analyzing WhatsApp chat exports",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes (must be before catch-all route)
app.include_router(router)

# Health check (before catch-all)
@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

# Serve frontend static files in production
# Calculate absolute path to frontend dist
_base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_path = os.path.join(_base_dir, "frontend", "dist")
frontend_path = os.path.abspath(frontend_path)

logger = logging.getLogger("uvicorn")

if os.path.exists(frontend_path):
    logger.info(f"Frontend path found: {frontend_path}")
    # Serve static assets (JS, CSS, etc.)
    assets_path = os.path.join(frontend_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    @app.get("/")
    async def root():
        """Root endpoint - serve frontend."""
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "WhatsApp Conversation Analyzer API", "version": "1.0.0"}
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve SPA - return index.html for non-API routes."""
        # Don't serve index.html for API routes (shouldn't reach here due to router order)
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Check if it's a file that exists
        file_path = os.path.join(frontend_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Otherwise serve index.html for SPA routing
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend not found"}
else:
    logger.warning(f"Frontend path not found: {frontend_path}")
    logger.warning(f"Current working directory: {os.getcwd()}")
    logger.warning(f"Base dir: {_base_dir}")
    logger.warning(f"__file__: {__file__}")
    
    @app.get("/")
    async def root():
        """Root endpoint - API info only."""
        return {"message": "WhatsApp Conversation Analyzer API", "version": "1.0.0"}

