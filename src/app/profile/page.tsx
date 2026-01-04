'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<string>('orders');
  const [userId] = useState(localStorage.getItem('userId'));

  const sections = [
    { id: 'mistakes', label: '错题集', icon: '❌' },
    { id: 'orders', label: '我的订单', icon: '📦' },
    { id: 'activation', label: '激活码激活', icon: '🔑' },
    { id: 'feedback', label: '意见反馈', icon: '💬' },
    { id: 'service', label: '联系客服', icon: '🎧' },
  ];

  return (
    <div className="p-4">
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
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full bg-white border text-left py-4 px-6 rounded-lg flex justify-between items-center transition-all ${
              activeSection === section.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{section.icon}</span>
              <span className="font-medium">{section.label}</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      {activeSection === 'orders' && <OrdersSection userId={userId!} />}
      {activeSection === 'mistakes' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">错题统计</h3>
          <MistakeStats userId={userId!} />
          <button
            onClick={() => window.location.href = '/mistake'}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            查看错题集
          </button>
        </div>
      )}
      {activeSection === 'activation' && <ActivationSection userId={userId!} />}
      {activeSection === 'feedback' && <FeedbackSection userId={userId!} />}
      {activeSection === 'service' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-lg mb-4">联系客服</h3>
          <p className="text-gray-600 mb-4">
            如有疑问，请添加客服微信咨询
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">客服微信号</p>
            <p className="text-lg font-bold text-blue-600 mt-1">example_wechat</p>
          </div>
          <p className="text-xs text-gray-500">工作时间：9:00-18:00</p>
        </div>
      )}

      {/* 退出登录 */}
      <button
        onClick={onLogout}
        className="w-full mt-6 border border-red-300 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
      >
        退出登录
      </button>
    </div>
  );
}

// 订单部分
function OrdersSection({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${userId}`);
      const data = await response.json();
      setOrders(data.orders);
      setLoading(false);
    } catch (error) {
      console.error('加载订单失败:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-bold text-lg mb-4">我的订单</h3>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📦</div>
          <p>暂无订单</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{order.target_name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {order.status === 'paid' ? '已支付' : '已退款'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                <div>金额: ¥{order.amount}</div>
                <div>有效期至: {order.valid_until}</div>
                <div>购买时间: {new Date(order.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 激活码部分
function ActivationSection({ userId }: { userId: string }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleActivate = async () => {
    try {
      const response = await fetch('/api/vip/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '激活成功！已解锁对应内容' });
        setCode('');
      } else {
        setMessage({ type: 'error', text: data.error || '激活失败，请检查激活码是否正确' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '激活失败，请稍后重试' });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-bold text-lg mb-4">激活码激活</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          请输入激活码
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="例如：VIP12345678"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleActivate}
        disabled={!code.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        立即激活
      </button>

      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">如何获取激活码？</p>
        <p className="text-sm text-blue-600">
          1. 添加客服微信：example_wechat<br />
          2. 转账对应金额<br />
          3. 客服发送激活码给您
        </p>
      </div>
    </div>
  );
}

// 错题统计部分
function MistakeStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/mistake/stats?userId=${userId}`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('加载错题统计失败:', error);
    }
  };

  if (!stats) {
    return <div className="text-center text-gray-500">加载中...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-red-50 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-red-600">{stats.practice_mistakes || 0}</div>
        <div className="text-sm text-red-700 mt-1">专项练习错题</div>
      </div>
      <div className="bg-orange-50 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-orange-600">{stats.exam_mistakes || 0}</div>
        <div className="text-sm text-orange-700 mt-1">模拟卷错题</div>
      </div>
    </div>
  );
}

// 意见反馈部分
function FeedbackSection({ userId }: { userId: string }) {
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, contact })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '反馈提交成功，感谢您的意见！' });
        setContent('');
        setContact('');
      } else {
        setMessage({ type: 'error', text: data.error || '提交失败，请稍后重试' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '提交失败，请稍后重试' });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-bold text-lg mb-4">意见反馈</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          反馈内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请详细描述您的问题或建议..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          联系方式（选填）
        </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="手机号或微信号"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!content.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        提交反馈
      </button>
    </div>
  );
}
