import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { userId, paperId, answers } = await request.json();

    await client.query('BEGIN');

    // 获取模拟卷的题目和分数
    const questionsResult = await client.query(
      `SELECT q.id, q.answer, q.subject_id, q.question_text, q.options, q.explanation, epq.score
       FROM questions q
       JOIN exam_paper_questions epq ON q.id = epq.question_id
       WHERE epq.exam_paper_id = $1
       ORDER BY epq.question_order`,
      [paperId]
    );

    const questions = questionsResult.rows;
    let correctCount = 0;
    let totalScore = 0;

    // 批量插入答题记录
    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.answer;

      if (isCorrect) {
        correctCount++;
        totalScore += question.score;
      }

      // 插入答题记录
      await client.query(
        `INSERT INTO answer_records (user_id, question_id, exam_paper_id, user_answer, is_correct, answer_mode)
         VALUES ($1, $2, $3, $4, $5, 'exam')
         ON CONFLICT (user_id, question_id, exam_paper_id)
         DO UPDATE SET user_answer = $4, is_correct = $5`,
        [userId, question.id, paperId, userAnswer, isCorrect]
      );

      // 如果答错了，加入错题集
      if (!isCorrect) {
        const mistakeExists = await client.query(
          `SELECT id FROM mistakes
           WHERE user_id = $1 AND question_id = $2 AND source = 'exam'`,
          [userId, question.id]
        );

        if (mistakeExists.rows.length === 0) {
          await client.query(
            `INSERT INTO mistakes (user_id, question_id, exam_paper_id, source, subject_id)
             VALUES ($1, $2, $3, 'exam', $4)`,
            [userId, question.id, paperId, question.subject_id]
          );
        }
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      score: totalScore,
      totalQuestions: questions.length,
      correctCount
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('提交试卷失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  } finally {
    client.release();
  }
}
