'use client';

import { useState, useEffect } from 'react';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNewsList(data.news);
      setLoading(false);
    } catch (error) {
      console.error('加载资讯失败:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">加载中...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">招考资讯</h1>

      {newsList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">📰</div>
          <p>暂无资讯</p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsList.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h2 className="font-bold text-lg mb-2">{news.title}</h2>
              {news.summary && (
                <p className="text-gray-600 text-sm mb-3">{news.summary}</p>
              )}
              <div className="flex justify-between items-center text-xs text-gray-400">
                {news.source && <span>{news.source}</span>}
                <span>{new Date(news.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          资讯内容支持从微信公众号同步更新
        </p>
      </div>
    </div>
  );
}
