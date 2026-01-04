'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'exams' | 'vips' | 'orders' | 'news'>('questions');

  const tabs = [
    { id: 'questions', label: '题库管理', icon: '📚' },
    { id: 'exams', label: '模拟卷管理', icon: '📝' },
    { id: 'vips', label: 'VIP码管理', icon: '🔑' },
    { id: 'orders', label: '订单管理', icon: '📦' },
    { id: 'news', label: '资讯管理', icon: '📰' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold">桂·职测助手 - 后台管理系统</h1>
      </div>

      <div className="flex">
        {/* 侧边栏 */}
        <div className="w-64 bg-white min-h-screen border-r border-gray-200">
          <div className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 p-6">
          {activeTab === 'questions' && <QuestionsManagement />}
          {activeTab === 'exams' && <ExamsManagement />}
          {activeTab === 'vips' && <VipManagement />}
          {activeTab === 'orders' && <OrdersManagement />}
          {activeTab === 'news' && <NewsManagement />}
        </div>
      </div>
    </div>
  );
}

// 题库管理
function QuestionsManagement() {
  const [importMode, setImportMode] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">题库管理</h2>
        <div className="space-x-3">
          <button
            onClick={() => setImportMode(!importMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {importMode ? '返回列表' : '导入题目'}
          </button>
        </div>
      </div>

      {importMode ? (
        <QuestionImport onCancel={() => setImportMode(false)} />
      ) : (
        <QuestionsList />
      )}
    </div>
  );
}

// 题目导入
function QuestionImport({ onCancel }: { onCancel: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file || !subjectId) {
      alert('请选择文件和科目');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId.toString());

    try {
      const response = await fetch('/api/admin/questions/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      setUploading(false);
    } catch (error) {
      console.error('上传失败:', error);
      setUploading(false);
      alert('上传失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">导入题目</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择科目
        </label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
        >
          <option value="">请选择科目</option>
          <option value="1">信息技术</option>
          <option value="2">通用技术</option>
          <option value="3">美术</option>
          <option value="4">音乐</option>
          <option value="5">综合实践</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          上传Word文档
        </label>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-2">
          支持格式：.docx（题目在前，答案在后）
        </p>
      </div>

      {result && (
        <div className={`mb-4 p-4 rounded-lg ${
          result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="font-medium mb-2">{result.success ? '导入成功' : '导入失败'}</p>
          {result.success ? (
            <p>成功导入 {result.imported || 0} 道题目</p>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={handleUpload}
          disabled={!file || !subjectId || uploading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {uploading ? '导入中...' : '开始导入'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}

// 题目列表（简化版）
function QuestionsList() {
  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">题目列表</h3>
      <p className="text-gray-500">
        题目列表功能开发中，请先使用导入功能添加题目
      </p>
    </div>
  );
}

// 模拟卷管理
function ExamsManagement() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">模拟卷管理</h2>
      <div className="bg-white rounded-xl p-6">
        <p className="text-gray-500">
          模拟卷管理功能开发中...
        </p>
      </div>
    </div>
  );
}

// VIP码管理
function VipManagement() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">VIP码管理</h2>
      <div className="bg-white rounded-xl p-6">
        <VipCodeGenerator />
      </div>
    </div>
  );
}

// VIP码生成器
function VipCodeGenerator() {
  const [type, setType] = useState<'subject' | 'exam_paper'>('subject');
  const [targetId, setTargetId] = useState<number | ''>('');
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!targetId) {
      alert('请选择目标');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/admin/vip/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId,
          count
        }),
      });

      const data = await response.json();
      setResult(data);
      setGenerating(false);
    } catch (error) {
      console.error('生成失败:', error);
      setGenerating(false);
      alert('生成失败，请重试');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">批量生成VIP码</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            类型
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
          >
            <option value="subject">科目解锁</option>
            <option value="exam_paper">模拟卷解锁</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            生成数量
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择目标
        </label>
        <select
          value={targetId}
          onChange={(e) => setTargetId(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
        >
          <option value="">请选择目标</option>
          {type === 'subject' ? (
            <>
              <option value="1">信息技术</option>
              <option value="2">通用技术</option>
              <option value="3">美术</option>
              <option value="4">音乐</option>
              <option value="5">综合实践</option>
            </>
          ) : (
            <option value="1">示例模拟卷1</option>
          )}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!targetId || generating}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {generating ? '生成中...' : '生成VIP码'}
      </button>

      {result && result.success && result.codes && (
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <p className="font-medium mb-2">生成成功！</p>
          <div className="space-y-2">
            {result.codes.map((code: string, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <code className="bg-white px-3 py-1 rounded border">{code}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    alert('已复制');
                  }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  复制
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const text = result.codes.join('\n');
              navigator.clipboard.writeText(text);
              alert('全部已复制');
            }}
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            复制全部
          </button>
        </div>
      )}
    </div>
  );
}

// 订单管理
function OrdersManagement() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">订单管理</h2>
      <div className="bg-white rounded-xl p-6">
        <p className="text-gray-500">
          订单管理功能开发中...
        </p>
      </div>
    </div>
  );
}

// 资讯管理
function NewsManagement() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">资讯管理</h2>
      <div className="bg-white rounded-xl p-6">
        <p className="text-gray-500">
          资讯管理功能开发中...
        </p>
      </div>
    </div>
  );
}
