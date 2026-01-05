const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkQuestions() {
  try {
    // 检查各科目的题目数量
    const result = await pool.query(`
      SELECT 
        s.name as subject_name,
        COUNT(q.id) as question_count,
        COUNT(CASE WHEN q.question_text IS NOT NULL THEN 1 END) as has_question,
        COUNT(CASE WHEN q.answer IS NOT NULL THEN 1 END) as has_answer,
        COUNT(CASE WHEN q.explanation IS NOT NULL THEN 1 END) as has_explanation
      FROM subjects s
      LEFT JOIN questions q ON s.id = q.subject_id
      WHERE s.is_active = true
      GROUP BY s.id, s.name
      ORDER BY s.sort_order
    `);

    console.log('=== 各科目题目统计 ===\n');
    console.table(result.rows);

    // 检查模拟卷
    const papers = await pool.query(`
      SELECT 
        ep.id,
        ep.title,
        ep.is_free,
        ep.price,
        COUNT(eq.question_id) as question_count
      FROM exam_papers ep
      LEFT JOIN exam_questions eq ON ep.id = eq.exam_paper_id
      GROUP BY ep.id, ep.title, ep.is_free, ep.price
      ORDER BY ep.id
    `);

    console.log('\n=== 模拟卷统计 ===\n');
    console.table(papers.rows);

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await pool.end();
  }
}

checkQuestions();
