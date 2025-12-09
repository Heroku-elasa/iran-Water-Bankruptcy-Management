# Water Management News API - Backend

Python Flask API that scrapes water management news from Iran and Middle East sources.

## Deployment to Render.com

### Option 1: Using render.yaml (Recommended)

1. Push the `backend/` folder to a GitHub repository
2. Connect to Render.com
3. Select "Blueprint" and point to this folder
4. Render will auto-detect `render.yaml`

### Option 2: Manual Setup

1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. Set **Runtime**: Python 3
5. Set **Build Command**: `pip install -r requirements.txt`
6. Set **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info and available endpoints |
| `/health` | GET | Health check |
| `/sources` | GET | List news sources and keywords |
| `/news` | GET | Get water management news |

### Query Parameters for `/news`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 10 | Max articles per source |
| `region` | string | all | Filter by region: "Iran" or "Middle East" |

### Example Requests

```bash
# Get all news
curl https://your-api.onrender.com/news

# Get Iran news only
curl https://your-api.onrender.com/news?region=Iran&limit=5
```

## Local Development

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API runs at http://localhost:10000

## Connecting to Frontend

Set `VITE_NEWS_API_URL` environment variable in your frontend:

```
VITE_NEWS_API_URL=https://your-api.onrender.com
```

Then in frontend code:
```javascript
const API_URL = import.meta.env.VITE_NEWS_API_URL;
const response = await fetch(`${API_URL}/news`);
```
