// 测试practice/answer API
const testAnswerAPI = async () => {
  const response = await fetch('/api/practice/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 1,
      questionId: 1,
      answer: 'D',
      mode: 'practice'
    })
  });

  const data = await response.json();
  console.log('答题API测试结果:', data);
  return data;
};

testAnswerAPI();
