const mammoth = require('mammoth');

async function parseWordDocument(filePath) {
  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;
    const text = html.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\n+/g, '\n');
    
    // 检测文档格式
    const isInterleaved = detectFormat(text);
    
    console.log(`  文档格式: ${isInterleaved ? '交错格式（题目后紧跟答案）' : '分开格式（题目和答案分开）'}`);
    
    if (isInterleaved) {
      return parseInterleavedQuestions(text);
    } else {
      return parseSeparatedQuestions(text);
    }
  } catch (error) {
    throw new Error('文档解析失败');
  }
}

function detectFormat(text) {
  // 检测是否有交错格式：在题目编号后5行内找到"参考答案"
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const questionMatch = lines[i].match(/^(\d+)[.、]/);
    if (questionMatch) {
      // 检查接下来10行内是否有"参考答案"
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('参考答案')) {
          return true;
        }
      }
      // 找到第一个题目后，检查后续，如果连续多个题目后没有"参考答案"，则认为是分开格式
      let questionCount = 0;
      for (let k = i; k < lines.length; k++) {
        if (lines[k].match(/^(\d+)[.、]/)) {
          questionCount++;
          if (questionCount > 3) break;
        } else if (lines[k].includes('参考答案')) {
          return true;
        }
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
    
    // 检测题型切换
    if (line.includes('单项选择')) { currentType = 'single_choice'; continue; }
    if (line.includes('判断题')) { currentType = 'judge'; continue; }
    if (line.includes('综合探究')) { currentType = 'essay'; continue; }
    
    // 检测新题目
    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      // 保存上一题
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
    
    // 处理选项
    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[2]);
        continue;
      }
    }
    
    // 处理答案
    if (line.includes('参考答案')) {
      const answerMatch = line.match(/参考答案[:：]\s*(.+)/);
      if (answerMatch) {
        let answer = answerMatch[1].trim();
        // 提取答案字母或判断词
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
    
    // 处理解析
    if (line.includes('解析')) {
      const explanationMatch = line.match(/解析[:：]\s*(.+)/);
      if (explanationMatch) {
        currentQuestion.explanation = explanationMatch[1].trim();
      }
      continue;
    }
  }
  
  // 保存最后一题
  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }
  
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

    if (line && hasCurrentAnswer && !line.match(/^\d+[.、]/)) {
      currentAnswer += '\n' + line;
    }
  }

  if (hasCurrentAnswer && currentAnswer) { answers.set(`${currentType}_${currentIndex}`, parseAnswerLine(currentAnswer, currentType)); }
  return answers;
}

function parseAnswerLine(line, type) {
  const match = line.match(/^(\d+)[.、]\s*(.+)/);
  if (!match) return { answer: '', explanation: '' };
  let content = match[2].trim();
  content = content.replace(/^参考答案[:：]\s*/, '').trim();

  if (type === 'single_choice') {
    const answerMatch = content.match(/^([ABCD])([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1];
      const explanation = answerMatch[2].trim().replace(/^【/, '').replace(/】$/, '').trim();
      return { answer, explanation };
    }
  } else if (type === 'judge') {
    const answerMatch = content.match(/^(正确|错误)([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1];
      const explanation = answerMatch[2].trim().replace(/^【/, '').replace(/】$/, '').trim();
      return { answer, explanation };
    }
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

async function testFile(filePath, subjectName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试文件: ${subjectName}`);
  console.log(`路径: ${filePath}`);
  console.log('='.repeat(60));
  try {
    const questions = await parseWordDocument(filePath);
    console.log(`\n✓ 解析成功！`);
    console.log(`  总题数: ${questions.length}`);
    const typeStats = {};
    const answerStats = { withAnswer: 0, withoutAnswer: 0 };
    questions.forEach((q, idx) => {
      typeStats[q.type] = (typeStats[q.type] || 0) + 1;
      if (q.answer) answerStats.withAnswer++; else answerStats.withoutAnswer++;
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
    Object.entries(typeStats).forEach(([type, count]) => console.log(`  ${type}: ${count}道`));
    console.log(`\n答案匹配情况:`);
    console.log(`  有答案: ${answerStats.withAnswer}道`);
    console.log(`  无答案: ${answerStats.withoutAnswer}道`);
    return { success: true, total: questions.length, typeStats, answerStats, questions };
  } catch (error) {
    console.log(`\n✗ 解析失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

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
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('测试总结');
  console.log('='.repeat(60));
  let totalQuestions = 0, totalSuccess = 0;
  Object.entries(results).forEach(([name, result]) => {
    if (result.success) { totalQuestions += result.total; totalSuccess++; console.log(`✓ ${name}: ${result.total}道题`); }
    else { console.log(`✗ ${name}: 解析失败 - ${result.error}`); }
  });
  console.log(`\n总计:`);
  console.log(`  成功: ${totalSuccess}/5`);
  console.log(`  总题数: ${totalQuestions}道`);
  return results;
}

testAllFiles();
