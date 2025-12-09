import React, { useState, useEffect, useCallback } from 'react';

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

interface NewsResponse {
  success: boolean;
  count: number;
  articles: Article[];
  fetched_at: string;
  error?: string;
}

interface NewsPageProps {
  apiBaseUrl?: string;
}

const NewsPage: React.FC<NewsPageProps> = ({ apiBaseUrl = '' }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<string>('all');
  const [scraping, setScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (region !== 'all') {
        params.append('region', region);
      }
      
      const response = await fetch(`${apiBaseUrl}/api/news?${params}`);
      const data: NewsResponse = await response.json();
      
      if (data.success) {
        setArticles(data.articles);
      } else {
        setError(data.error || 'خطا در دریافت اخبار');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, region]);

  const triggerScrape = async () => {
    setScraping(true);
    setScrapeMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/scrape`, { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setScrapeMessage(`${data.total_saved} خبر جدید ذخیره شد`);
        fetchNews();
      } else {
        setScrapeMessage('خطا در جمع‌آوری اخبار');
      }
    } catch (err) {
      setScrapeMessage('خطا در اتصال');
    } finally {
      setScraping(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getRegionBadgeColor = (reg: string) => {
    switch (reg) {
      case 'Iran':
        return 'bg-green-100 text-green-800';
      case 'Middle East':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          اخبار مدیریت آب
        </h1>
        <p className="text-gray-600">
          آخرین اخبار و مقالات مرتبط با مدیریت منابع آب در ایران و خاورمیانه
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <label className="text-gray-700">منطقه:</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه</option>
            <option value="Iran">ایران</option>
            <option value="Middle East">خاورمیانه</option>
          </select>
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          بارگذاری مجدد
        </button>

        <button
          onClick={triggerScrape}
          disabled={scraping}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <svg className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {scraping ? 'در حال جمع‌آوری...' : 'جمع‌آوری اخبار جدید'}
        </button>

        {scrapeMessage && (
          <span className="text-green-600 font-medium">{scrapeMessage}</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-gray-600 text-lg">هنوز خبری وجود ندارد</p>
          <p className="text-gray-500 mt-2">روی "جمع‌آوری اخبار جدید" کلیک کنید</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRegionBadgeColor(article.region)}`}>
                    {article.region === 'Iran' ? 'ایران' : article.region}
                  </span>
                  <span className="text-xs text-gray-500">{article.source}</span>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </a>
                </h2>
                
                {article.summary && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t">
                  <span>{formatDate(article.publish_date)}</span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    مشاهده
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        {articles.length > 0 && (
          <p>{articles.length} خبر نمایش داده شده</p>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
