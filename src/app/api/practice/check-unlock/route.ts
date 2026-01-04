import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const type = request.nextUrl.searchParams.get('type'); // 'subject' 或 'exam_paper'
    const targetId = request.nextUrl.searchParams.get('targetId');

    // 查询解锁记录
    const unlockResult = await pool.query(
      `SELECT * FROM user_unlocks
       WHERE user_id = $1 AND type = $2 AND target_id = $3
       AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)`,
      [userId, type, targetId]
    );

    const isUnlocked = unlockResult.rows.length > 0;

    return NextResponse.json({
      success: true,
      isUnlocked,
      unlock: unlockResult.rows[0] || null
    });
  } catch (error) {
    console.error('检查解锁状态失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
