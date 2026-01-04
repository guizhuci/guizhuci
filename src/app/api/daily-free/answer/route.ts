import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// 数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, answer } = await request.json();

    // 获取正确答案
    const questionResult = await pool.query(
      'SELECT answer FROM questions WHERE id = $1',
      [questionId]
    );

    const correctAnswer = questionResult.rows[0]?.answer;
    const isCorrect = answer === correctAnswer;
    const today = new Date().toISOString().split('T')[0];

    // 插入或更新每日答题记录
    await pool.query(
      `INSERT INTO daily_free_questions (user_id, question_id, answer_date, user_answer, is_correct)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, question_id, answer_date)
       DO UPDATE SET user_answer = $4, is_correct = $5`,
      [userId, questionId, today, answer, isCorrect]
    );

    // 如果答错了，加入错题集
    if (!isCorrect) {
      // 获取题目所属科目
      const subjectResult = await pool.query(
        'SELECT subject_id FROM questions WHERE id = $1',
        [questionId]
      );
      const subjectId = subjectResult.rows[0]?.subject_id;

      // 检查错题是否已存在
      const mistakeExists = await pool.query(
        `SELECT id FROM mistakes
         WHERE user_id = $1 AND question_id = $2 AND source = 'practice'`,
        [userId, questionId]
      );

      if (mistakeExists.rows.length === 0) {
        await pool.query(
          `INSERT INTO mistakes (user_id, question_id, source, subject_id)
           VALUES ($1, $2, 'practice', $3)`,
          [userId, questionId, subjectId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      correctAnswer
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
