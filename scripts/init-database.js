const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 创建表的 SQL 语句
const createTablesSQL = `
-- 科目表
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  major_category_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id),
  type VARCHAR(20) NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB,
  answer TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 模拟卷表
CREATE TABLE IF NOT EXISTS exam_papers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subject_id INTEGER REFERENCES subjects(id),
  duration INTEGER DEFAULT 150,
  total_score INTEGER DEFAULT 100,
  is_free BOOLEAN DEFAULT false,
  price NUMERIC(10, 2) DEFAULT 4.99,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 模拟卷题目关联表
CREATE TABLE IF NOT EXISTS exam_paper_questions (
  id SERIAL PRIMARY KEY,
  exam_paper_id INTEGER REFERENCES exam_papers(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  question_order INTEGER NOT NULL,
  score INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  openid VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  device_id VARCHAR(200),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 答题记录表
CREATE TABLE IF NOT EXISTS answer_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  exam_paper_id INTEGER REFERENCES exam_papers(id),
  user_answer TEXT,
  is_correct BOOLEAN,
  is_corrected BOOLEAN DEFAULT false,
  answer_mode VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 错题表
CREATE TABLE IF NOT EXISTS mistakes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  exam_paper_id INTEGER REFERENCES exam_papers(id),
  source VARCHAR(50),
  subject_id INTEGER REFERENCES subjects(id),
  first_mistake_at TIMESTAMP DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  is_mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- VIP码表
CREATE TABLE IF NOT EXISTS vip_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  target_id INTEGER,
  is_used BOOLEAN DEFAULT false,
  used_by INTEGER REFERENCES users(id),
  used_at TIMESTAMP,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  target_id INTEGER,
  amount NUMERIC(10, 2),
  status VARCHAR(20) DEFAULT 'paid',
  payment_method VARCHAR(20) DEFAULT 'vip_code',
  valid_until DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 资讯表
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  content TEXT,
  cover_image VARCHAR(500),
  source VARCHAR(100),
  source_url VARCHAR(500),
  publish_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

// 初始化科目数据
const initSubjectsSQL = `
INSERT INTO subjects (name, category, sort_order) VALUES
  ('信息技术', 'single_recruitment', 1),
  ('通用技术', 'single_recruitment', 2),
  ('美术', 'single_recruitment', 3),
  ('音乐', 'single_recruitment', 4),
  ('综合实践', 'single_recruitment', 5)
ON CONFLICT DO NOTHING;
`;

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log('开始初始化数据库...\n');

    // 1. 创建表
    console.log('1. 创建数据库表...');
    await client.query(createTablesSQL);
    console.log('✓ 所有表创建完成\n');

    // 2. 初始化科目
    console.log('2. 初始化科目数据...');
    await client.query(initSubjectsSQL);
    console.log('✓ 科目数据初始化完成\n');

    // 3. 验证
    console.log('3. 验证数据...');
    const subjectsResult = await client.query('SELECT name FROM subjects ORDER BY sort_order');
    console.log('科目列表：');
    subjectsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.name}`);
    });

    console.log('\n✅ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
