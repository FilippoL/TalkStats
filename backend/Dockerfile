FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data (needed for text processing)
RUN python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('vader_lexicon', quiet=True)"

# Copy application code
COPY app/ ./app/

# Copy data folder (bestemmie.txt etc.)
COPY ../data/ ./data/

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


