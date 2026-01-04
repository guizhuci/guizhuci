const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function parseWordFile() {
  try {
    const filePath = path.join(__dirname, '../assets/信息技术.docx');

    console.log('正在读取Word文档...');

    // 提取原始文本
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    console.log('\n========== 文档内容 ==========\n');
    console.log(text);
    console.log('\n========== 文档内容结束 ==========\n');

    // 解析题目
    const questions = parseQuestionsText(text);

    console.log(`\n共解析到 ${questions.length} 道题目\n`);

    // 显示前5道题目
    console.log('========== 前5道题目预览 ==========\n');
    questions.slice(0, 5).forEach((q, index) => {
      console.log(`题目 ${index + 1}:`);
      console.log(`  内容: ${q.question.substring(0, 50)}...`);
      console.log(`  选项: ${q.options.join(', ')}`);
      console.log(`  答案: ${q.answer}`);
      console.log(`  解析: ${q.explanation.substring(0, 50)}...`);
      console.log('');
    });

  } catch (error) {
    console.error('解析失败:', error);
  }
}

function parseQuestionsText(text) {
  const questions = [];

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion = null;
  let inAnswerSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测题目开始（1. 或 1、）
    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch && !inAnswerSection) {
      // 保存上一题
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }

      // 开始新题目
      currentQuestion = {
        question: questionMatch[2],
        options: [],
        answer: '',
        explanation: '',
        type: 'single_choice'
      };
      continue;
    }

    if (!currentQuestion) continue;

    // 检测选项（A.、B.、C.、D.）
    const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
    if (optionMatch && !inAnswerSection) {
      currentQuestion.options.push(optionMatch[2]);
      continue;
    }

    // 检测答案
    if (line.startsWith('答案') || line.startsWith('【答案】')) {
      const answerMatch = line.match(/答案[：:]\s*([ABCD]+)/);
      if (answerMatch) {
        currentQuestion.answer = answerMatch[1];
        inAnswerSection = true;
      }
      continue;
    }

    // 检测解析
    if (line.startsWith('解析') || line.startsWith('【解析】') || inAnswerSection) {
      const explanationMatch = line.match(/解析[：:]\s*(.+)/);
      if (explanationMatch) {
        currentQuestion.explanation = explanationMatch[1];
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

parseWordFile();
