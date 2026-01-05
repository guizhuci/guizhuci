const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createMockPapers() {
  try {
    // 获取所有科目
    const subjects = await pool.query('SELECT id, name FROM subjects WHERE is_active = true ORDER BY sort_order');
    
    console.log('开始为每个科目创建模拟卷...\n');
    
    for (const subject of subjects.rows) {
      // 获取该科目的所有题目
      const questions = await pool.query(
        'SELECT id FROM questions WHERE subject_id = $1 AND is_active = true ORDER BY sort_order',
        [subject.id]
      );
      
      if (questions.rows.length === 0) {
        console.log(`跳过 ${subject.name}：无题目`);
        continue;
      }
      
      // 创建模拟卷（免费）
      const paperResult = await pool.query(
        `INSERT INTO exam_papers (title, subject_id, duration, total_score, is_free, price, sort_order)
         VALUES ($1, $2, 150, 100, true, '0.00', 1)
         RETURNING id`,
        [`全真模拟卷 - ${subject.name}`, subject.id]
      );
      
      const paperId = paperResult.rows[0].id;
      
      // 添加题目到模拟卷（最多10道题）
      const maxQuestions = Math.min(questions.rows.length, 10);
      for (let i = 0; i < maxQuestions; i++) {
        await pool.query(
          `INSERT INTO exam_paper_questions (exam_paper_id, question_id, question_order, score)
           VALUES ($1, $2, $3, 10)`,
          [paperId, questions.rows[i].id, i + 1]
        );
      }
      
      console.log(`✓ ${subject.name}：创建模拟卷，包含 ${maxQuestions} 道题目`);
    }
    
    console.log('\n模拟卷创建完成！');
  } catch (error) {
    console.error('创建模拟卷失败:', error);
  } finally {
    await pool.end();
  }
}

createMockPapers();
