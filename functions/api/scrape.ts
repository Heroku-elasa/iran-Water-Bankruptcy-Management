/**
 * Cloudflare Pages Function - News Scraper
 * Endpoint: POST /api/scrape
 * 
 * Scrapes RSS feeds and saves to D1 database
 * Can be triggered manually or via Cloudflare Cron Trigger
 */

interface Env {
  DB: D1Database;
}

interface RssSource {
  id: number;
  name: string;
  url: string;
  region: string;
}

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

const KEYWORDS = [
  'water', 'waste', 'water management', 'drought', 'aquifer',
  'groundwater', 'irrigation', 'dam', 'subsidence', 'desalination',
  'آب', 'خشکسالی', 'سفره آب', 'فرونشست', 'مدیریت آب', 'بحران آب',
  'environment', 'climate', 'pollution', 'recycling'
];

function containsKeywords(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function parseRssFeed(feedUrl: string): Promise<RssItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WaterNewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${feedUrl}: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const items: RssItem[] = [];
    
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemXml);
      const linkMatch = /<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i.exec(itemXml);
      const descMatch = /<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemXml);
      const dateMatch = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i.exec(itemXml);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: extractTextFromHtml(titleMatch[1]),
          link: extractTextFromHtml(linkMatch[1]),
          description: descMatch ? extractTextFromHtml(descMatch[1]).substring(0, 500) : '',
          pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString()
        });
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error parsing feed ${feedUrl}:`, error);
    return [];
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const sources = await env.DB.prepare(
      'SELECT id, name, url, region FROM rss_sources WHERE active = 1'
    ).all<RssSource>();

    let totalScraped = 0;
    let totalSaved = 0;
    const results: { source: string; scraped: number; saved: number }[] = [];

    for (const source of sources.results || []) {
      const items = await parseRssFeed(source.url);
      let savedCount = 0;

      for (const item of items) {
        if (containsKeywords(item.title) || containsKeywords(item.description)) {
          try {
            await env.DB.prepare(`
              INSERT OR IGNORE INTO articles (title, summary, url, source, region, publish_date, keywords)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
              item.title,
              item.description,
              item.link,
              source.name,
              source.region,
              item.pubDate,
              KEYWORDS.filter(k => 
                item.title.toLowerCase().includes(k.toLowerCase()) || 
                item.description.toLowerCase().includes(k.toLowerCase())
              ).join(',')
            ).run();
            savedCount++;
          } catch (e) {
            console.error('Insert error:', e);
          }
        }
      }

      await env.DB.prepare(
        'UPDATE rss_sources SET last_scraped = ? WHERE id = ?'
      ).bind(new Date().toISOString(), source.id).run();

      totalScraped += items.length;
      totalSaved += savedCount;
      results.push({ source: source.name, scraped: items.length, saved: savedCount });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Scraping completed',
      total_scraped: totalScraped,
      total_saved: totalSaved,
      details: results,
      scraped_at: new Date().toISOString()
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Scraping failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: corsHeaders 
    });
  }
};
