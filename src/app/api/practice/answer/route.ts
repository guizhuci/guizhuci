import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, questionId, answer, mode } = await request.json();

    // 获取正确答案
    const questionResult = await pool.query(
      'SELECT answer, subject_id FROM questions WHERE id = $1',
      [questionId]
    );

    const correctAnswer = questionResult.rows[0]?.answer || '';
    const subjectId = questionResult.rows[0]?.subject_id;

    // 清理正确答案，移除"参考答案："前缀
    const cleanCorrectAnswer = typeof correctAnswer === 'string'
      ? correctAnswer.replace(/^参考答案[：:]\s*/i, '')
      : correctAnswer;

    const isCorrect = answer === cleanCorrectAnswer;

    // 插入答题记录
    await pool.query(
      `INSERT INTO answer_records (user_id, question_id, user_answer, is_correct, answer_mode)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, question_id)
       DO UPDATE SET user_answer = $3, is_correct = $4`,
      [userId, questionId, answer, isCorrect, mode]
    );

    // 如果答错了，加入错题集
    if (!isCorrect && mode === 'practice') {
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
    console.error('记录答题失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
