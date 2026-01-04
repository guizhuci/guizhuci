const mammoth = require('mammoth');

async function parseWordFile() {
  try {
    const filePath = '/workspace/projects/assets/信息技术.docx';

    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;

    const text = html
      .replace(/<[^>]*>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n+/g, '\n');

    const questions = parseQuestionsText(text);

    console.log(`\n共解析到 ${questions.length} 道题目\n`);

    console.log('========== 所有题目预览 ==========\n');
    questions.forEach((q, index) => {
      console.log(`题目 ${index + 1} [${q.type}, index=${q.index}]:`);
      console.log(`  内容: ${q.question.substring(0, 60)}...`);
      console.log(`  选项: ${q.options.join(', ')}`);
      console.log(`  答案: ${q.answer || '未匹配'}`);
      console.log(`  解析: ${q.explanation.substring(0, 60)}...`);
      console.log('');
    });

    console.log('\n========== 统计信息 ==========');
    console.log('总题数:', questions.length);
    console.log('已匹配答案题数:', questions.filter(q => q.answer).length);
    console.log('已匹配解析题数:', questions.filter(q => q.explanation).length);

  } catch (error) {
    console.error('解析失败:', error);
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
        index: currentIndex - 1  // 修复：使用 currentIndex - 1
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

    if (currentType === 'judge') {
      const optionMatch = line.match(/^[ABCD][.、]\s*(正确|错误)/);
      if (optionMatch) {
        currentQuestion.options = ['正确', '错误'];
        continue;
      }
    }

    if (currentType === 'essay') {
      const subQuestionMatch = line.match(/^(\([0-9]+\))\s*(.+)/);
      if (subQuestionMatch) {
        currentQuestion.question += '\n' + subQuestionMatch[2];
      }
    }
  }

  if (currentQuestion && currentQuestion.question) {
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
    answers.set(`${currentType}_${currentIndex - 1}`, answerData);
  }

  return answers;
}

function parseAnswerLine(text, type) {
  let answer = '';
  let explanation = '';

  const answerMatch = text.match(/[：:]\s*([ABCD]+)/);
  if (answerMatch) {
    answer = answerMatch[1];
  } else if (type === 'judge') {
    const answerMatch = text.match(/[：:]\s*([ABCD]+)/);
    if (answerMatch) {
      answer = answerMatch[1] === 'A' ? 'A' : 'B';
    }
  } else if (type === 'essay') {
    const answerMatch = text.match(/[：:]\s*/);
    if (answerMatch) {
      const parts = text.split(/解析[：:]/);
      answer = parts[0].substring(answerMatch[0].length).trim();
      if (parts.length > 1) {
        explanation = parts[1].trim();
      }
    }
  }

  if (!explanation) {
    const explanationMatch = text.match(/解析[：:]\s*(.+)/);
    if (explanationMatch) {
      explanation = explanationMatch[1];
    } else {
      const parts = text.split(/解析[：:]/);
      if (parts.length > 1) {
        explanation = parts[1].trim();
      }
    }
  }

  return { answer, explanation };
}

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

parseWordFile();
