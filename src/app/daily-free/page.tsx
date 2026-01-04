'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function DailyFreePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [todayAnswered, setTodayAnswered] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  const userId = localStorage.getItem('userId');

  // 检查今日答题情况
  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    try {
      const response = await fetch(`/api/daily-free/check?userId=${userId}`);
      const data = await response.json();
      setTodayCount(data.count);
      setTodayAnswered(data.count >= 5);
      if (data.count < 5) {
        loadDailyQuestions();
      }
    } catch (error) {
      console.error('检查今日答题状态失败:', error);
      setLoading(false);
    }
  };

  // 加载每日题目
  const loadDailyQuestions = async () => {
    try {
      const response = await fetch(`/api/daily-free/questions?userId=${userId}`);
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      console.error('加载题目失败:', error);
      setLoading(false);
    }
  };

  // 选择答案
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
  };

  // 提交答案
  const handleCheckAnswer = async () => {
    try {
      const currentQuestion = questions[currentIndex];
      await fetch('/api/daily-free/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          questionId: currentQuestion.id,
          answer: userAnswers[currentQuestion.id]
        })
      });

      // 更新今日答题数量
      setTodayCount(prev => prev + 1);
      if (todayCount + 1 >= 5) {
        setTodayAnswered(true);
        setCompleted(true);
      }
    } catch (error) {
      console.error('提交答案失败:', error);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (todayAnswered) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4">今日免费题已完成</h2>
          <p className="text-gray-600 mb-6">
            您已完成今日5道免费题，明天零点后可继续刷题
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              想要继续刷更多题目？
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1">
              前往"专项练习"畅快刷题
            </p>
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
            去专项练习
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">今日练习完成！</h2>
          <p className="text-gray-600 mb-6">
            明天零点后继续来刷题吧
          </p>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
            去专项练习
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return <div className="p-6 text-center">加载失败</div>;
  }

  const isCorrect = userAnswers[currentQuestion.id] === currentQuestion.answer;
  const hasAnswered = userAnswers[currentQuestion.id] !== undefined;

  return (
    <div className="px-4">
      {/* 进度条 */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            第 {currentIndex + 1}/{questions.length} 题
          </span>
          <span className="text-sm text-gray-500">
            今日已答 {todayCount}/5 题
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-medium mb-6 leading-relaxed">
          {currentQuestion.question_text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const optionLabel = ['A', 'B', 'C', 'D'][index];
            const isSelected = userAnswers[currentQuestion.id] === option;
            const isCorrectAnswer = option === currentQuestion.answer;

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

        {/* 答案解析 */}
        {hasAnswered && (
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
        <div className="mt-6 flex space-x-3">
          {hasAnswered ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              {currentIndex < questions.length - 1 ? '下一题' : '完成'}
            </button>
          ) : (
            <button
              onClick={handleCheckAnswer}
              disabled={!userAnswers[currentQuestion.id]}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              提交答案
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
