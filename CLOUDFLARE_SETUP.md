# Cloudflare D1 + News Scraper Setup Guide

This guide explains how to set up the Cloudflare D1 database and news scraping system.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                             │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Static React   │    │   Functions     │                    │
│  │     (dist/)     │───▶│   (functions/)  │                    │
│  └─────────────────┘    └────────┬────────┘                    │
│                                  │                              │
│                                  ▼                              │
│                    ┌─────────────────────────┐                 │
│                    │     D1 Database         │                 │
│                    │    (water-news-db)      │                 │
│                    └─────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create D1 Database in Cloudflare

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **D1 SQL Database**
2. Click **Create database**
3. Name it: `water-news-db`
4. Copy the **Database ID** (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

---

## Step 2: Update wrangler.json

Open `wrangler.json` and replace `YOUR_DATABASE_ID_HERE` with your actual Database ID:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "water-news-db",
      "database_id": "paste-your-database-id-here"
    }
  ]
}
```

---

## Step 3: Create Database Tables

1. Go to **Cloudflare Dashboard** → **D1** → **water-news-db**
2. Click **Console** tab
3. Copy and paste the contents of `schema.sql` file
4. Click **Execute**

This creates:
- `articles` table - stores scraped news
- `rss_sources` table - stores RSS feed URLs
- Indexes for fast queries

---

## Step 4: Connect D1 Binding to Pages

1. Go to **Workers & Pages** → **iran-water-bankruptcy-management**
2. Click **Settings** → **Bindings**
3. Click **Add binding**
4. Select **D1 database**
5. Set:
   - **Variable name**: `DB`
   - **D1 database**: `water-news-db`
6. Click **Save**

---

## Step 5: Deploy

Deploy using one of these methods:

### Option A: Cloudflare Dashboard
1. Connect your GitHub repo to Cloudflare Pages
2. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy

### Option B: Wrangler CLI
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy dist
```

---

## API Endpoints

After deployment, these endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | Get news articles |
| `/api/news?region=Iran` | GET | Filter by region |
| `/api/news?limit=10` | GET | Limit results |
| `/api/sources` | GET | List RSS sources |
| `/api/scrape` | POST | Trigger news scraping |

### Example API Calls

```javascript
// Get all news
fetch('/api/news')

// Get Iran news only
fetch('/api/news?region=Iran&limit=20')

// Trigger scraping
fetch('/api/scrape', { method: 'POST' })
```

---

## Files Reference

| File | Purpose | Platform |
|------|---------|----------|
| `wrangler.json` | Cloudflare config with D1 binding | Cloudflare |
| `schema.sql` | Database tables and indexes | Run in D1 Console |
| `functions/api/news.ts` | GET /api/news endpoint | Cloudflare Functions |
| `functions/api/sources.ts` | GET /api/sources endpoint | Cloudflare Functions |
| `functions/api/scrape.ts` | POST /api/scrape endpoint | Cloudflare Functions |
| `components/NewsPage.tsx` | React news display component | Frontend |

---

## Database Schema

### articles table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| title | TEXT | Article title |
| summary | TEXT | Article summary |
| content | TEXT | Full article content |
| url | TEXT | Article URL (unique) |
| source | TEXT | Source name (e.g., "IRNA") |
| region | TEXT | Region (Iran, Middle East) |
| authors | TEXT | Article authors |
| publish_date | TEXT | Publication date |
| scraped_at | TEXT | When article was scraped |
| keywords | TEXT | Matched keywords |

### rss_sources table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Source name |
| url | TEXT | RSS feed URL (unique) |
| region | TEXT | Region |
| active | INTEGER | 1 = active, 0 = disabled |
| last_scraped | TEXT | Last scrape timestamp |

---

## Default RSS Sources

The schema includes these default sources:

| Source | URL | Region |
|--------|-----|--------|
| IRNA Environment | irna.ir/rss/environment | Iran |
| Al Jazeera | aljazeera.com/xml/rss/all.xml | Middle East |
| Tehran Times | tehrantimes.com/rss | Iran |
| Waste & Recycling MEA | wasterecyclingmea.com/feed | Middle East |

---

## Scraping Keywords

The scraper filters articles containing these keywords:

**English:**
- water, waste, water management, drought, aquifer
- groundwater, irrigation, dam, subsidence, desalination
- environment, climate, pollution, recycling

**Persian:**
- آب, خشکسالی, سفره آب, فرونشست, مدیریت آب, بحران آب

---

## Automatic Scraping (Cron)

To scrape automatically, add a cron trigger:

1. Go to **Workers & Pages** → Your project → **Settings** → **Triggers**
2. Add **Cron Trigger**
3. Set schedule: `0 */6 * * *` (every 6 hours)
4. This will call `/api/scrape` automatically

---

## Troubleshooting

### "D1 database not found"
- Verify Database ID in wrangler.json matches your D1 database
- Check binding is added in Pages Settings → Bindings

### "No articles showing"
- Run POST /api/scrape to fetch initial articles
- Check D1 Console to verify tables exist
- Verify RSS feeds are accessible

### "Scraping returns 0 articles"
- RSS feeds may be temporarily unavailable
- Check if keywords match current articles
- Try adding more RSS sources

---

## Adding New RSS Sources

Insert into D1 Console:

```sql
INSERT INTO rss_sources (name, url, region) VALUES 
  ('Source Name', 'https://example.com/rss', 'Iran');
```

---

*Last Updated: December 2025*
