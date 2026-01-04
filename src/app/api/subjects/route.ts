import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');

    let query = 'SELECT * FROM subjects WHERE is_active = true';
    const params: any[] = [];

    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY sort_order';

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      subjects: result.rows
    });
  } catch (error) {
    console.error('获取科目列表失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
