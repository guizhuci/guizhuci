'use client';

import { useState } from 'react';
import QuizPage from '@/app/quiz/page';
import NewsPage from '@/app/news/page';
import ProfilePage from '@/app/profile/page';

export default function Home() {
  const [activeTab, setActiveTab] = useState('quiz');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="min-h-screen">
        {activeTab === 'quiz' && <QuizPage />}
        {activeTab === 'news' && <NewsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              activeTab === 'quiz' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-xs">刷题</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              activeTab === 'news' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-xs">资讯</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">我的</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
