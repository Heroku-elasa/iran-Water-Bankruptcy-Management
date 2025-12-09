# Abbaan Water Management - Complete Deployment Guide

This document contains ALL configuration details for deploying this application to Cloudflare Pages and Render.com. Use this file as a reference when setting up or troubleshooting deployments.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Static SPA)                        │
│                                                                 │
│  Hosting Options:                                               │
│  • Cloudflare Pages (wrangler.json)                            │
│  • Render Static Site (render.yaml)                            │
│  • Netlify, Vercel, etc.                                       │
│                                                                 │
│  Files: React + TypeScript + Vite → dist/                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls (fetch)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python API)                         │
│                                                                 │
│  Hosting: Render Web Service (backend/render.yaml)             │
│                                                                 │
│  Features:                                                      │
│  • News scraping from RSS feeds                                │
│  • Keyword filtering for water management                      │
│  • REST API endpoints                                          │
│                                                                 │
│  Files: Flask + newspaper3k + feedparser                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Overview

- **Project Name**: Abbaan Water Management System (آب‌بان)
- **Type**: Static Single Page Application (SPA)
- **Framework**: React 18 + TypeScript + Vite
- **Language**: Persian (Farsi) with RTL support
- **Build Output**: Static HTML/CSS/JS files in `dist/` folder

---

## Build Process (Same for All Platforms)

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

**What happens during build:**
1. TypeScript compiles to JavaScript
2. Vite bundles all React components
3. Assets are optimized and hashed
4. Output goes to `dist/` folder

---

# CLOUDFLARE PAGES DEPLOYMENT

## Configuration File: `wrangler.json`

This file is **ONLY read by Cloudflare**. Render ignores it completely.

```json
{
  "$schema": "https://raw.githubusercontent.com/cloudflare/workers-sdk/main/packages/wrangler/config-schema.json",
  "name": "iran-water-bankruptcy-management",
  "compatibility_date": "2025-12-09",
  "assets": {
    "directory": "./dist"
  }
}
```

### Field Explanations:

| Field | Value | Purpose | Required |
|-------|-------|---------|----------|
| `$schema` | URL to schema | Enables IDE autocompletion and validation for wrangler.json | Optional but recommended |
| `name` | `"iran-water-bankruptcy-management"` | Project identifier in Cloudflare dashboard. Must be lowercase, no spaces. Used in the default URL: `{name}.pages.dev` | **Required** |
| `compatibility_date` | `"2025-12-09"` | Locks Cloudflare runtime behavior to this date. Prevents breaking changes from affecting your app. Format: YYYY-MM-DD | **Required** |
| `assets.directory` | `"./dist"` | Path to built static files. Cloudflare serves everything in this folder. Must match Vite output directory | **Required** |

### Cloudflare Dashboard Settings:

When connecting via Cloudflare Dashboard (instead of CLI):

| Setting | Value | Notes |
|---------|-------|-------|
| Framework preset | None / Vite | Auto-detects build settings |
| Build command | `npm run build` | Runs TypeScript + Vite build |
| Build output directory | `dist` | Where static files are generated |
| Root directory | `/` (leave empty) | Project root |
| Node.js version | 18 or 20 | Recommended for compatibility |

### Environment Variables in Cloudflare:

| Variable | Where to Set | Value |
|----------|--------------|-------|
| `API_KEY` | Settings → Environment Variables | Your Google Gemini API key |
| `NODE_VERSION` | Settings → Environment Variables | `18` or `20` (optional) |

### Cloudflare-Specific Features:

- **Automatic HTTPS**: Enabled by default
- **Global CDN**: Files cached at 300+ edge locations
- **Preview Deployments**: Each git branch gets a preview URL
- **Custom Domains**: Add in Pages → Custom domains

---

# RENDER.COM DEPLOYMENT

## Configuration File: `render.yaml`

This file is **ONLY read by Render**. Cloudflare ignores it completely.

```yaml
services:
  - type: web
    name: abbaan-water-management
    runtime: static
    buildCommand: npm run build
    staticPublishPath: ./dist
    headers:
      - path: /*
        name: Cache-Control
        value: public, max-age=0, must-revalidate
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: API_KEY
        sync: false
```

### Field Explanations:

| Field | Value | Purpose | Required |
|-------|-------|---------|----------|
| `type` | `web` | Tells Render this is a web service (not a background worker or cron job) | **Required** |
| `name` | `abbaan-water-management` | Service name in Render dashboard. Used in default URL: `{name}.onrender.com` | **Required** |
| `runtime` | `static` | Indicates this is a static site, not a server application. Render optimizes hosting accordingly | **Required** |
| `buildCommand` | `npm run build` | Command Render runs to build your app. Executes in project root | **Required** |
| `staticPublishPath` | `./dist` | Folder containing built files to serve. Must match Vite output | **Required** |
| `headers` | Cache-Control settings | HTTP headers added to all responses. Important for caching behavior | Optional |
| `headers.path` | `/*` | Apply header to all files | - |
| `headers.name` | `Cache-Control` | HTTP header name | - |
| `headers.value` | `public, max-age=0, must-revalidate` | Forces browsers to always check for updates. Prevents stale content | - |
| `routes` | SPA routing rules | Handles client-side routing for React Router | **Required for SPA** |
| `routes.type` | `rewrite` | Internal redirect (URL stays the same in browser) | - |
| `routes.source` | `/*` | Match all paths | - |
| `routes.destination` | `/index.html` | Serve index.html for all routes (React handles routing) | - |
| `envVars` | Environment variables | Variables available during build and runtime | Optional |
| `envVars.key` | `API_KEY` | Variable name | - |
| `envVars.sync` | `false` | If true, syncs with Render's env groups. False means set manually | - |

### Render Dashboard Settings (Manual Setup):

If not using render.yaml, configure in dashboard:

| Setting | Value | Notes |
|---------|-------|-------|
| Environment | Static Site | Not "Web Service" |
| Build Command | `npm run build` | Same as render.yaml |
| Publish Directory | `dist` | Static files location |
| Auto-Deploy | Yes | Deploy on every git push |
| Branch | `main` | Or your default branch |

### Environment Variables in Render:

| Variable | Where to Set | Value |
|----------|--------------|-------|
| `API_KEY` | Environment → Environment Variables | Your Google Gemini API key |

---

# SPA ROUTING FILE

## Configuration File: `public/_redirects`

This file works on **Render, Netlify, and similar platforms**. Cloudflare Pages handles this automatically.

```
/* /index.html 200
```

### Explanation:

| Part | Meaning |
|------|---------|
| `/*` | Match any URL path |
| `/index.html` | Serve this file instead |
| `200` | Return HTTP 200 (not a redirect, serve the content) |

### Why This is Needed:

React is a Single Page Application (SPA). All routing happens in JavaScript:
- User visits `/dashboard` 
- Without this rule, server returns 404 (file doesn't exist)
- With this rule, server returns `index.html`
- React Router reads URL and shows Dashboard component

---

# SHARED CONFIGURATION FILES

## `package.json` - Build Scripts

Used by **ALL platforms** during build process.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

| Script | Command | When Used |
|--------|---------|-----------|
| `dev` | `vite` | Local development only |
| `build` | `tsc && vite build` | **Production builds on all platforms**. First compiles TypeScript, then bundles with Vite |
| `preview` | `vite preview` | Test production build locally |

---

## `vite.config.ts` - Bundler Configuration

Used by **ALL platforms** during build.

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
    },
  };
});
```

| Setting | Value | Purpose |
|---------|-------|---------|
| `plugins` | `[react()]` | Enables React JSX transformation |
| `define.process.env.API_KEY` | From environment | Injects API_KEY into built JavaScript. Available as `process.env.API_KEY` in code |
| `server.host` | `0.0.0.0` | Development only - allows external access |
| `server.port` | `5000` | Development only - local server port |
| `server.allowedHosts` | `true` | Development only - allows proxy access |

**Important**: The `server` settings only affect local development. They are ignored during production builds.

---

## `index.html` - Entry Point

The single HTML file that loads the React application.

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>آب‌بان - سامانه مدیریت بحران آب</title>
    <!-- Tailwind CSS via CDN -->
    <!-- Vazirmatn Persian font -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

| Attribute | Purpose |
|-----------|---------|
| `lang="fa"` | Persian language |
| `dir="rtl"` | Right-to-left text direction |
| `id="root"` | React mounts here |

---

# ENVIRONMENT VARIABLES SUMMARY

| Variable | Required | Used For | Set In |
|----------|----------|----------|--------|
| `API_KEY` | Optional | Google Gemini AI chat features | Cloudflare: Settings → Environment Variables / Render: Environment → Environment Variables |
| `NODE_VERSION` | Optional | Specify Node.js version for build | Platform settings (18 or 20 recommended) |

---

# FILE REFERENCE - QUICK LOOKUP

## Frontend Files

| File | Platform | Purpose | Must Edit? |
|------|----------|---------|------------|
| `wrangler.json` | Cloudflare ONLY | Workers/Pages deployment config | Only if changing project name |
| `render.yaml` | Render ONLY | Static site deployment config | Only if changing service name |
| `public/_redirects` | Render/Netlify | SPA client-side routing | No |
| `package.json` | ALL | Dependencies and build scripts | Only for new packages |
| `vite.config.ts` | ALL | Bundler settings | Only for build customization |
| `index.html` | ALL | HTML entry point | Only for meta tags/title |
| `tsconfig.json` | ALL | TypeScript compiler settings | Rarely |

## Backend Files (Python API)

| File | Platform | Purpose | Must Edit? |
|------|----------|---------|------------|
| `backend/app.py` | Render Web Service | Flask API with news scraping | Add/modify endpoints |
| `backend/requirements.txt` | Render | Python dependencies | Add new packages |
| `backend/render.yaml` | Render ONLY | Backend web service config | Change name/region |
| `backend/README.md` | Documentation | Backend setup guide | No |

---

# DEPLOYMENT CHECKLIST

## Before Deploying:

- [ ] Run `npm run build` locally to test build succeeds
- [ ] Check `dist/` folder is created with files
- [ ] Set `API_KEY` environment variable (if using AI features)
- [ ] Commit all changes to git

## Cloudflare Pages:

- [ ] Connect GitHub repository
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Add environment variables
- [ ] Deploy

## Render:

- [ ] Connect GitHub repository  
- [ ] `render.yaml` auto-detected OR set manually
- [ ] Add environment variables
- [ ] Deploy

---

# PYTHON BACKEND DEPLOYMENT (Render)

The backend is a Python Flask API that scrapes water management news. Deploy it to Render as a **Web Service**.

## Backend Folder Structure

```
backend/
├── app.py              # Flask API with scraping logic
├── requirements.txt    # Python dependencies
├── render.yaml         # Render deployment config
└── README.md           # Backend documentation
```

---

## Configuration File: `backend/render.yaml`

```yaml
services:
  - type: web
    name: abbaan-news-api
    runtime: python
    region: frankfurt
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:$PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.11"
    healthCheckPath: /health
```

### Field Explanations:

| Field | Value | Purpose | Required |
|-------|-------|---------|----------|
| `type` | `web` | Web service (not static site) - runs Python code | **Required** |
| `name` | `abbaan-news-api` | Service name, used in URL: `abbaan-news-api.onrender.com` | **Required** |
| `runtime` | `python` | Use Python runtime (not Node, Docker, etc.) | **Required** |
| `region` | `frankfurt` | Server location - choose closest to users | Optional |
| `plan` | `free` | Pricing tier - free has cold starts | Optional |
| `buildCommand` | `pip install -r requirements.txt` | Install Python packages before starting | **Required** |
| `startCommand` | `gunicorn app:app --bind 0.0.0.0:$PORT` | Production server command. Uses gunicorn (not Flask dev server) | **Required** |
| `envVars` | Python version | Environment variables for the service | Optional |
| `healthCheckPath` | `/health` | Render pings this endpoint to verify app is running | Recommended |

---

## Configuration File: `backend/requirements.txt`

```
flask==3.0.0
flask-cors==4.0.0
feedparser==6.0.10
newspaper3k==0.2.8
lxml==5.1.0
lxml_html_clean==0.1.0
gunicorn==21.2.0
```

### Package Explanations:

| Package | Purpose |
|---------|---------|
| `flask` | Web framework for API endpoints |
| `flask-cors` | Enables cross-origin requests from frontend |
| `feedparser` | Parses RSS feeds from news sources |
| `newspaper3k` | Extracts article content from URLs |
| `lxml` | XML/HTML parsing (required by newspaper3k) |
| `gunicorn` | Production WSGI server (better than Flask dev server) |

---

## API Endpoints

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/` | GET | API info | `curl https://api.example.com/` |
| `/health` | GET | Health check | Returns `{"status": "healthy"}` |
| `/sources` | GET | List RSS sources | Returns source names and keywords |
| `/news` | GET | Get news articles | `?limit=10&region=Iran` |

### `/news` Query Parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 10 | Max articles per source |
| `region` | string | all | Filter: "Iran" or "Middle East" |

---

## Connecting Frontend to Backend

After deploying backend, add this environment variable to your frontend:

| Variable | Example Value |
|----------|---------------|
| `VITE_NEWS_API_URL` | `https://abbaan-news-api.onrender.com` |

Frontend code to fetch news:
```javascript
const API_URL = import.meta.env.VITE_NEWS_API_URL;
const response = await fetch(`${API_URL}/news?region=Iran&limit=5`);
const data = await response.json();
```

---

# TROUBLESHOOTING

## Build Fails

1. Check Node.js version (use 18 or 20)
2. Run `npm install` before `npm run build`
3. Check for TypeScript errors in code

## 404 Errors on Routes

1. Verify `_redirects` file exists in `public/`
2. For Cloudflare: Check Pages Functions are not intercepting
3. For Render: Verify `routes` in `render.yaml`

## Environment Variables Not Working

1. Variables must be set BEFORE build runs
2. Redeploy after adding new variables
3. Check variable name matches exactly (case-sensitive)

## Stale Content After Deploy

1. Clear browser cache (Ctrl+Shift+R)
2. Check Cache-Control headers are set
3. Verify new build was actually deployed

---

# CONTACT & SUPPORT

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Render Docs**: https://render.com/docs/static-sites
- **Vite Docs**: https://vitejs.dev/guide/

---

*Last Updated: December 2025*
