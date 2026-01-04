'use client';

import { useState, useEffect } from 'react';

interface ExamPaper {
  id: number;
  title: string;
  subject_id: number;
  duration: number;
  total_score: number;
  is_free: boolean;
  price: number;
}

export default function ExamPage() {
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [currentPaper, setCurrentPaper] = useState<ExamPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'taking' | 'result'>('list');
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // 确保组件只在客户端运行时才访问localStorage
  useEffect(() => {
    setMounted(true);
    const savedUserId = localStorage.getItem('userId');
    setUserId(savedUserId || '1');
  }, []);

  useEffect(() => {
    if (mounted) {
      loadExamPapers();
    }
  }, [mounted]);

  const loadExamPapers = async () => {
    try {
      const response = await fetch('/api/exam/papers');
      const data = await response.json();
      setPapers(data.papers);
      setLoading(false);
    } catch (error) {
      console.error('加载模拟卷失败:', error);
      setLoading(false);
    }
  };

  const handleStartExam = (paper: ExamPaper) => {
    setCurrentPaper(paper);
    setMode('taking');
  };

  const handleBack = () => {
    setCurrentPaper(null);
    setMode('list');
  };

  if (loading) {
    return <div className="p-6 text-center">加载中...</div>;
  }

  // 模拟卷列表
  if (mode === 'list') {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">全真模拟卷</h2>
        {papers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📝</div>
            <p>暂无模拟卷</p>
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white rounded-xl p-5 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{paper.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    paper.is_free
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {paper.is_free ? '免费' : `${paper.price}元`}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  <span>时长 {paper.duration}分钟</span>
                  <span className="mx-2">|</span>
                  <span>总分 {paper.total_score}分</span>
                </div>
                <button
                  onClick={() => handleStartExam(paper)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  开始答题
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 答题界面
  return (
    <ExamTaking
      paper={currentPaper!}
      userId={userId!}
      onBack={handleBack}
      onComplete={() => setMode('result')}
    />
  );
}

interface ExamTakingProps {
  paper: ExamPaper;
  userId: string;
  onBack: () => void;
  onComplete: () => void;
}

function ExamTaking({ paper, userId, onBack, onComplete }: ExamTakingProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(paper.duration * 60); // 秒
  const [showPurchase, setShowPurchase] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    loadQuestions();
    checkUnlockStatus();

    // 倒计时
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paper.id]);

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/exam/questions?paperId=${paper.id}`);
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      console.error('加载题目失败:', error);
      setLoading(false);
    }
  };

  const checkUnlockStatus = async () => {
    if (paper.is_free) {
      setIsUnlocked(true);
      return;
    }

    try {
      const response = await fetch(`/api/practice/check-unlock?userId=${userId}&type=exam_paper&targetId=${paper.id}`);
      const data = await response.json();
      setIsUnlocked(data.isUnlocked);
    } catch (error) {
      console.error('检查解锁状态失败:', error);
    }
  };

  const handleSelectAnswer = (option: string) => {
    const currentQuestion = questions[currentIndex];
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: option
    });
  };

  const handleNext = () => {
    // 检查是否达到第6题且未解锁
    const answeredCount = Object.keys(userAnswers).length;

    if (!paper.is_free && !isUnlocked && answeredCount >= 5) {
      setShowPurchase(true);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paperId: paper.id,
          answers: userAnswers
        })
      });
      setHasSubmitted(true);
      onComplete();
    } catch (error) {
      console.error('提交试卷失败:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 购买引导弹窗
  if (showPurchase) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3">解锁试卷</h3>
            <p className="text-gray-600 mb-6">
              本套试卷收费{paper.price}元，添加客服微信解锁后继续答题
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">客服微信号</p>
              <p className="text-lg font-bold text-blue-600 mt-1">example_wechat</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/profile?tab=activation'}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                输入VIP码
              </button>
              <button
                onClick={() => setShowPurchase(false)}
                className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center">加载题目中...</div>;
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return <div className="p-6 text-center">题目加载失败</div>;
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <button onClick={onBack} className="text-blue-600 text-sm">
            ← 退出
          </button>
          <div className="text-sm font-medium">
            {currentIndex + 1}/{questions.length}
          </div>
          <div className={`text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-600' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目内容 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl p-6 mb-4">
          <h3 className="text-lg font-medium mb-6 leading-relaxed">
            {currentQuestion.question_text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option: string, index: number) => {
              const optionLabel = ['A', 'B', 'C', 'D'][index];
              const isSelected = userAnswers[currentQuestion.id] === option;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 text-sm font-medium ${
                      isSelected ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected ? '✓' : optionLabel}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex space-x-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一题
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            {currentIndex === questions.length - 1 ? '完成' : '下一题'}
          </button>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={Object.keys(userAnswers).length < questions.length}
          className="w-full mt-3 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          交卷
        </button>
      </div>
    </div>
  );
}
