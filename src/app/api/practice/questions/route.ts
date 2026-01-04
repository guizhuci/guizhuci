import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const subjectId = request.nextUrl.searchParams.get('subjectId');
    const userId = request.nextUrl.searchParams.get('userId');

    if (!subjectId || !userId) {
      return NextResponse.json({ success: false, error: '参数不完整' }, { status: 400 });
    }

    // 查询该科目下已答题目数量
    const answerCountResult = await pool.query(
      `SELECT COUNT(DISTINCT question_id) as count
       FROM answer_records
       WHERE user_id = $1 AND answer_mode = 'practice'
       AND question_id IN (SELECT id FROM questions WHERE subject_id = $2)`,
      [parseInt(userId), parseInt(subjectId)]
    );

    const answerCount = parseInt(answerCountResult.rows[0]?.count || '0');

    // 获取该科目下的所有题目
    const questionsResult = await pool.query(
      `SELECT q.id, q.question_text, q.options, q.answer, q.explanation
       FROM questions q
       WHERE q.subject_id = $1 AND q.is_active = true
       ORDER BY q.sort_order`,
      [parseInt(subjectId)]
    );

    return NextResponse.json({
      success: true,
      questions: questionsResult.rows.map(row => {
        // 处理options字段，支持多种格式：
        // 1. 已经解析的数组: ["选项1", "选项2", "选项3", "选项4"]
        // 2. 标准JSON字符串: '["选项1", "选项2", "选项3", "选项4"]'
        // 3. 简化格式字符串: '[选项1 选项2 选项3 选项4]'
        let options: string[] = [];
        if (row.options) {
          // 如果已经是数组，直接使用
          if (Array.isArray(row.options)) {
            options = row.options;
          } else if (typeof row.options === 'string') {
            try {
              // 尝试解析为JSON
              options = JSON.parse(row.options);
            } catch {
              // 如果JSON解析失败，尝试解析简化格式
              const cleanStr = row.options.trim().replace(/^\[|\]$/g, '');
              if (cleanStr) {
                // 使用空格分割，并处理可能的多余空格
                options = cleanStr.split(/\s+/).filter(opt => opt.trim());
              }
            }
          }
        }

        // 处理answer字段，移除"参考答案："前缀
        let answer = row.answer || '';
        if (typeof answer === 'string') {
          answer = answer.replace(/^参考答案[：:]\s*/i, '');
        }

        return {
          ...row,
          options,
          answer
        };
      }),
      answerCount
    });
  } catch (error) {
    console.error('获取练习题目失败:', error);
    console.error('错误详情:', JSON.stringify(error, null, 2));
    return NextResponse.json({ success: false, error: '服务器错误', details: String(error) }, { status: 500 });
  }
}
