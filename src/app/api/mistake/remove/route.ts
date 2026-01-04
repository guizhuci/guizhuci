import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, mistakeId } = await request.json();

    // 移除错题（实际是标记为已掌握）
    await pool.query(
      `UPDATE mistakes SET is_mastered = true, review_count = review_count + 1
       WHERE id = $1 AND user_id = $2`,
      [mistakeId, userId]
    );

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('移除错题失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
