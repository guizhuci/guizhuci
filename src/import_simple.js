const mammoth = require('mammoth');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importSubject(filePath, subjectId, subjectName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`导入科目: ${subjectName}`);
  console.log(`文件: ${filePath}`);
  console.log(`科目ID: ${subjectId}`);
  console.log('='.repeat(60));

  try {
    // 复用解析逻辑
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;
    const text = html.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\n+/g, '\n');

    // 简单解析
    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let currentQuestion = null;
    let currentType = 'single_choice';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('单项选择')) { currentType = 'single_choice'; continue; }
      if (line.includes('判断题')) { currentType = 'judge'; continue; }
      if (line.includes('综合探究')) { currentType = 'essay'; continue; }

      const questionMatch = line.match(/^(\d+)[.、]\s*(.+)/);
      if (questionMatch) {
        if (currentQuestion && currentQuestion.question) questions.push(currentQuestion);
        currentQuestion = { question: questionMatch[2], options: [], answer: '', explanation: '', type: currentType };
        continue;
      }

      if (!currentQuestion) continue;

      if (currentType === 'single_choice') {
        const optionMatch = line.match(/^([ABCD])[.、]\s*(.+)/);
        if (optionMatch) { currentQuestion.options.push(optionMatch[2]); continue; }
      }

      if (line.includes('参考答案')) {
        const answerMatch = line.match(/参考答案[:：]\s*(.+)/);
        if (answerMatch) {
          let answer = answerMatch[1].trim();
          if (currentType === 'single_choice') {
            const letterMatch = answer.match(/^([ABCD])/);
            if (letterMatch) currentQuestion.answer = letterMatch[1];
          } else if (currentType === 'judge') {
            const judgeMatch = answer.match(/^(正确|错误)/);
            if (judgeMatch) currentQuestion.answer = judgeMatch[1];
          } else {
            currentQuestion.answer = answer;
          }
        }
        continue;
      }

      if (line.includes('解析')) {
        const explanationMatch = line.match(/解析[:：]\s*(.+)/);
        if (explanationMatch) currentQuestion.explanation = explanationMatch[1].trim();
      }
    }

    if (currentQuestion && currentQuestion.question) questions.push(currentQuestion);

    console.log(`解析成功，共${questions.length}道题`);

    // 插入数据库
    let importedCount = 0;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const q of questions) {
        console.log(`  插入第${importedCount + 1}题: ${q.question.substring(0, 30)}...`);
        const result = await client.query(
          `INSERT INTO questions (subject_id, type, question_text, options, answer, explanation, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            parseInt(subjectId),
            q.type,
            q.question,
            JSON.stringify(q.options),
            q.answer,
            q.explanation || '',
            importedCount
          ]
        );
        console.log(`    ✓ 插入成功，ID: ${result.rows[0].id}`);
        importedCount++;
      }

      await client.query('COMMIT');
      console.log(`✓ 成功导入 ${importedCount} 道题到数据库`);

      return { success: true, imported: importedCount, total: questions.length };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('数据库错误:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.log(`✗ 导入失败: ${error.message}`);
    console.error('详细错误:', error);
    return { success: false, error: error.message };
  }
}

async function importAll() {
  const files = [
    { path: '/workspace/projects/assets/信息技术_test.docx', subjectId: 1, name: '信息技术' },
    { path: '/workspace/projects/assets/通用技术_test.docx', subjectId: 2, name: '通用技术' },
    { path: '/workspace/projects/assets/美术_test.docx', subjectId: 3, name: '美术' },
    { path: '/workspace/projects/assets/音乐_test.docx', subjectId: 4, name: '音乐' },
    { path: '/workspace/projects/assets/综合实践_test.docx', subjectId: 5, name: '综合实践' },
  ];

  const results = {};
  let totalImported = 0;

  for (const file of files) {
    const result = await importSubject(file.path, file.subjectId, file.name);
    results[file.name] = result;
    if (result.success) totalImported += result.imported;
  }

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('导入总结');
  console.log('='.repeat(60));

  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      console.log(`✓ ${name}: 导入${result.imported}道题（解析${result.total}道）`);
    } else {
      console.log(`✗ ${name}: ${result.error}`);
    }
  });

  console.log(`\n总计: 成功导入 ${totalImported} 道题`);

  await pool.end();
}

importAll();
