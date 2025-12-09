/**
 * Cloudflare Pages Function - Sources API
 * Endpoint: GET /api/sources
 * Returns list of RSS sources being scraped
 */

interface Env {
  DB: D1Database;
}

interface Source {
  id: number;
  name: string;
  url: string;
  region: string;
  active: number;
  last_scraped: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
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
    const result = await env.DB.prepare(
      'SELECT id, name, url, region, active, last_scraped FROM rss_sources WHERE active = 1'
    ).all<Source>();

    return new Response(JSON.stringify({
      success: true,
      sources: result.results || [],
      keywords: [
        'water', 'waste', 'water management', 'drought', 'aquifer',
        'groundwater', 'irrigation', 'dam', 'subsidence', 'desalination',
        'آب', 'خشکسالی', 'سفره آب', 'فرونشست', 'مدیریت آب'
      ]
    }), { headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch sources'
    }), { 
      status: 500,
      headers: corsHeaders 
    });
  }
};
