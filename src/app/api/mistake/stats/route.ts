import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    // 统计错题数量
    const practiceResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM mistakes
       WHERE user_id = $1 AND source = 'practice' AND is_mastered = false`,
      [userId]
    );

    const examResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM mistakes
       WHERE user_id = $1 AND source = 'exam' AND is_mastered = false`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      stats: {
        practice_mistakes: parseInt(practiceResult.rows[0].count),
        exam_mistakes: parseInt(examResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('获取错题统计失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
