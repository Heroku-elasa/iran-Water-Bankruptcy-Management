/**
 * Cloudflare Pages Function - News API
 * Endpoint: GET /api/news
 * 
 * Query Parameters:
 * - limit: number (default 20)
 * - region: string (Iran, Middle East, or all)
 * - source: string (filter by source name)
 */

interface Env {
  DB: D1Database;
}

interface Article {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  region: string;
  publish_date: string;
  scraped_at: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const region = url.searchParams.get('region');
    const source = url.searchParams.get('source');

    let query = 'SELECT id, title, summary, url, source, region, publish_date, scraped_at FROM articles';
    const params: string[] = [];
    const conditions: string[] = [];

    if (region && region !== 'all') {
      conditions.push('region = ?');
      params.push(region);
    }

    if (source) {
      conditions.push('source = ?');
      params.push(source);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY publish_date DESC, scraped_at DESC LIMIT ?';
    params.push(limit.toString());

    const result = await env.DB.prepare(query).bind(...params).all<Article>();

    return new Response(JSON.stringify({
      success: true,
      count: result.results?.length || 0,
      articles: result.results || [],
      fetched_at: new Date().toISOString()
    }), { headers: corsHeaders });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: corsHeaders 
    });
  }
};
