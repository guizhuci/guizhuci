import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function generateVipCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VIP${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { type, targetId, count } = await request.json();

    if (!type || !targetId || count < 1 || count > 100) {
      return NextResponse.json({ success: false, error: '参数错误' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 计算有效期至次年4月1日
    const now = new Date();
    const validUntil = new Date(now.getFullYear() + 1, 3, 1).toISOString().split('T')[0];

    // 批量生成VIP码
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = generateVipCode();
      codes.push(code);

      await client.query(
        `INSERT INTO vip_codes (code, type, target_id, valid_until)
         VALUES ($1, $2, $3, $4)`,
        [code, type, targetId, validUntil]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      codes,
      count: codes.length,
      validUntil
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('生成VIP码失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  } finally {
    client.release();
  }
}
