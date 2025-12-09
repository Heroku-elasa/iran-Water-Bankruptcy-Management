# Abbaan Water Management System

A comprehensive water crisis management platform (آب‌بان) built with React, TypeScript, and Vite. This is a Persian (Farsi) language application for monitoring and managing water resources in Iran.

## Overview

- **Purpose**: Water security monitoring platform for aquifer analysis, agricultural water consumption control, and land subsidence prevention using AI
- **Language**: Persian (Farsi) with RTL support
- **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS (via CDN), Recharts, Leaflet

## Project Structure

```
/
├── components/           # React components
│   ├── Dashboard.tsx     # Main dashboard with water metrics
│   ├── Landing.tsx       # Landing page
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── HydroMapManager.tsx # Interactive hydro maps with Leaflet
│   ├── VegetationManager.tsx # Vegetation analysis
│   ├── ChecklistManager.tsx # Audit checklists
│   └── ...               # Other feature components
├── contexts/             # React context providers
│   └── LanguageContext.tsx # i18n/RTL support
├── services/             # API services
│   ├── geminiService.ts  # Google Gemini AI integration
│   └── weatherService.ts # Weather data service
├── App.tsx               # Main application component
├── types.ts              # TypeScript type definitions
├── constants.ts          # App constants and prompts
└── vite.config.ts        # Vite configuration
```

## Running the Project

The application runs on port 5000 via the "Frontend" workflow:

```bash
npm run dev
```

## Configuration

### Environment Variables

- `API_KEY`: Google Gemini API key (optional - enables AI chat features)

To enable AI-powered features, set the `API_KEY` environment variable with your Google Gemini API key.

## Deployment

The project is configured for static deployment on multiple platforms:

### Build Settings (All Platforms)
- **Build command**: `npm run build`
- **Output directory**: `dist`

---

### Cloudflare Pages Deployment

| File | Purpose |
|------|---------|
| `wrangler.json` | **Cloudflare Workers/Pages config** - Defines project name, compatibility date, and static assets directory |
| `dist/` | Built static files served by Cloudflare Pages |

**Cloudflare Setup:**
1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. The `wrangler.json` is auto-detected for configuration

---

### Render Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | **Render config** - Auto-detected deployment configuration for Render.com |
| `package.json` | Contains build scripts (`npm run build`) |
| `dist/` | Output folder to serve as static site |
| `public/_redirects` | SPA redirect rules for client-side routing |

**Render Setup:**
1. Create a new **Static Site** on Render
2. Connect your GitHub repo - `render.yaml` will be auto-detected
3. Or manually set: Build command: `npm run build`, Publish directory: `dist`
4. Add environment variable: `API_KEY` (for AI features)

---

### Environment Variables (Both Platforms)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | Optional | Google Gemini API key for AI-powered chat features |

---

### File Reference Summary

```
/
├── wrangler.json        # CLOUDFLARE ONLY - Workers/Pages configuration
├── render.yaml          # RENDER ONLY - Static site deployment config
├── public/_redirects    # RENDER/NETLIFY - SPA routing redirects
├── package.json         # ALL PLATFORMS - Build scripts and dependencies
├── vite.config.ts       # ALL PLATFORMS - Vite bundler configuration
├── dist/                # ALL PLATFORMS - Built output (after npm run build)
└── index.html           # ALL PLATFORMS - Entry point HTML
```

## Features

- Water resources dashboard
- AI-powered hydrology advisor (requires API_KEY)
- Interactive maps with Leaflet
- Vegetation analysis
- Well inspection checklists
- Telemetry and SCADA integration
- RTL/Persian language support
