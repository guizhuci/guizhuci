const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// 改进的解析逻辑
function parseQuestionsText(text) {
  const questions = [];

  // 先按"参考答案"分割
  const mainParts = text.split(/参考答案/);

  if (mainParts.length < 2) {
    console.log('文档格式不匹配，尝试使用简单解析模式');
    return parseSimpleQuestions(text);
  }

  const questionsPart = mainParts[0];
  const answersPart = mainParts[1];

  console.log('题目部分长度:', questionsPart.length);
  console.log('答案部分长度:', answersPart.length);

  // 解析题目部分
  const parsedQuestions = parseQuestionsSection(questionsPart);
  console.log('解析到题目数量:', parsedQuestions.length);

  // 解析答案部分
  const parsedAnswers = parseAnswersSection(answersPart);
  console.log('解析到答案数量:', parsedAnswers.size);

  // 按题型匹配答案
  let currentType = 'single_choice';
  let typeStartIndex = 0;

  parsedQuestions.forEach((q) => {
    // 检测题型变化
    if (q.type !== currentType) {
      currentType = q.type;
      typeStartIndex = q.index - 1; // 重新计数
    }

    // 在对应的题型答案中查找
    const answer = parsedAnswers.get(`${currentType}_${q.index - typeStartIndex}`);
    if (answer) {
      q.answer = answer.answer;
      q.explanation = answer.explanation;
    }
    questions.push(q);
  });

  return questions;
}

// 解析题目部分
function parseQuestionsSection(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion = null;
  let currentType = 'single_choice';
  let currentIndex = 1;

  console.log('\n解析题目部分，前20行:');
  lines.slice(0, 20).forEach((line, i) => {
    console.log(`  ${i + 1}: ${line.substring(0, 60)}...`);
  });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测题型变化
    if (line.includes('单项选择')) {
      currentType = 'single_choice';
      currentIndex = 1;
      console.log(`\n题型切换为: ${currentType}`);
      continue;
    }

    if (line.includes('判断题')) {
      currentType = 'judge';
      currentIndex = 1;
      console.log(`\n题型切换为: ${currentType}`);
      continue;
    }

    if (line.includes('综合探究')) {
      currentType = 'essay';
      currentIndex = 1;
      console.log(`\n题型切换为: ${currentType}`);
      continue;
    }

    // 检测题目开始
    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      // 保存上一题
      if (currentQuestion && currentQuestion.question) {
        currentQuestion.index = currentIndex - 1;
        questions.push(currentQuestion);
      }

      // 开始新题目
      currentQuestion = {
        question: questionMatch[2],
        options: [],
        answer: '',
        explanation: '',
        type: currentType,
        index: currentIndex
      };
      currentIndex++;
      continue;
    }

    if (!currentQuestion) continue;

    // 检测选项
    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[2]);
        continue;
      }
    }

    // 判断题选项
    if (currentType === 'judge') {
      const optionMatch = line.match(/^[ABCD][.、]\s*(正确|错误)/);
      if (optionMatch) {
        currentQuestion.options = ['正确', '错误'];
        continue;
      }
    }

    // 综合探究题的小题
    if (currentType === 'essay') {
      const subQuestionMatch = line.match(/^(\([0-9]+\))\s*(.+)/);
      if (subQuestionMatch) {
        currentQuestion.question += '\n' + subQuestionMatch[2];
      }
    }
  }

  // 保存最后一题
  if (currentQuestion && currentQuestion.question) {
    currentQuestion.index = currentIndex - 1;
    questions.push(currentQuestion);
  }

  return questions;
}

// 解析答案部分
function parseAnswersSection(text) {
  const answers = new Map();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentType = 'single_choice';
  let currentIndex = 1;
  let currentAnswer = '';

  console.log('\n解析答案部分，所有行:');
  lines.forEach((line, i) => {
    console.log(`  ${i + 1}: ${line}`);
  });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测题型变化
    if (line.includes('单项选择')) {
      currentType = 'single_choice';
      currentIndex = 1;
      console.log(`\n题型切换为: ${currentType}`);
      continue;
    }

    if (line.includes('判断题')) {
      currentType = 'judge';
      currentIndex = 1;
      console.log(`\n题型切换为: ${currentType}`);
      continue;
    }

    if (line.includes('综合探究')) {
      currentType = 'essay';
      currentIndex = 1;
      console.log(`\n题型切换为: ${currentType}`);
      continue;
    }

    // 检测题号
    const questionNumberMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionNumberMatch) {
      // 保存上一题答案
      if (currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
        console.log(`保存答案: ${currentType}_${currentIndex - 1} = ${answerData.answer}`);
      }

      // 开始新答案
      currentIndex = parseInt(questionNumberMatch[1]);
      currentAnswer = line;
      continue;
    }

    // 继续同一题的答案内容
    if (line && !line.match(/^\d+[.、]/)) {
      if (currentAnswer) {
        currentAnswer += '\n' + line;
      }
    }
  }

  // 保存最后一题答案
  if (currentAnswer) {
    const answerData = parseAnswerLine(currentAnswer, currentType);
    answers.set(`${currentType}_${currentIndex}`, answerData);
    console.log(`保存最后一题答案: ${currentType}_${currentIndex} = ${answerData.answer}`);
  }

  return answers;
}

// 解析单行答案
function parseAnswerLine(text, type) {
  let answer = '';
  let explanation = '';

  console.log(`  解析答案行: ${text.substring(0, 50)}...`);

  // 提取答案
  const answerMatch = text.match(/[：:]\s*([ABCD]+)/);
  if (answerMatch) {
    answer = answerMatch[1];
  } else if (type === 'judge') {
    const answerMatch = text.match(/[：:]\s*([ABCD]+)/);
    if (answerMatch) {
      answer = answerMatch[1] === 'A' ? 'A' : 'B';
    }
  }

  // 提取解析
  const explanationMatch = text.match(/解析[：:]\s*(.+)/);
  if (explanationMatch) {
    explanation = explanationMatch[1];
  } else {
    const parts = text.split(/解析[：:]/);
    if (parts.length > 1) {
      explanation = parts[1].trim();
    }
  }

  return { answer, explanation };
}

// 简单解析模式
function parseSimpleQuestions(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion = null;
  let inAnswerSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch && !inAnswerSection) {
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }

      currentQuestion = {
        question: questionMatch[2],
        options: [],
        answer: '',
        explanation: '',
        type: 'single_choice'
      };
      continue;
    }

    if (!currentQuestion) continue;

    const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
    if (optionMatch && !inAnswerSection) {
      currentQuestion.options.push(optionMatch[2]);
      continue;
    }

    if (line.startsWith('答案') || line.startsWith('【答案】')) {
      const answerMatch = line.match(/答案[：:]\s*([ABCD]+)/);
      if (answerMatch) {
        currentQuestion.answer = answerMatch[1];
        inAnswerSection = true;
      }
      continue;
    }

    if (line.startsWith('解析') || line.startsWith('【解析】')) {
      const explanationMatch = line.match(/解析[：:]\s*(.+)/);
      if (explanationMatch) {
        currentQuestion.explanation = explanationMatch[1];
      }
      continue;
    }
  }

  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }

  return questions;
}

async function parseWordFile() {
  try {
    const filePath = path.join(__dirname, '../assets/信息技术.docx');

    console.log('正在读取Word文档...\n');

    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    const questions = parseQuestionsText(text);

    console.log(`\n共解析到 ${questions.length} 道题目\n`);

    // 显示所有题目
    console.log('========== 所有题目预览 ==========\n');
    questions.forEach((q, index) => {
      console.log(`题目 ${index + 1} [${q.type}]:`);
      console.log(`  内容: ${q.question.substring(0, 60)}...`);
      console.log(`  选项: ${q.options.join(', ')}`);
      console.log(`  答案: ${q.answer || '未匹配'}`);
      console.log(`  解析: ${q.explanation.substring(0, 60)}...`);
      console.log('');
    });

  } catch (error) {
    console.error('解析失败:', error);
  }
}

parseWordFile();
