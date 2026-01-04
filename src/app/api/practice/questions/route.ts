import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const subjectId = request.nextUrl.searchParams.get('subjectId');
    const userId = request.nextUrl.searchParams.get('userId');

    // 查询该科目下已答题目数量
    const answerCountResult = await pool.query(
      `SELECT COUNT(DISTINCT question_id) as count
       FROM answer_records
       WHERE user_id = $1 AND answer_mode = 'practice'
       AND question_id IN (SELECT id FROM questions WHERE subject_id = $2)`,
      [userId, subjectId]
    );

    const answerCount = parseInt(answerCountResult.rows[0]?.count || '0');

    // 获取该科目下的所有题目
    const questionsResult = await pool.query(
      `SELECT q.id, q.question_text, q.options, q.answer, q.explanation
       FROM questions q
       WHERE q.subject_id = $1 AND q.is_active = true
       ORDER BY q.sort_order`,
      [subjectId]
    );

    return NextResponse.json({
      success: true,
      questions: questionsResult.rows.map(row => ({
        ...row,
        options: row.options ? JSON.parse(row.options) : []
      })),
      answerCount
    });
  } catch (error) {
    console.error('获取练习题目失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
