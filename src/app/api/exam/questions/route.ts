import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const paperId = request.nextUrl.searchParams.get('paperId');

    // 查询模拟卷的题目
    const result = await pool.query(
      `SELECT q.id, q.question_text, q.options, q.answer, q.explanation, epq.score
       FROM questions q
       JOIN exam_paper_questions epq ON q.id = epq.question_id
       WHERE epq.exam_paper_id = $1
       ORDER BY epq.question_order`,
      [paperId]
    );

    return NextResponse.json({
      success: true,
      questions: result.rows.map(row => ({
        ...row,
        options: row.options ? JSON.parse(row.options) : []
      }))
    });
  } catch (error) {
    console.error('获取模拟卷题目失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
