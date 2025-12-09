"""
News Scraping API for Water Management in Iran/Middle East
Deploy this to Render.com as a Web Service (Python)
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import feedparser
from newspaper import Article
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

RSS_FEEDS = [
    {
        "name": "IRNA Environment",
        "url": "https://www.irna.ir/rss/environment",
        "region": "Iran"
    },
    {
        "name": "Al Jazeera",
        "url": "https://www.aljazeera.com/xml/rss/all.xml",
        "region": "Middle East"
    },
    {
        "name": "Tehran Times",
        "url": "https://www.tehrantimes.com/rss",
        "region": "Iran"
    }
]

KEYWORDS = [
    "water", "waste", "water management", "drought", "aquifer",
    "groundwater", "irrigation", "dam", "subsidence", "desalination",
    "آب", "خشکسالی", "سفره آب", "فرونشست", "مدیریت آب"
]


def contains_keywords(text, keywords):
    """Check if text contains any of the keywords"""
    if not text:
        return False
    text_lower = text.lower()
    return any(keyword.lower() in text_lower for keyword in keywords)


def scrape_feed(feed_info, limit=10):
    """Scrape a single RSS feed and return matching articles"""
    articles = []
    try:
        feed = feedparser.parse(feed_info["url"])
        count = 0
        
        for entry in feed.entries:
            if count >= limit:
                break
                
            title = entry.get("title", "")
            summary = entry.get("summary", "")
            
            if contains_keywords(title, KEYWORDS) or contains_keywords(summary, KEYWORDS):
                try:
                    article = Article(entry.link)
                    article.download()
                    article.parse()
                    
                    articles.append({
                        "title": article.title or title,
                        "summary": summary[:300] + "..." if len(summary) > 300 else summary,
                        "url": entry.link,
                        "source": feed_info["name"],
                        "region": feed_info["region"],
                        "publish_date": str(article.publish_date) if article.publish_date else entry.get("published", ""),
                        "authors": article.authors if article.authors else []
                    })
                    count += 1
                except Exception as e:
                    articles.append({
                        "title": title,
                        "summary": summary[:300] + "..." if len(summary) > 300 else summary,
                        "url": entry.link,
                        "source": feed_info["name"],
                        "region": feed_info["region"],
                        "publish_date": entry.get("published", ""),
                        "authors": []
                    })
                    count += 1
                    
    except Exception as e:
        print(f"Error scraping {feed_info['name']}: {str(e)}")
    
    return articles


@app.route("/")
def home():
    """API Home"""
    return jsonify({
        "name": "Water Management News API",
        "version": "1.0.0",
        "endpoints": {
            "/news": "Get water management news from Iran and Middle East",
            "/sources": "List available news sources",
            "/health": "API health check"
        }
    })


@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})


@app.route("/sources")
def sources():
    """List available news sources"""
    return jsonify({
        "sources": [{"name": f["name"], "region": f["region"]} for f in RSS_FEEDS],
        "keywords": KEYWORDS
    })


@app.route("/news")
def get_news():
    """Get water management news"""
    limit = request.args.get("limit", default=10, type=int)
    region = request.args.get("region", default=None, type=str)
    
    all_articles = []
    
    for feed in RSS_FEEDS:
        if region and feed["region"].lower() != region.lower():
            continue
        articles = scrape_feed(feed, limit=limit)
        all_articles.extend(articles)
    
    all_articles.sort(key=lambda x: x.get("publish_date", ""), reverse=True)
    
    return jsonify({
        "count": len(all_articles),
        "articles": all_articles[:limit * len(RSS_FEEDS)],
        "fetched_at": datetime.now().isoformat()
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
