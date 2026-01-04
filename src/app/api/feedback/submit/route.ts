import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, content, contact } = await request.json();

    // 插入反馈
    await pool.query(
      `INSERT INTO feedbacks (user_id, content, contact_info, status)
       VALUES ($1, $2, $3, 'pending')`,
      [userId, content, contact]
    );

    return NextResponse.json({
      success: true,
      message: '反馈提交成功'
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
