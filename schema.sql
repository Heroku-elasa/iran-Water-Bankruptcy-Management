-- Cloudflare D1 Database Schema for News Scraper
-- Run this in Cloudflare Dashboard: D1 > Your Database > Console

-- Articles table stores scraped news
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    source TEXT,
    region TEXT,
    authors TEXT,
    publish_date TEXT,
    scraped_at TEXT DEFAULT (datetime('now')),
    keywords TEXT
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_region ON articles(region);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);

-- RSS Sources table
CREATE TABLE IF NOT EXISTS rss_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    region TEXT,
    active INTEGER DEFAULT 1,
    last_scraped TEXT
);

-- Insert default RSS sources
INSERT OR IGNORE INTO rss_sources (name, url, region) VALUES 
    ('IRNA Environment', 'https://www.irna.ir/rss/environment', 'Iran'),
    ('Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml', 'Middle East'),
    ('Tehran Times', 'https://www.tehrantimes.com/rss', 'Iran'),
    ('Waste & Recycling MEA', 'https://www.wasterecyclingmea.com/feed', 'Middle East');
