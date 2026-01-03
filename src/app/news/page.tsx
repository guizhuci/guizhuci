'use client';

import { useState } from 'react';

export default function NewsPage() {
  const [newsList, setNewsList] = useState([
    {
      id: 1,
      title: '2024年职业技能测试大纲发布',
      summary: '最新职业技能测试大纲已正式发布，涵盖19个专业大类，考生请注意查看。',
      date: '2024-01-15',
      source: '招考网',
    },
    {
      id: 2,
      title: '单招报名即将开始',
      summary: '2024年单招报名通道将于近期开放，请考生提前准备相关材料。',
      date: '2024-01-10',
      source: '招考网',
    },
    {
      id: 3,
      title: '职业技能测试时间安排',
      summary: '2024年职业技能测试时间已确定，请考生合理安排复习计划。',
      date: '2024-01-08',
      source: '招考网',
    },
    {
      id: 4,
      title: '成绩查询通道开放',
      summary: '2023年职业技能测试成绩查询通道已开放，考生可登录查询。',
      date: '2023-12-20',
      source: '招考网',
    },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">招考资讯</h1>

      <div className="space-y-4">
        {newsList.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h2 className="font-bold text-lg mb-2">{news.title}</h2>
            <p className="text-gray-600 text-sm mb-3">{news.summary}</p>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{news.source}</span>
              <span>{news.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          资讯内容可从微信公众号同步更新
        </p>
      </div>
    </div>
  );
}
