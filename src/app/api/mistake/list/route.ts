import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const source = request.nextUrl.searchParams.get('source'); // 'practice' 或 'exam'
    const subjectId = request.nextUrl.searchParams.get('subjectId');
    const paperId = request.nextUrl.searchParams.get('paperId');

    let query = `
      SELECT m.id as mistake_id, m.exam_paper_id, m.subject_id,
             q.id as question_id, q.question_text, q.options, q.answer, q.explanation,
             ar.user_answer
      FROM mistakes m
      JOIN questions q ON m.question_id = q.id
      LEFT JOIN answer_records ar ON m.user_id = ar.user_id AND m.question_id = ar.question_id AND ar.answer_mode = $1
      WHERE m.user_id = $2 AND m.source = $1
    `;
    const params: any[] = [source, userId];

    if (source === 'practice' && subjectId && subjectId !== 'all') {
      query += ' AND m.subject_id = $3';
      params.push(subjectId);
    }

    if (source === 'exam' && paperId && paperId !== 'all') {
      query += ' AND m.exam_paper_id = $3';
      params.push(paperId);
    }

    query += ' ORDER BY m.first_mistake_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      mistakes: result.rows.map(row => ({
        id: row.mistake_id,
        question_id: row.question_id,
        question_text: row.question_text,
        options: row.options ? JSON.parse(row.options) : [],
        answer: row.answer,
        user_answer: row.user_answer,
        explanation: row.explanation,
        subject_id: row.subject_id,
        exam_paper_id: row.exam_paper_id
      }))
    });
  } catch (error) {
    console.error('获取错题集失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
