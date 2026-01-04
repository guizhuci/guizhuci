'use client';

import { useState, useEffect } from 'react';

interface MistakeQuestion {
  id: number;
  question_id: number;
  question_text: string;
  options: string[];
  answer: string;
  user_answer: string;
  explanation: string;
  subject_id: number;
  exam_paper_id?: number;
}

export default function MistakePage() {
  const [tab, setTab] = useState<'practice' | 'exam'>('practice');
  const [mistakes, setMistakes] = useState<MistakeQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | 'all'>('all');
  const [selectedPaper, setSelectedPaper] = useState<number | 'all'>('all');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
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
      loadSubjects();
      loadPapers();
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      loadMistakes();
    }
  }, [mounted, tab, selectedSubject, selectedPaper]);

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/subjects?category=single_recruitment');
      const data = await response.json();
      setSubjects(data.subjects);
    } catch (error) {
      console.error('加载科目失败:', error);
    }
  };

  const loadPapers = async () => {
    try {
      const response = await fetch('/api/exam/papers');
      const data = await response.json();
      setPapers(data.papers);
    } catch (error) {
      console.error('加载模拟卷失败:', error);
    }
  };

  const loadMistakes = async () => {
    try {
      setLoading(true);
      if (!userId) return;
      const params = new URLSearchParams({
        userId,
        source: tab
      });

      if (tab === 'practice' && selectedSubject !== 'all') {
        params.append('subjectId', selectedSubject.toString());
      }

      if (tab === 'exam' && selectedPaper !== 'all') {
        params.append('paperId', selectedPaper.toString());
      }

      const response = await fetch(`/api/mistake/list?${params}`);
      const data = await response.json();
      setMistakes(data.mistakes);
      setLoading(false);
    } catch (error) {
      console.error('加载错题集失败:', error);
      setLoading(false);
    }
  };

  const handleRemoveMistake = async (mistakeId: number) => {
    try {
      await fetch('/api/mistake/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, mistakeId })
      });

      loadMistakes();
    } catch (error) {
      console.error('移除错题失败:', error);
    }
  };

  const handleViewAnswer = (questionId: number) => {
    setShowAnswer({
      ...showAnswer,
      [questionId]: true
    });
  };

  if (loading) {
    return <div className="p-6 text-center">加载中...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">错题集</h2>

      {/* Tab切换 */}
      <div className="bg-white rounded-lg p-1 flex mb-4">
        <button
          onClick={() => {
            setTab('practice');
            setSelectedSubject('all');
            setCurrentIndex(0);
            setShowAnswer({});
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            tab === 'practice'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          专项练习错题
        </button>
        <button
          onClick={() => {
            setTab('exam');
            setSelectedPaper('all');
            setCurrentIndex(0);
            setShowAnswer({});
          }}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            tab === 'exam'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          模拟卷错题
        </button>
      </div>

      {/* 筛选器 */}
      {tab === 'practice' && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-500 mb-2">筛选科目</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedSubject === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedSubject === subject.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'exam' && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-500 mb-2">筛选试卷</div>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedPaper('all')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPaper === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部试卷
            </button>
            {papers.map((paper) => (
              <button
                key={paper.id}
                onClick={() => setSelectedPaper(paper.id)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedPaper === paper.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {paper.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 错题列表 */}
      {mistakes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">✨</div>
          <p>暂无错题，继续加油！</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-2">
            共 {mistakes.length} 道错题
          </div>
          {mistakes.map((mistake) => (
            <div key={mistake.id} className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-medium mb-4 leading-relaxed">
                {mistake.question_text}
              </h3>

              <div className="space-y-2 mb-4">
                {mistake.options.map((option, index) => {
                  const optionLabel = ['A', 'B', 'C', 'D'][index];
                  const isUserAnswer = mistake.user_answer === option;
                  const isCorrectAnswer = mistake.answer === option;

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        isUserAnswer
                          ? 'border-red-500 bg-red-50'
                          : isCorrectAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mr-2 text-xs">
                          {optionLabel}
                        </span>
                        <span className="text-sm flex-1">{option}</span>
                        {isUserAnswer && !isCorrectAnswer && (
                          <span className="text-xs text-red-600 font-medium">您的答案</span>
                        )}
                        {isCorrectAnswer && (
                          <span className="text-xs text-green-600 font-medium">正确答案</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {showAnswer[mistake.question_id] && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>正确答案：</strong>{mistake.answer}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>解析：</strong>{mistake.explanation}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                {!showAnswer[mistake.question_id] ? (
                  <button
                    onClick={() => handleViewAnswer(mistake.question_id)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    查看解析
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemoveMistake(mistake.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    移除错题
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
