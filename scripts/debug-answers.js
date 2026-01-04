const mammoth = require('mammoth');

async function debugAnswers() {
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

    console.log('答案部分所有行:\n');
    lines.forEach((line, i) => {
      console.log(`${i + 1}: ${line}`);
    });

    console.log('\n\n模拟答案解析过程:\n');
    let currentType = 'single_choice';
    let currentIndex = 1;
    let currentAnswer = '';
    let hasCurrentAnswer = false;
    const answers = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('单项选择')) {
        currentType = 'single_choice';
        currentIndex = 1;
        console.log(`\n[切换题型] ${currentType}, currentIndex重置为1`);
        continue;
      }

      if (line.includes('判断题')) {
        currentType = 'judge';
        currentIndex = 1;
        console.log(`\n[切换题型] ${currentType}, currentIndex重置为1`);
        continue;
      }

      if (line.includes('综合探究')) {
        currentType = 'essay';
        currentIndex = 1;
        console.log(`\n[切换题型] ${currentType}, currentIndex重置为1`);
        continue;
      }

      const questionNumberMatch = line.match(/^(\d+)[.、]\s*(.+)/);
      if (questionNumberMatch) {
        if (hasCurrentAnswer && currentAnswer) {
          const answerData = parseAnswerLine(currentAnswer, currentType);
          answers.set(`${currentType}_${currentIndex - 1}`, answerData);
          console.log(`[保存答案] ${currentType}_${currentIndex - 1} = ${answerData.answer}`);
        }

        currentIndex = parseInt(questionNumberMatch[1]);
        currentAnswer = line;
        hasCurrentAnswer = true;
        console.log(`\n[新题目] ${currentType}_${currentIndex}: ${line.substring(0, 30)}...`);
        continue;
      }

      if (line && hasCurrentAnswer && !line.match(/^\d+[.、]/)) {
        currentAnswer += '\n' + line;
      }
    }

    if (hasCurrentAnswer && currentAnswer) {
      const answerData = parseAnswerLine(currentAnswer, currentType);
      answers.set(`${currentType}_${currentIndex}`, answerData);
      console.log(`[保存最后一题] ${currentType}_${currentIndex} = ${answerData.answer}`);
    }

    console.log('\n\n所有答案:');
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

debugAnswers();
