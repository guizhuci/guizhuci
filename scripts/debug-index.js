const mammoth = require('mammoth');

async function debugIndex() {
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

    let currentType = 'single_choice';
    let currentIndex = 1;

    console.log('=== 追踪currentIndex变化 ===\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('单项选择')) {
        console.log(`[题型] 单项选择题, currentIndex=${currentIndex}`);
        currentType = 'single_choice';
        currentIndex = 1;
        continue;
      }

      if (line.includes('判断题')) {
        console.log(`[题型] 判断题, currentIndex=${currentIndex}`);
        currentType = 'judge';
        currentIndex = 1;
        continue;
      }

      if (line.includes('综合探究')) {
        console.log(`[题型] 综合探究题, currentIndex=${currentIndex}`);
        currentType = 'essay';
        currentIndex = 1;
        continue;
      }

      const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
      if (questionMatch) {
        const index = currentIndex - 1;
        console.log(`[题目] ${currentType} lineNum=${questionMatch[1]} currentIndex=${currentIndex} index=${index} content=${questionMatch[2].substring(0, 30)}...`);
        currentIndex++;
        continue;
      }
    }

    console.log(`\n最终: currentIndex=${currentIndex}`);

  } catch (error) {
    console.error('调试失败:', error);
  }
}

debugIndex();
