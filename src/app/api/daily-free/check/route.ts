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

    // 查询今日已答题目数量
    const result = await pool.query(
      `SELECT COUNT(DISTINCT question_id) as count
       FROM daily_free_questions
       WHERE user_id = $1 AND answer_date = $2`,
      [userId, today]
    );

    return NextResponse.json({
      success: true,
      count: result.rows[0]?.count || 0
    });
  } catch (error) {
    console.error('检查今日答题状态失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
