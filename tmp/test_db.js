const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    console.log('测试1: 获取科目列表');
    const subjectsResult = await pool.query(
      'SELECT * FROM subjects WHERE is_active = true ORDER BY sort_order'
    );
    console.log('科目列表:', subjectsResult.rows);

    console.log('\n测试2: 获取题目数量');
    const questionsCount = await pool.query(
      'SELECT COUNT(*) FROM questions WHERE subject_id = 1 AND is_active = true'
    );
    console.log('题目数量:', questionsCount.rows[0]);

    console.log('\n测试3: 获取题目详情');
    const questionsResult = await pool.query(
      'SELECT id, question_text, options, answer, explanation FROM questions WHERE subject_id = 1 AND is_active = true LIMIT 3'
    );
    console.log('题目详情:', JSON.stringify(questionsResult.rows, null, 2));

    console.log('\n测试4: 检查user_unlocks表');
    const unlocksResult = await pool.query(
      'SELECT * FROM user_unlocks WHERE user_id = 1'
    );
    console.log('解锁记录:', unlocksResult.rows);

    console.log('\n测试5: 检查answer_records表');
    const answerRecordsResult = await pool.query(
      'SELECT * FROM answer_records WHERE user_id = 1'
    );
    console.log('答题记录:', answerRecordsResult.rows);

  } catch (error) {
    console.error('错误:', error);
  } finally {
    await pool.end();
  }
}

test();
