const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkSubjects() {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY sort_order');
    console.log('=== 当前数据库中的科目 ===\n');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await pool.end();
  }
}

checkSubjects();
