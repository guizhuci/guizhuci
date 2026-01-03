'use client';

import { useState, useEffect } from 'react';

// 19个中职专业大类
const VOCATIONAL_CATEGORIES = [
  { id: 1, name: '农林牧渔大类', subjects: ['化学', '微生物基础'] },
  { id: 2, name: '资源环境与安全大类', subjects: ['工程制图基础', '测量基础'] },
  { id: 3, name: '能源动力与材料大类', subjects: ['工程制图', '电工技术基础与技能'] },
  { id: 4, name: '土木建筑大类', subjects: ['建筑工程识图', '建筑 CAD'] },
  { id: 5, name: '水利大类', subjects: ['水利工程制图', '工程测量', '工程力学'] },
  { id: 6, name: '装备制造大类', subjects: ['机械制图', '电工电子技术与技能'] },
  { id: 7, name: '生物与化工大类', subjects: ['化学分析', '无机化学', '有机化学'] },
  { id: 8, name: '轻工纺织大类', subjects: ['平面设计基础', '色彩应用基础', '计算机图形处理技术'] },
  { id: 9, name: '食品药品与粮食大类', subjects: ['无机化学', '分析化学', '食品营养与健康'] },
  { id: 10, name: '交通运输大类', subjects: ['制图基础', '交通运输概论'] },
  { id: 11, name: '电子与信息大类', subjects: ['电工电子技术基础与技能', '程序设计基础', '计算机网络基础'] },
  { id: 12, name: '医药卫生大类', subjects: ['解剖学基础', '生理学基础', '病理学基础'] },
  { id: 13, name: '财经商贸大类', subjects: ['电子商务基础', '管理学基础', '经济学基础'] },
  { id: 14, name: '旅游大类', subjects: ['旅游概论', '服务礼仪', '管理学'] },
  { id: 15, name: '文化艺术大类', subjects: ['艺术概论', '艺术史'] },
  { id: 16, name: '新闻传播大类', subjects: ['摄影摄像', '图形图像处理', '新闻学基础'] },
  { id: 17, name: '教育与体育大类', subjects: ['教育学基础', '心理学基础'] },
  { id: 18, name: '公安与司法大类', subjects: ['刑事法律', '行政法律', '民事法律'] },
  { id: 19, name: '公共管理与服务大类', subjects: ['管理学基础', '人力资源管理'] },
];

export default function QuizPage() {
  const [userType, setUserType] = useState<'high' | 'vocational' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 检查是否已登录
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 从 localStorage 读取用户状态
  useEffect(() => {
    const savedUserType = localStorage.getItem('userType');
    const savedCategoryId = localStorage.getItem('categoryId');
    if (savedUserType) {
      setUserType(savedUserType as 'high' | 'vocational');
    }
    if (savedCategoryId) {
      setSelectedCategory(parseInt(savedCategoryId));
    }
  }, []);

  const handleUserTypeSelect = (type: 'high' | 'vocational') => {
    setUserType(type);
    localStorage.setItem('userType', type);
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    localStorage.setItem('categoryId', categoryId.toString());
  };

  // 未登录或未选择类型时
  if (!isLoggedIn) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">桂职测助手</h2>
          <p className="text-gray-600 mb-8">欢迎登录</p>
          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full max-w-xs bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
          >
            微信一键登录
          </button>
          <p className="text-sm text-gray-500 mt-4">首次登录需绑定手机号</p>
        </div>
      </div>
    );
  }

  // 选择考生类型
  if (!userType) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">选择考生类型</h2>
        <div className="space-y-4">
          <button
            onClick={() => handleUserTypeSelect('high')}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            高中生
          </button>
          <button
            onClick={() => handleUserTypeSelect('vocational')}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            中职生
          </button>
        </div>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            不知道选什么专业大类？
          </p>
          <p className="text-sm text-blue-600 font-medium mt-1">
            联系客服微信：example_wechat
          </p>
        </div>
      </div>
    );
  }

  // 中职生选择专业大类
  if (userType === 'vocational' && !selectedCategory) {
    return (
      <div className="p-6">
        <button
          onClick={() => {
            setUserType(null);
            setSelectedCategory(null);
            localStorage.removeItem('userType');
            localStorage.removeItem('categoryId');
          }}
          className="text-blue-600 text-sm mb-4"
        >
          ← 返回选择类型
        </button>
        <h2 className="text-2xl font-bold mb-6">选择专业大类</h2>
        <div className="space-y-3">
          {VOCATIONAL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="w-full bg-white border border-gray-200 text-left py-4 px-6 rounded-lg hover:border-blue-600 hover:shadow-md transition-all"
            >
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                包含：{category.subjects.join('、')}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 刷题主界面
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {userType === 'high' ? '高中生刷题' : '中职生刷题'}
        </h2>
        <button
          onClick={() => {
            setUserType(null);
            setSelectedCategory(null);
            localStorage.removeItem('userType');
            localStorage.removeItem('categoryId');
          }}
          className="text-blue-600 text-sm"
        >
          重新选择
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-bold text-lg mb-1">专项练习</h3>
          <p className="text-sm text-gray-500">按科目分类刷题</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-bold text-lg mb-1">月考卷</h3>
          <p className="text-sm text-gray-500">每月测试卷</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-bold text-lg mb-1">全真模拟</h3>
          <p className="text-sm text-gray-500">10-20套模拟卷</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">❌</div>
          <h3 className="font-bold text-lg mb-1">错题集</h3>
          <p className="text-sm text-gray-500">自动收集错题</p>
        </div>
      </div>

      {/* 继续开发其他功能... */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          功能开发中，敬请期待...
        </p>
      </div>
    </div>
  );
}
