import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    // 查询所有启用的模拟卷
    const result = await pool.query(
      `SELECT ep.*, s.name as subject_name
       FROM exam_papers ep
       LEFT JOIN subjects s ON ep.subject_id = s.id
       WHERE ep.is_active = true
       ORDER BY ep.sort_order`
    );

    return NextResponse.json({
      success: true,
      papers: result.rows
    });
  } catch (error) {
    console.error('获取模拟卷列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
