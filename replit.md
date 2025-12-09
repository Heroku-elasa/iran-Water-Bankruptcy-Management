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

The project is configured for static deployment:
- Build command: `npm run build`
- Output directory: `dist`

## Features

- Water resources dashboard
- AI-powered hydrology advisor (requires API_KEY)
- Interactive maps with Leaflet
- Vegetation analysis
- Well inspection checklists
- Telemetry and SCADA integration
- RTL/Persian language support
