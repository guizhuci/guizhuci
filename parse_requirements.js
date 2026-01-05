const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

async function parseWordDocument() {
  try {
    const filePath = '/workspace/projects/assets/职测助手1.0.docx';
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    console.log('=== 职测助手需求文档 ===\n');
    console.log(text);

    // 保存到文件
    await fs.writeFile('/tmp/requirements.txt', text, 'utf-8');
    console.log('\n=== 需求已保存到 /tmp/requirements.txt ===');
  } catch (error) {
    console.error('解析文档失败:', error);
    throw error;
  }
}

parseWordDocument();
