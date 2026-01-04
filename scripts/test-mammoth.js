const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function testMammoth() {
  try {
    const filePath = path.join(__dirname, '../assets/信息技术.docx');

    console.log('测试1: 提取原始文本\n');
    const result1 = await mammoth.extractRawText({ path: filePath });
    const text1 = result1.value;
    const lines1 = text1.split('\n');
    console.log('总行数:', lines1.length);
    console.log('\n最后50行:');
    lines1.slice(-50).forEach((line, i) => {
      console.log(`  ${lines1.length - 50 + i + 1}: ${line}`);
    });

    console.log('\n\n测试2: 提取HTML文本\n');
    const result2 = await mammoth.convertToHtml({ path: filePath });
    const html2 = result2.value;

    // 简单的HTML转文本
    const text2 = html2
      .replace(/<[^>]*>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    const lines2 = text2.split('\n').map(line => line.trim()).filter(line => line);
    console.log('总行数:', lines2.length);
    console.log('\n最后50行:');
    lines2.slice(-50).forEach((line, i) => {
      console.log(`  ${lines2.length - 50 + i + 1}: ${line}`);
    });

    // 找到"参考答案"的位置
    console.log('\n\n查找"参考答案"相关内容:');
    const answerLines1 = lines1.filter((line, i) =>
      line.includes('参考答案') || line.includes('答案') || lines1[i-1]?.includes('参考答案')
    );
    console.log('原始文本模式找到的答案行数:', answerLines1.length);
    answerLines1.slice(0, 20).forEach((line, i) => {
      console.log(`  ${i + 1}: ${line}`);
    });

    const answerLines2 = lines2.filter((line, i) =>
      line.includes('参考答案') || line.includes('答案') || lines2[i-1]?.includes('参考答案')
    );
    console.log('\nHTML模式找到的答案行数:', answerLines2.length);
    answerLines2.slice(0, 20).forEach((line, i) => {
      console.log(`  ${i + 1}: ${line}`);
    });

  } catch (error) {
    console.error('测试失败:', error);
  }
}

testMammoth();
