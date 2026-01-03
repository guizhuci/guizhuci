'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<string>('orders');

  return (
    <div className="p-6">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold">考生用户</h2>
            <p className="text-blue-100 text-sm">已绑定手机号</p>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => setActiveSection('mistakes')}
          className="w-full bg-white border border-gray-200 text-left py-4 px-6 rounded-lg hover:bg-gray-50 flex justify-between items-center"
        >
          <span className="font-medium">错题集</span>
          <span className="text-gray-400">→</span>
        </button>
        <button
          onClick={() => setActiveSection('orders')}
          className="w-full bg-white border border-gray-200 text-left py-4 px-6 rounded-lg hover:bg-gray-50 flex justify-between items-center"
        >
          <span className="font-medium">我的订单</span>
          <span className="text-gray-400">→</span>
        </button>
        <button
          onClick={() => setActiveSection('activation')}
          className="w-full bg-white border border-gray-200 text-left py-4 px-6 rounded-lg hover:bg-gray-50 flex justify-between items-center"
        >
          <span className="font-medium">激活码激活</span>
          <span className="text-gray-400">→</span>
        </button>
        <button
          onClick={() => setActiveSection('feedback')}
          className="w-full bg-white border border-gray-200 text-left py-4 px-6 rounded-lg hover:bg-gray-50 flex justify-between items-center"
        >
          <span className="font-medium">意见反馈</span>
          <span className="text-gray-400">→</span>
        </button>
        <button
          onClick={() => setActiveSection('service')}
          className="w-full bg-white border border-gray-200 text-left py-4 px-6 rounded-lg hover:bg-gray-50 flex justify-between items-center"
        >
          <span className="font-medium">联系客服</span>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* 内容区域 */}
      {activeSection === 'orders' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">我的订单</h3>
          <p className="text-gray-500 text-center py-8">暂无订单</p>
        </div>
      )}

      {activeSection === 'mistakes' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">错题集</h3>
          <p className="text-gray-500 text-center py-8">暂无错题，继续加油！</p>
        </div>
      )}

      {activeSection === 'activation' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">激活码激活</h3>
          <input
            type="text"
            placeholder="请输入激活码"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
            立即激活
          </button>
        </div>
      )}

      {activeSection === 'feedback' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">意见反馈</h3>
          <textarea
            placeholder="请输入您的意见或建议"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
            提交反馈
          </button>
        </div>
      )}

      {activeSection === 'service' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">联系客服</h3>
          <p className="text-gray-600 mb-4">
            如有疑问，请添加客服微信咨询
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">客服微信号：example_wechat</p>
            <p className="text-xs text-blue-600 mt-1">工作时间：9:00-18:00</p>
          </div>
        </div>
      )}
    </div>
  );
}
