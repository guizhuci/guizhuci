'use client';

import { useState, useEffect } from 'react';
import DailyFreePage from '@/app/daily-free/page';
import PracticePage from '@/app/practice/page';
import ExamPage from '@/app/exam/page';
import MistakePage from '@/app/mistake/page';
import NewsPage from '@/app/news/page';
import ProfilePage from '@/app/profile/page';

export default function Home() {
  const [activeTab, setActiveTab] = useState('quiz');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'free' | 'practice' | 'exam' | 'mistake'>('free');

  // 检查登录状态
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    // 模拟微信授权登录
    const mockUserId = 'user_' + Date.now();
    localStorage.setItem('userId', mockUserId);
    localStorage.setItem('userOpenid', 'openid_' + Date.now());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userOpenid');
    setIsLoggedIn(false);
    setCurrentPage('free');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="min-h-screen">
        {/* 未登录页面 */}
        {!isLoggedIn && (
          <div className="p-6">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold mb-4 text-blue-600">桂·职测助手</h1>
              <p className="text-gray-600 mb-8">广西单招刷题神器</p>
              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  className="w-full max-w-xs bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors text-lg"
                >
                  微信一键登录
                </button>
                <p className="text-sm text-gray-500">首次登录需绑定手机号</p>
              </div>
              {/* 后台管理入口 */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <a
                  href="/admin"
                  className="text-sm text-gray-400 hover:text-gray-600 underline"
                >
                  后台管理系统
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 已登录 - 刷题页面 */}
        {isLoggedIn && activeTab === 'quiz' && (
          <div>
            {/* 页面标题 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
              <h1 className="text-xl font-bold">单招刷题</h1>
            </div>

            {/* 刷题主导航 */}
            <div className="px-4 pt-4">
              <div className="bg-white rounded-xl p-1.5 flex space-x-1">
                <button
                  onClick={() => setCurrentPage('free')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    currentPage === 'free'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  免费刷题
                </button>
                <button
                  onClick={() => setCurrentPage('practice')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    currentPage === 'practice'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  专项练习
                </button>
                <button
                  onClick={() => setCurrentPage('exam')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    currentPage === 'exam'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  全真模拟
                </button>
                <button
                  onClick={() => setCurrentPage('mistake')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    currentPage === 'mistake'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  错题集
                </button>
              </div>
            </div>

            {/* 页面内容 */}
            <div className="mt-4">
              {currentPage === 'free' && <DailyFreePage />}
              {currentPage === 'practice' && <PracticePage />}
              {currentPage === 'exam' && <ExamPage />}
              {currentPage === 'mistake' && <MistakePage />}
            </div>
          </div>
        )}

        {/* 资讯页面 */}
        {isLoggedIn && activeTab === 'news' && <NewsPage />}

        {/* 我的页面 */}
        {isLoggedIn && activeTab === 'profile' && (
          <ProfilePage onLogout={handleLogout} />
        )}
      </main>

      {/* 底部导航栏 */}
      {isLoggedIn && (
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
      )}
    </div>
  );
}
