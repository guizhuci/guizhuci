import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// 数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const today = new Date().toISOString().split('T')[0];

    // 查询今日已答的题目ID
    const answeredResult = await pool.query(
      `SELECT question_id FROM daily_free_questions
       WHERE user_id = $1 AND answer_date = $2`,
      [userId, today]
    );

    const answeredIds = answeredResult.rows.map(row => row.question_id);

    // 随机获取5道今日未答的题目
    let questionsQuery;
    let queryParams;

    if (answeredIds.length > 0) {
      questionsQuery = `
        SELECT q.id, q.question_text, q.options, q.answer, q.explanation
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        WHERE s.category = 'single_recruitment'
        AND q.id NOT IN (${answeredIds.map(() => '?').join(',')})
        AND q.is_active = true
        ORDER BY RANDOM()
        LIMIT 5
      `;
      queryParams = answeredIds;
    } else {
      questionsQuery = `
        SELECT q.id, q.question_text, q.options, q.answer, q.explanation
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        WHERE s.category = 'single_recruitment'
        AND q.is_active = true
        ORDER BY RANDOM()
        LIMIT 5
      `;
      queryParams = [];
    }

    const questionsResult = await pool.query(questionsQuery, queryParams);

    return NextResponse.json({
      success: true,
      questions: questionsResult.rows.map(row => ({
        ...row,
        options: row.options ? JSON.parse(row.options) : []
      }))
    });
  } catch (error) {
    console.error('获取每日题目失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
