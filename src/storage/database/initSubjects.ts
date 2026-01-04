import { getDb } from 'coze-coding-dev-sdk';
import { subjects } from './shared/schema';
import { eq } from 'drizzle-orm';

async function initSubjects() {
  const db = await getDb();

  const subjectList = [
    { name: '信息技术', category: '基础课', sortOrder: 1 },
    { name: '通用技术', category: '基础课', sortOrder: 2 },
    { name: '美术', category: '基础课', sortOrder: 3 },
    { name: '音乐', category: '基础课', sortOrder: 4 },
    { name: '综合实践', category: '基础课', sortOrder: 5 },
  ];

  for (const subject of subjectList) {
    try {
      const existing = await db.select().from(subjects).where(eq(subjects.name, subject.name)).limit(1);
      if (existing.length === 0) {
        await db.insert(subjects).values(subject);
        console.log(`✓ 已创建科目: ${subject.name}`);
      } else {
        console.log(`- 科目已存在: ${subject.name}`);
      }
    } catch (error) {
      console.error(`✗ 创建科目失败: ${subject.name}`, error);
    }
  }

  console.log('\n科目初始化完成！');
  process.exit(0);
}

initSubjects();
