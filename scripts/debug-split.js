const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function debugSplit() {
  try {
    const filePath = path.join(__dirname, '../assets/信息技术.docx');

    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;

    const text = html
      .replace(/<[^>]*>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n+/g, '\n');

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    console.log('总行数:', lines.length);

    // 查找"参考答案"的位置
    const referenceIndex = lines.findIndex(line => line === '参考答案');
    console.log('\n"参考答案"所在行索引:', referenceIndex);

    if (referenceIndex >= 0) {
      console.log('\n"参考答案"前后各10行:');
      for (let i = Math.max(0, referenceIndex - 10); i < Math.min(lines.length, referenceIndex + 10); i++) {
        const marker = i === referenceIndex ? ' <--' : '';
        console.log(`  ${i + 1}: ${lines[i]}${marker}`);
      }
    }

    // 测试split
    console.log('\n\n测试 split("参考答案"):');
    const parts = text.split('参考答案');
    console.log('分割后部分数量:', parts.length);
    parts.forEach((part, i) => {
      console.log(`\n部分 ${i + 1} 长度: ${part.length}`);
      const partLines = part.split('\n').map(line => line.trim()).filter(line => line);
      console.log(`部分 ${i + 1} 行数: ${partLines.length}`);
      console.log(`部分 ${i + 1} 前5行:`);
      partLines.slice(0, 5).forEach((line, j) => {
        console.log(`  ${j + 1}: ${line}`);
      });
    });

  } catch (error) {
    console.error('调试失败:', error);
  }
}

debugSplit();
