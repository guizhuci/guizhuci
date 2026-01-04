const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

// 复制解析逻辑
async function parseWordDocument(filePath) {
  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;

    const text = html
      .replace(/<[^>]*>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n+/g, '\n');

    return parseQuestionsText(text);
  } catch (error) {
    console.error('解析Word文档失败:', error);
    throw new Error('文档解析失败，请检查文件格式');
  }
}

function parseQuestionsText(text) {
  const questions = [];

  const referenceIndex = text.indexOf('参考答案');

  if (referenceIndex === -1) {
    console.log('文档中未找到"参考答案"，尝试使用简单解析模式');
    return parseSimpleQuestions(text);
  }

  const questionsPart = text.substring(0, referenceIndex);
  const answersPart = text.substring(referenceIndex + 4);

  const parsedQuestions = parseQuestionsSection(questionsPart);
  const parsedAnswers = parseAnswersSection(answersPart);

  let currentType = 'single_choice';
  let typeStartIndex = 0;

  parsedQuestions.forEach((q) => {
    if (q.type !== currentType) {
      currentType = q.type;
      typeStartIndex = 0;
    }

    const answer = parsedAnswers.get(`${currentType}_${q.index - typeStartIndex}`);
    if (answer) {
      q.answer = answer.answer;
      q.explanation = answer.explanation;
    }
    questions.push(q);
  });

  return questions;
}

function parseQuestionsSection(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion = null;
  let currentType = 'single_choice';
  let currentIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('单项选择')) {
      currentType = 'single_choice';
      currentIndex = 1;
      continue;
    }

    if (line.includes('判断题')) {
      currentType = 'judge';
      currentIndex = 1;
      continue;
    }

    if (line.includes('综合探究')) {
      currentType = 'essay';
      currentIndex = 1;
      continue;
    }

    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.question) {
        currentQuestion.index = currentIndex - 1;
        questions.push(currentQuestion);
      }

      currentQuestion = {
        question: questionMatch[2],
        options: [],
        answer: '',
        explanation: '',
        type: currentType,
        index: currentIndex - 1
      };
      currentIndex++;
      continue;
    }

    if (!currentQuestion) continue;

    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[2]);
        continue;
      }
    }
  }

  if (currentQuestion && currentQuestion.question) {
    currentQuestion.index = currentIndex - 1;
    questions.push(currentQuestion);
  }

  return questions;
}

function parseAnswersSection(text) {
  const answers = new Map();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentType = 'single_choice';
  let currentIndex = 1;
  let currentAnswer = '';
  let hasCurrentAnswer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('单项选择')) {
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'single_choice';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    if (line.includes('判断题')) {
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'judge';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    if (line.includes('综合探究')) {
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'essay';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    const questionNumberMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionNumberMatch) {
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentIndex = parseInt(questionNumberMatch[1]);
      currentAnswer = line;
      hasCurrentAnswer = true;
      continue;
    }

    if (line && hasCurrentAnswer && !line.match(/^\d+[.、]/)) {
      currentAnswer += '\n' + line;
    }
  }

  if (hasCurrentAnswer && currentAnswer) {
    const answerData = parseAnswerLine(currentAnswer, currentType);
    answers.set(`${currentType}_${currentIndex}`, answerData);
  }

  return answers;
}

function parseAnswerLine(line, type) {
  const match = line.match(/^(\d+)[.、]\s*(.+)/);
  if (!match) {
    return { answer: '', explanation: '' };
  }

  const content = match[2].trim();

  if (type === 'single_choice') {
    const answerMatch = content.match(/^([ABCD])([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1];
      const explanation = answerMatch[2].trim().replace(/^【\s*/, '').replace(/】\s*$/, '').trim();
      return { answer, explanation };
    }
  } else if (type === 'judge') {
    const answerMatch = content.match(/^(正确|错误)([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1];
      const explanation = answerMatch[2].trim().replace(/^【\s*/, '').replace(/】\s*$/, '').trim();
      return { answer, explanation };
    }
  } else if (type === 'essay') {
    const answerMatch = content.match(/^答[:：]\s*([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1].trim();
      return { answer, explanation: '' };
    }
  }

  return { answer: content, explanation: '' };
}

function parseSimpleQuestions(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion = null;
  let currentType = 'single_choice';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('单项选择')) {
      currentType = 'single_choice';
      continue;
    }

    if (line.includes('判断题')) {
      currentType = 'judge';
      continue;
    }

    if (line.includes('综合探究')) {
      currentType = 'essay';
      continue;
    }

    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }

      currentQuestion = {
        question: questionMatch[2],
        options: [],
        answer: '',
        explanation: '',
        type: currentType
      };
      continue;
    }

    if (!currentQuestion) continue;

    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[2]);
        continue;
      }
    }
  }

  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }

  return questions;
}

// 主函数
async function testFile(filePath, subjectName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试文件: ${subjectName}`);
  console.log(`路径: ${filePath}`);
  console.log('='.repeat(60));

  try {
    const questions = await parseWordDocument(filePath);

    console.log(`\n✓ 解析成功！`);
    console.log(`  总题数: ${questions.length}`);

    // 按题型统计
    const typeStats = {};
    const answerStats = { withAnswer: 0, withoutAnswer: 0 };

    questions.forEach((q, idx) => {
      typeStats[q.type] = (typeStats[q.type] || 0) + 1;
      if (q.answer) {
        answerStats.withAnswer++;
      } else {
        answerStats.withoutAnswer++;
      }

      // 显示前3道题的详细信息
      if (idx < 3) {
        console.log(`\n第${idx + 1}题:`);
        console.log(`  类型: ${q.type}`);
        console.log(`  问题: ${q.question.substring(0, 50)}...`);
        console.log(`  选项: ${q.options.length > 0 ? q.options.join(', ') : '无'}`);
        console.log(`  答案: ${q.answer || '未匹配'}`);
        console.log(`  解析: ${q.explanation ? q.explanation.substring(0, 30) + '...' : '无'}`);
      }
    });

    console.log(`\n题型统计:`);
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}道`);
    });

    console.log(`\n答案匹配情况:`);
    console.log(`  有答案: ${answerStats.withAnswer}道`);
    console.log(`  无答案: ${answerStats.withoutAnswer}道`);

    return {
      success: true,
      total: questions.length,
      typeStats,
      answerStats,
      questions
    };
  } catch (error) {
    console.log(`\n✗ 解析失败: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// 测试所有文件
async function testAllFiles() {
  const files = [
    { path: '/workspace/projects/assets/信息技术_test.docx', name: '信息技术' },
    { path: '/workspace/projects/assets/通用技术_test.docx', name: '通用技术' },
    { path: '/workspace/projects/assets/美术_test.docx', name: '美术' },
    { path: '/workspace/projects/assets/音乐_test.docx', name: '音乐' },
    { path: '/workspace/projects/assets/综合实践_test.docx', name: '综合实践' },
  ];

  const results = {};

  for (const file of files) {
    const result = await testFile(file.path, file.name);
    results[file.name] = result;
  }

  // 总结
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('测试总结');
  console.log('='.repeat(60));

  let totalQuestions = 0;
  let totalSuccess = 0;

  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      totalQuestions += result.total;
      totalSuccess++;
      console.log(`✓ ${name}: ${result.total}道题`);
    } else {
      console.log(`✗ ${name}: 解析失败 - ${result.error}`);
    }
  });

  console.log(`\n总计:`);
  console.log(`  成功: ${totalSuccess}/5`);
  console.log(`  总题数: ${totalQuestions}道`);

  return results;
}

testAllFiles();
