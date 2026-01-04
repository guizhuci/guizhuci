import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { questions, subjects } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

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

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json({ success: false, error: '请上传.docx格式的文件' }, { status: 400 });
    }

    const tempDir = '/tmp';
    const filePath = path.join(tempDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const parsedQuestions = await parseWordDocument(filePath);

    await fs.unlink(filePath);

    if (parsedQuestions.length === 0) {
      return NextResponse.json({ success: false, error: '未解析到任何题目，请检查文档格式' }, { status: 400 });
    }

    const db = await getDb();

    // 验证科目是否存在
    const subjectCheck = await db.select().from(subjects).where(eq(subjects.id, parseInt(subjectId))).limit(1);
    if (subjectCheck.length === 0) {
      return NextResponse.json({ success: false, error: '所选科目不存在' }, { status: 400 });
    }

    let importedCount = 0;
    for (const q of parsedQuestions) {
      await db.insert(questions).values({
        subjectId: parseInt(subjectId),
        type: q.type,
        questionText: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation || '',
        sortOrder: importedCount
      });
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      total: parsedQuestions.length
    });
  } catch (error) {
    console.error('导入题目失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '导入失败，请稍后重试'
    }, { status: 500 });
  }
}

async function parseWordDocument(filePath: string): Promise<any[]> {
  try {
    const mammoth = require('mammoth');

    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;

    const text = html
      .replace(/<[^>]*>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n+/g, '\n');

    return parseQuestionsText(text);
  } catch (error) {
    console.error('解析Word文档失败:', error);
    throw new Error('文档解析失败，请检查文件格式');
  }
}

function parseQuestionsText(text: string): any[] {
  const questions: any[] = [];

  const referenceIndex = text.indexOf('参考答案');

  if (referenceIndex === -1) {
    console.log('文档中未找到"参考答案"，尝试使用简单解析模式');
    return parseSimpleQuestions(text);
  }

  const questionsPart = text.substring(0, referenceIndex);
  const answersPart = text.substring(referenceIndex + 4);

  const parsedQuestions = parseQuestionsSection(questionsPart);
  const parsedAnswers = parseAnswersSection(answersPart);

  let currentType = 'single_choice';
  let typeStartIndex = 0;

  parsedQuestions.forEach((q: any) => {
    if (q.type !== currentType) {
      currentType = q.type;
      typeStartIndex = 0;
    }

    const answer = parsedAnswers.get(`${currentType}_${q.index - typeStartIndex}`);
    if (answer) {
      q.answer = answer.answer;
      q.explanation = answer.explanation;
    }
    questions.push(q);
  });

  return questions;
}

function parseQuestionsSection(text: string): any[] {
  const questions: any[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion: any = null;
  let currentType = 'single_choice';
  let currentIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('单项选择')) {
      currentType = 'single_choice';
      currentIndex = 1;
      continue;
    }

    if (line.includes('判断题')) {
      currentType = 'judge';
      currentIndex = 1;
      continue;
    }

    if (line.includes('综合探究')) {
      currentType = 'essay';
      currentIndex = 1;
      continue;
    }

    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.question) {
        currentQuestion.index = currentIndex - 1;
        questions.push(currentQuestion);
      }

      currentQuestion = {
        question: questionMatch[2],
        options: [],
        answer: '',
        explanation: '',
        type: currentType,
        index: currentIndex - 1
      };
      currentIndex++;
      continue;
    }

    if (!currentQuestion) continue;

    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[2]);
        continue;
      }
    }
  }

  // 添加最后一题
  if (currentQuestion && currentQuestion.question) {
    currentQuestion.index = currentIndex - 1;
    questions.push(currentQuestion);
  }

  return questions;
}

function parseAnswersSection(text: string): Map<string, any> {
  const answers = new Map();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentType = 'single_choice';
  let currentIndex = 1;
  let currentAnswer = '';
  let hasCurrentAnswer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('单项选择')) {
      // 先保存当前正在处理的答案
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'single_choice';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    if (line.includes('判断题')) {
      // 先保存当前正在处理的答案
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
      }

      currentType = 'judge';
      currentIndex = 1;
      currentAnswer = '';
      hasCurrentAnswer = false;
      continue;
    }

    if (line.includes('综合探究')) {
      // 先保存当前正在处理的答案
      if (hasCurrentAnswer && currentAnswer) {
        const answerData = parseAnswerLine(currentAnswer, currentType);
        answers.set(`${currentType}_${currentIndex - 1}`, answerData);
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
      }

      currentIndex = parseInt(questionNumberMatch[1]);
      currentAnswer = line;
      hasCurrentAnswer = true;
      continue;
    }

    if (line && hasCurrentAnswer && !line.match(/^\d+[.、]/)) {
      currentAnswer += '\n' + line;
    }
  }

  // 保存最后一题答案
  if (hasCurrentAnswer && currentAnswer) {
    const answerData = parseAnswerLine(currentAnswer, currentType);
    answers.set(`${currentType}_${currentIndex}`, answerData);
  }

  return answers;
}

function parseAnswerLine(line: string, type: string): any {
  const match = line.match(/^(\d+)[.、]\s*(.+)/);
  if (!match) {
    return { answer: '', explanation: '' };
  }

  const content = match[2].trim();

  if (type === 'single_choice') {
    const answerMatch = content.match(/^([ABCD])([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1];
      const explanation = answerMatch[2].trim().replace(/^【\s*/, '').replace(/】\s*$/, '').trim();
      return { answer, explanation };
    }
  } else if (type === 'judge') {
    const answerMatch = content.match(/^(正确|错误)([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1];
      const explanation = answerMatch[2].trim().replace(/^【\s*/, '').replace(/】\s*$/, '').trim();
      return { answer, explanation };
    }
  } else if (type === 'essay') {
    const answerMatch = content.match(/^答[:：]\s*([\s\S]*)/);
    if (answerMatch) {
      const answer = answerMatch[1].trim();
      return { answer, explanation: '' };
    }
  }

  return { answer: content, explanation: '' };
}

function parseSimpleQuestions(text: string): any[] {
  const questions: any[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion: any = null;
  let currentType = 'single_choice';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('单项选择')) {
      currentType = 'single_choice';
      continue;
    }

    if (line.includes('判断题')) {
      currentType = 'judge';
      continue;
    }

    if (line.includes('综合探究')) {
      currentType = 'essay';
      continue;
    }

    const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }

      currentQuestion = {
        question: questionMatch[2],
        options: [],
        answer: '',
        explanation: '',
        type: currentType
      };
      continue;
    }

    if (!currentQuestion) continue;

    if (currentType === 'single_choice') {
      const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[2]);
        continue;
      }
    }
  }

  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }

  return questions;
}
