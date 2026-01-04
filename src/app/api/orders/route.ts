import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    // 查询用户订单
    const result = await pool.query(
      `SELECT o.*,
              CASE
                WHEN o.type = 'subject' THEN s.name
                WHEN o.type = 'exam_paper' THEN ep.title
                ELSE '未知'
              END as target_name
       FROM orders o
       LEFT JOIN subjects s ON o.type = 'subject' AND o.target_id = s.id
       LEFT JOIN exam_papers ep ON o.type = 'exam_paper' AND o.target_id = ep.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      orders: result.rows
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
