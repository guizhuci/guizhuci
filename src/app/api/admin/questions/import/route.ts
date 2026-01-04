import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subjectId = formData.get('subjectId') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: '请上传文件' }, { status: 400 });
    }

    if (!subjectId) {
      return NextResponse.json({ success: false, error: '请选择科目' }, { status: 400 });
    }

    // 检查文件类型
    if (!file.name.endsWith('.docx')) {
      return NextResponse.json({ success: false, error: '请上传.docx格式的文件' }, { status: 400 });
    }

    // 保存文件到临时目录
    const tempDir = '/tmp';
    const filePath = path.join(tempDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // 解析Word文档
    const questions = await parseWordDocument(filePath);

    // 删除临时文件
    await fs.unlink(filePath);

    if (questions.length === 0) {
      return NextResponse.json({ success: false, error: '未解析到任何题目，请检查文档格式' }, { status: 400 });
    }

    // 批量插入题目
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let importedCount = 0;
      for (const q of questions) {
        // 插入题目
        const result = await client.query(
          `INSERT INTO questions (subject_id, type, question_text, options, answer, explanation, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            parseInt(subjectId),
            q.type,
            q.question,
            JSON.stringify(q.options),
            q.answer,
            q.explanation || '',
            importedCount
          ]
        );

        importedCount++;
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        imported: importedCount,
        total: questions.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('导入题目失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '导入失败，请稍后重试'
    }, { status: 500 });
  }
}

// 解析Word文档
async function parseWordDocument(filePath: string): Promise<any[]> {
  try {
    // 使用pandoc或mammoth解析Word文档
    // 这里使用简单的文本提取方式

    // 安装依赖包
    const mammoth = require('mammoth');

    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    return parseQuestionsText(text);
  } catch (error) {
    console.error('解析Word文档失败:', error);
    throw new Error('文档解析失败，请检查文件格式');
  }
}

// 解析题目文本
function parseQuestionsText(text: string): any[] {
  const questions: any[] = [];

  // 简化版解析：假设文档格式为：
  // 1. 题目内容...
  // A. 选项1
  // B. 选项2
  // C. 选项3
  // D. 选项4
  // 答案：A
  // 解析：解析内容...

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion: any = null;
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
