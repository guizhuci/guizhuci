const mammoth = require('mammoth');

async function debugFinal() {
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

    const referenceIndex = text.indexOf('参考答案');
    const answersPart = text.substring(referenceIndex + 4);
    const lines = answersPart.split('\n').map(line => line.trim()).filter(line => line);

    let currentType = 'single_choice';
    let currentIndex = 1;
    let currentAnswer = '';
    let hasCurrentAnswer = false;
    const answers = new Map();

    console.log('开始解析答案部分...\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('单项选择')) {
        console.log(`[题型切换] 单项选择题`);
        if (hasCurrentAnswer && currentAnswer) {
          const answerData = parseAnswerLine(currentAnswer, currentType);
          answers.set(`${currentType}_${currentIndex - 1}`, answerData);
          console.log(`  保存答案: ${currentType}_${currentIndex - 1} = ${answerData.answer}`);
        }
        currentType = 'single_choice';
        currentIndex = 1;
        currentAnswer = '';
        hasCurrentAnswer = false;
        continue;
      }

      if (line.includes('判断题')) {
        console.log(`\n[题型切换] 判断题`);
        if (hasCurrentAnswer && currentAnswer) {
          const answerData = parseAnswerLine(currentAnswer, currentType);
          answers.set(`${currentType}_${currentIndex - 1}`, answerData);
          console.log(`  保存答案: ${currentType}_${currentIndex - 1} = ${answerData.answer}`);
        }
        currentType = 'judge';
        currentIndex = 1;
        currentAnswer = '';
        hasCurrentAnswer = false;
        continue;
      }

      if (line.includes('综合探究')) {
        console.log(`\n[题型切换] 综合探究题`);
        if (hasCurrentAnswer && currentAnswer) {
          const answerData = parseAnswerLine(currentAnswer, currentType);
          answers.set(`${currentType}_${currentIndex - 1}`, answerData);
          console.log(`  保存答案: ${currentType}_${currentIndex - 1} = ${answerData.answer}`);
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
          console.log(`  保存答案: ${currentType}_${currentIndex - 1} = ${answerData.answer}`);
        }

        currentIndex = parseInt(questionNumberMatch[1]);
        currentAnswer = line;
        hasCurrentAnswer = true;
        console.log(`\n[新题目] ${currentType}_${currentIndex}: ${line.substring(0, 50)}...`);
        continue;
      }

      if (line && hasCurrentAnswer && !line.match(/^\d+[.、]/)) {
        currentAnswer += '\n' + line;
      }
    }

    console.log(`\n[结束循环]`);
    if (hasCurrentAnswer && currentAnswer) {
      const answerData = parseAnswerLine(currentAnswer, currentType);
      answers.set(`${currentType}_${currentIndex}`, answerData);
      console.log(`  保存最后一题答案: ${currentType}_${currentIndex} = ${answerData.answer}`);
    }

    console.log(`\n\n所有保存的答案 (${answers.size}个):`);
    answers.forEach((value, key) => {
      console.log(`  ${key}: ${value.answer}`);
    });

  } catch (error) {
    console.error('调试失败:', error);
  }
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

debugFinal();
