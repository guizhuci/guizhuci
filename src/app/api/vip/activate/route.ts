import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { userId, code } = await request.json();

    await client.query('BEGIN');

    // 查询VIP码
    const codeResult = await client.query(
      `SELECT * FROM vip_codes
       WHERE code = $1`,
      [code]
    );

    if (codeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: '激活码不存在' }, { status: 400 });
    }

    const vipCode = codeResult.rows[0];

    // 检查是否已使用
    if (vipCode.is_used) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: '激活码已被使用' }, { status: 400 });
    }

    // 检查有效期
    if (vipCode.valid_until && new Date(vipCode.valid_until) < new Date()) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: '激活码已过期' }, { status: 400 });
    }

    // 标记VIP码为已使用
    await client.query(
      `UPDATE vip_codes
       SET is_used = true, used_by = $1, used_at = NOW()
       WHERE id = $2`,
      [userId, vipCode.id]
    );

    // 添加用户解锁记录
    const validUntil = vipCode.valid_until || getValidUntilDate();

    await client.query(
      `INSERT INTO user_unlocks (user_id, type, target_id, unlock_method, valid_until)
       VALUES ($1, $2, $3, 'vip_code', $4)
       ON CONFLICT (user_id, type, target_id)
       DO UPDATE SET valid_until = GREATEST(user_unlocks.valid_until, $4)`,
      [userId, vipCode.type, vipCode.target_id, validUntil]
    );

    // 创建订单记录
    let amount = 0;
    let targetName = '';

    if (vipCode.type === 'subject') {
      const subjectResult = await client.query(
        'SELECT name FROM subjects WHERE id = $1',
        [vipCode.target_id]
      );
      targetName = subjectResult.rows[0]?.name || '未知科目';
      amount = 19.99; // 科目统一价格
    } else if (vipCode.type === 'exam_paper') {
      const paperResult = await client.query(
        'SELECT title, price FROM exam_papers WHERE id = $1',
        [vipCode.target_id]
      );
      targetName = paperResult.rows[0]?.title || '未知试卷';
      amount = paperResult.rows[0]?.price || 4.99;
    }

    await client.query(
      `INSERT INTO orders (user_id, type, target_id, amount, status, payment_method, valid_until)
       VALUES ($1, $2, $3, $4, 'paid', 'vip_code', $5)`,
      [userId, vipCode.type, vipCode.target_id, amount, validUntil]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: '激活成功',
      type: vipCode.type,
      targetName
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('激活VIP码失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  } finally {
    client.release();
  }
}

// 计算有效期至次年4月1日
function getValidUntilDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const nextYearApril = new Date(year + 1, 3, 1); // 月份从0开始，3表示4月

  return nextYearApril.toISOString().split('T')[0];
}
