const mammoth = require('mammoth');

async function debugEssayQuestion() {
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
    const questionsPart = text.substring(0, referenceIndex);
    const lines = questionsPart.split('\n').map(line => line.trim()).filter(line => line);

    console.log('题目部分最后20行:\n');
    lines.slice(-20).forEach((line, i) => {
      console.log(`${lines.length - 20 + i + 1}: ${line}`);
    });

    console.log('\n\n模拟解析综合探究题:\n');
    
    let currentQuestion = null;
    let currentType = 'judge';
    let currentIndex = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('判断题')) {
        currentType = 'judge';
        currentIndex = 1;
        console.log(`[切换题型] 判断题, currentIndex=${currentIndex}`);
        continue;
      }

      if (line.includes('综合探究')) {
        currentType = 'essay';
        currentIndex = 1;
        console.log(`\n[切换题型] 综合探究题, currentIndex=${currentIndex}`);
        continue;
      }

      const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
      if (questionMatch) {
        if (currentQuestion && currentQuestion.question) {
          currentQuestion.index = currentIndex - 1;
          console.log(`[保存上一题] index=${currentQuestion.index}`);
        }

        const newIndex = currentIndex - 1;
        currentQuestion = {
          question: questionMatch[2].substring(0, 50),
          type: currentType,
          index: newIndex
        };
        console.log(`[新题目] type=${currentType}, lineNum=${questionMatch[1]}, newIndex=${newIndex}, content=${questionMatch[2].substring(0, 40)}...`);
        currentIndex++;
        continue;
      }

      if (currentType === 'essay' && line.match(/^(\([0-9]+\))/)) {
        if (currentQuestion) {
          currentQuestion.question += ' ' + line.substring(0, 20);
        }
      }
    }

    if (currentQuestion) {
      const finalIndex = currentIndex - 1;
      currentQuestion.index = finalIndex;
      console.log(`\n[保存最后一题] index=${finalIndex}`);
    }

  } catch (error) {
    console.error('调试失败:', error);
  }
}

debugEssayQuestion();
