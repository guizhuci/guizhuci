const mammoth = require('mammoth');
const { Pool } = require('pg');

// 数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 解析函数（从API复制）
async function parseWordDocument(filePath) {
  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;
    const text = html.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\n+/g, '\n');
    const isInterleaved = detectFormat(text);
    return isInterleaved ? parseInterleavedQuestions(text) : parseSeparatedQuestions(text);
  } catch (error) {
    throw new Error('文档解析失败');
  }
}

function detectFormat(text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const questionMatch = lines[i].match(/^(\d+)[.、]/);
    if (questionMatch) {
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('参考答案')) return true;
      }
      let questionCount = 0;
      for (let k = i; k < lines.length; k++) {
        if (lines[k].match(/^(\d+)[.、]/)) {
          questionCount++;
          if (questionCount > 3) break;
        } else if (lines[k].includes('参考答案')) return true;
      }
      if (questionCount > 3) return false;
    }
  }
  return false;
}

function parseInterleavedQuestions(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  let currentQuestion = null;
  let currentType = 'single_choice';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('单项选择')) { currentType = 'single_choice'; continue; }
    if (line.includes('判断题')) { currentType = 'judge'; continue; }
    if (line.includes('综合探究')) { currentType = 'essay'; continue; }
    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.question) questions.push(currentQuestion);
      currentQuestion = { question: questionMatch[2], options: [], answer: '', explanation: '', type: currentType };
      continue;
    }
    if (!currentQuestion) continue;
    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) { currentQuestion.options.push(optionMatch[2]); continue; }
    }
    if (line.includes('参考答案')) {
      const answerMatch = line.match(/参考答案[:：]\s*(.+)/);
      if (answerMatch) {
        let answer = answerMatch[1].trim();
        if (currentType === 'single_choice') {
          const letterMatch = answer.match(/^([ABCD])/);
          if (letterMatch) currentQuestion.answer = letterMatch[1];
        } else if (currentType === 'judge') {
          const judgeMatch = answer.match(/^(正确|错误)/);
          if (judgeMatch) currentQuestion.answer = judgeMatch[1];
        } else {
          currentQuestion.answer = answer;
        }
      }
      continue;
    }
    if (line.includes('解析')) {
      const explanationMatch = line.match(/解析[:：]\s*(.+)/);
      if (explanationMatch) currentQuestion.explanation = explanationMatch[1].trim();
    }
  }
  if (currentQuestion && currentQuestion.question) questions.push(currentQuestion);
  return questions;
}

function parseSeparatedQuestions(text) {
  const questions = [];
  const referenceIndex = text.indexOf('参考答案');
  if (referenceIndex === -1) return parseSimpleQuestions(text);
  const questionsPart = text.substring(0, referenceIndex);
  const answersPart = text.substring(referenceIndex + 4);
  const parsedQuestions = parseQuestionsSection(questionsPart);
  const parsedAnswers = parseAnswersSection(answersPart);
  let currentType = 'single_choice';
  let typeStartIndex = 0;
  parsedQuestions.forEach((q) => {
    if (q.type !== currentType) { currentType = q.type; typeStartIndex = 0; }
    const answer = parsedAnswers.get(`${currentType}_${q.index - typeStartIndex}`);
    if (answer) { q.answer = answer.answer; q.explanation = answer.explanation; }
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
    if (line.includes('单项选择')) { currentType = 'single_choice'; currentIndex = 1; continue; }
    if (line.includes('判断题')) { currentType = 'judge'; currentIndex = 1; continue; }
    if (line.includes('综合探究')) { currentType = 'essay'; currentIndex = 1; continue; }
    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.question) { currentQuestion.index = currentIndex - 1; questions.push(currentQuestion); }
      currentQuestion = { question: questionMatch[2], options: [], answer: '', explanation: '', type: currentType, index: currentIndex - 1 };
      currentIndex++;
      continue;
    }
    if (!currentQuestion) continue;
    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) { currentQuestion.options.push(optionMatch[2]); continue; }
    }
  }
  if (currentQuestion && currentQuestion.question) { currentQuestion.index = currentIndex - 1; questions.push(currentQuestion); }
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
      if (hasCurrentAnswer && currentAnswer) { answers.set(`${currentType}_${currentIndex - 1}`, parseAnswerLine(currentAnswer, currentType)); }
      currentType = 'single_choice'; currentIndex = 1; currentAnswer = ''; hasCurrentAnswer = false; continue;
    }
    if (line.includes('判断题')) {
      if (hasCurrentAnswer && currentAnswer) { answers.set(`${currentType}_${currentIndex - 1}`, parseAnswerLine(currentAnswer, currentType)); }
      currentType = 'judge'; currentIndex = 1; currentAnswer = ''; hasCurrentAnswer = false; continue;
    }
    if (line.includes('综合探究')) {
      if (hasCurrentAnswer && currentAnswer) { answers.set(`${currentType}_${currentIndex - 1}`, parseAnswerLine(currentAnswer, currentType)); }
      currentType = 'essay'; currentIndex = 1; currentAnswer = ''; hasCurrentAnswer = false; continue;
    }
    const questionNumberMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionNumberMatch) {
      if (hasCurrentAnswer && currentAnswer) { answers.set(`${currentType}_${currentIndex - 1}`, parseAnswerLine(currentAnswer, currentType)); }
      currentIndex = parseInt(questionNumberMatch[1]);
      currentAnswer = line;
      hasCurrentAnswer = true;
      continue;
    }
    if (line && hasCurrentAnswer && !line.match(/^\d+[.、]/)) { currentAnswer += '\n' + line; }
  }
  if (hasCurrentAnswer && currentAnswer) { answers.set(`${currentType}_${currentIndex}`, parseAnswerLine(currentAnswer, currentType)); }
  return answers;
}

function parseAnswerLine(line, type) {
  const match = line.match(/^(\d+)[.、]\s*(.+)/);
  if (!match) return { answer: '', explanation: '' };
  let content = match[2].trim().replace(/^参考答案[:：]\s*/, '').trim();
  if (type === 'single_choice') {
    const answerMatch = content.match(/^([ABCD])([\s\S]*)/);
    if (answerMatch) return { answer: answerMatch[1], explanation: answerMatch[2].trim().replace(/^【/, '').replace(/】$/, '').trim() };
  } else if (type === 'judge') {
    const answerMatch = content.match(/^(正确|错误)([\s\S]*)/);
    if (answerMatch) return { answer: answerMatch[1], explanation: answerMatch[2].trim().replace(/^【/, '').replace(/】$/, '').trim() };
  } else if (type === 'essay') {
    const answerMatch = content.match(/^答[:：]\s*([\s\S]*)/);
    if (answerMatch) return { answer: answerMatch[1].trim(), explanation: '' };
    return { answer: content, explanation: '' };
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
    if (line.includes('单项选择')) { currentType = 'single_choice'; continue; }
    if (line.includes('判断题')) { currentType = 'judge'; continue; }
    if (line.includes('综合探究')) { currentType = 'essay'; continue; }
    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.question) { questions.push(currentQuestion); }
      currentQuestion = { question: questionMatch[2], options: [], answer: '', explanation: '', type: currentType };
      continue;
    }
    if (!currentQuestion) continue;
    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) { currentQuestion.options.push(optionMatch[2]); continue; }
    }
  }
  if (currentQuestion && currentQuestion.question) { questions.push(currentQuestion); }
  return questions;
}

// 导入函数
async function importSubject(filePath, subjectId, subjectName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`导入科目: ${subjectName}`);
  console.log(`文件: ${filePath}`);
  console.log(`科目ID: ${subjectId}`);
  console.log('='.repeat(60));

  try {
    const questions = await parseWordDocument(filePath);
    console.log(`解析成功，共${questions.length}道题`);

    let importedCount = 0;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const q of questions) {
        const result = await client.query(
          `INSERT INTO questions (subject_id, type, question_text, options, answer, explanation, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            parseInt(subjectId),
            q.type,
            q.question,
            JSON.stringify(q.options),
            q.answer,
            q.explanation || '',
            importedCount
          ]
        );
        importedCount++;
      }

      await client.query('COMMIT');
      console.log(`✓ 成功导入 ${importedCount} 道题到数据库`);

      return { success: true, imported: importedCount, total: questions.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.log(`✗ 导入失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 主函数
async function importAll() {
  const files = [
    { path: '/workspace/projects/assets/信息技术_test.docx', subjectId: 1, name: '信息技术' },
    { path: '/workspace/projects/assets/通用技术_test.docx', subjectId: 2, name: '通用技术' },
    { path: '/workspace/projects/assets/美术_test.docx', subjectId: 3, name: '美术' },
    { path: '/workspace/projects/assets/音乐_test.docx', subjectId: 4, name: '音乐' },
    { path: '/workspace/projects/assets/综合实践_test.docx', subjectId: 5, name: '综合实践' },
  ];

  const results = {};
  let totalImported = 0;

  for (const file of files) {
    const result = await importSubject(file.path, file.subjectId, file.name);
    results[file.name] = result;
    if (result.success) totalImported += result.imported;
  }

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('导入总结');
  console.log('='.repeat(60));

  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      console.log(`✓ ${name}: 导入${result.imported}道题（解析${result.total}道）`);
    } else {
      console.log(`✗ ${name}: ${result.error}`);
    }
  });

  console.log(`\n总计: 成功导入 ${totalImported} 道题`);

  await pool.end();
}

importAll();
