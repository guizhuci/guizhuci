import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    // 查询启用的资讯
    const result = await pool.query(
      `SELECT * FROM news
       WHERE is_active = true
       ORDER BY sort_order, created_at DESC
       LIMIT 20`
    );

    return NextResponse.json({
      success: true,
      news: result.rows
    });
  } catch (error) {
    console.error('获取资讯列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
