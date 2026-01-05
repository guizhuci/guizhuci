const mammoth = require('mammoth');
const fs = require('fs').promises;

async function analyzeWordFile(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    // 统计题目数量
    const lines = text.split('\n');
    let questionCount = 0;

    lines.forEach(line => {
      if (/^\d+[.、]/.test(line.trim())) {
        questionCount++;
      }
    });

    return {
      totalLines: lines.length,
      questionCount,
      sampleText: text.substring(0, 500)
    };
  } catch (error) {
    console.error(`分析 ${filePath} 失败:`, error);
    return null;
  }
}

async function analyzeAllFiles() {
  const files = [
    '/workspace/projects/assets/信息技术.docx',
    '/workspace/projects/assets/通用技术_test.docx',
    '/workspace/projects/assets/美术_test.docx',
    '/workspace/projects/assets/音乐_test.docx',
    '/workspace/projects/assets/综合实践_test.docx'
  ];

  console.log('=== 题库文件分析 ===\n');

  for (const file of files) {
    const stats = await analyzeWordFile(file);
    if (stats) {
      const fileName = file.split('/').pop();
      console.log(`文件: ${fileName}`);
      console.log(`总行数: ${stats.totalLines}`);
      console.log(`题目数量: ${stats.questionCount}`);
      console.log(`是否达标: ${stats.questionCount >= 500 ? '✓' : '✗ (需要≥500道)'}`);
      console.log(`\n样本内容:\n${stats.sampleText}...\n`);
      console.log('---\n');
    }
  }
}

analyzeAllFiles();
