'use client';

import { useState, useEffect } from 'react';

interface Subject {
  id: number;
  name: string;
  category: string;
}

export default function PracticePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [mode, setMode] = useState<'list' | 'answer' | 'memorize'>('list');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // 如果没有userId，设置默认值为1（用于测试）
    const savedUserId = localStorage.getItem('userId');
    if (!savedUserId) {
      localStorage.setItem('userId', '1');
      setUserId('1');
    } else {
      setUserId(savedUserId);
    }
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/subjects?category=single_recruitment');
      const data = await response.json();
      setSubjects(data.subjects);
      setLoading(false);
    } catch (error) {
      console.error('加载科目失败:', error);
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setMode('answer');
  };

  if (loading) {
    return <div className="p-6 text-center">加载中...</div>;
  }

  // 科目列表
  if (mode === 'list') {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">选择科目</h2>
        <div className="space-y-3">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectSelect(subject)}
              className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all text-left"
            >
              <div className="font-medium text-lg">{subject.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 答题/背题模式
  return (
    <PracticeMode
      subject={selectedSubject!}
      mode={mode}
      onModeChange={setMode}
      onBack={() => {
        setSelectedSubject(null);
        setMode('list');
      }}
    />
  );
}

interface PracticeModeProps {
  subject: Subject;
  mode: 'answer' | 'memorize';
  onModeChange: (mode: 'answer' | 'memorize') => void;
  onBack: () => void;
}

function PracticeMode({ subject, mode, onModeChange, onBack }: PracticeModeProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    setUserId(savedUserId || '1');
  }, []);

  useEffect(() => {
    if (userId) {
      loadQuestions();
      checkUnlockStatus();
    }
  }, [subject.id, userId]);

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/practice/questions?subjectId=${subject.id}&userId=${userId}`);
      const data = await response.json();
      setQuestions(data.questions);
      setAnswerCount(data.answerCount || 0);
      setLoading(false);
    } catch (error) {
      console.error('加载题目失败:', error);
      setLoading(false);
    }
  };

  const checkUnlockStatus = async () => {
    try {
      const response = await fetch(`/api/practice/check-unlock?userId=${userId}&type=subject&targetId=${subject.id}`);
      const data = await response.json();
      setIsUnlocked(data.isUnlocked);
    } catch (error) {
      console.error('检查解锁状态失败:', error);
    }
  };

  const handleSelectAnswer = (option: string) => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: option
    });
    setShowAnswer({
      ...showAnswer,
      [currentQuestion.id]: true
    });

    // 记录答题
    recordAnswer(currentQuestion.id, option);
  };

  const recordAnswer = async (questionId: number, answer: string) => {
    try {
      await fetch('/api/practice/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          questionId,
          answer,
          mode
        })
      });
    } catch (error) {
      console.error('记录答案失败:', error);
    }
  };

  const handleNext = () => {
    // 检查是否达到第10题
    const totalCount = Object.keys(userAnswers).length + 1;

    if (!isUnlocked && totalCount >= 10) {
      setShowPurchase(true);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleActivateVip = () => {
    // 跳转到激活码页面
    window.location.href = '/profile?tab=activation';
  };

  if (loading) {
    return <div className="p-6 text-center">加载中...</div>;
  }

  // 购买引导弹窗
  if (showPurchase) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3">继续刷题</h3>
            <p className="text-gray-600 mb-6">
              您已完成9道免费题，添加客服微信领取VIP码，解锁该科目所有题目
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">客服微信号</p>
              <p className="text-lg font-bold text-blue-600 mt-1">example_wechat</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleActivateVip}
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

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return <div className="p-6 text-center">题目加载失败</div>;
  }

  const isCorrect = userAnswers[currentQuestion.id] === currentQuestion.answer;
  const hasAnswered = userAnswers[currentQuestion.id] !== undefined;

  return (
    <div className="p-4">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm">
          ← 返回
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => onModeChange('answer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              mode === 'answer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            答题模式
          </button>
          <button
            onClick={() => onModeChange('memorize')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              mode === 'memorize'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            背题模式
          </button>
        </div>
      </div>

      {/* 科目和进度 */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">{subject.name}</span>
          <span className="text-sm text-gray-500">
            {isUnlocked ? '已解锁' : `已答 ${Object.keys(userAnswers).length}/9 免费题`}
          </span>
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-medium mb-6 leading-relaxed">
          {currentQuestion.question_text}
        </h3>

        {/* 背题模式：直接显示答案 */}
        {mode === 'memorize' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm">
              <strong>正确答案：</strong>{currentQuestion.answer}
            </p>
            <p className="text-sm mt-2">
              <strong>解析：</strong>{currentQuestion.explanation}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {currentQuestion.options.map((option: string, index: number) => {
            const optionLabel = ['A', 'B', 'C', 'D'][index];
            const isSelected = userAnswers[currentQuestion.id] === option;
            const isCorrectAnswer = option === currentQuestion.answer;

            // 背题模式：显示正确答案
            if (mode === 'memorize') {
              return (
                <button
                  key={index}
                  className={`w-full p-4 rounded-lg border-2 text-left ${
                    isCorrectAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 text-sm font-medium">
                      {optionLabel}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            }

            // 答题模式
            return (
              <button
                key={index}
                onClick={() => !hasAnswered && handleSelectAnswer(option)}
                disabled={hasAnswered}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  !hasAnswered
                    ? 'border-gray-200 hover:border-blue-400'
                    : isSelected
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 text-sm font-medium">
                    {optionLabel}
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 答题模式：显示答案解析 */}
        {mode === 'answer' && hasAnswered && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className={`flex items-center mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              <span className="text-2xl mr-2">{isCorrect ? '✓' : '✗'}</span>
              <span className="font-medium">{isCorrect ? '回答正确' : '回答错误'}</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>正确答案：</strong>{currentQuestion.answer}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>解析：</strong>{currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-6">
          {mode === 'memorize' ? (
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              下一题
            </button>
          ) : hasAnswered ? (
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              下一题
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
