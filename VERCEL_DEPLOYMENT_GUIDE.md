# Vercel 部署完整指南

## 前置准备

### 1. 准备数据库

#### 选项A：使用 Supabase（推荐）

1. **注册 Supabase**
   - 访问：https://supabase.com
   - 使用 GitHub 账号登录
   - 点击 "New Project"

2. **创建项目**
   - Name: `guizhuci`
   - Database Password: 设置一个强密码（记住这个密码）
   - Region: 选择 Southeast Asia (Singapore)
   - 点击 "Create new project"

3. **获取数据库连接字符串**
   - 等待项目创建完成（约2分钟）
   - 进入项目：Settings → Database
   - 找到 "Connection string"
   - 选择 "URI" 格式
   - 复制连接字符串，格式如：
     ```
     postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```
   - 将 `[PASSWORD]` 替换为您设置的数据库密码

#### 选项B：使用 Neon

1. **注册 Neon**
   - 访问：https://neon.tech
   - 点击 "Sign up"
   - 使用 GitHub 账号登录

2. **创建项目**
   - 项目名：`guizhuci`
   - 选择区域：Singapore
   - 点击 "Create project"

3. **获取连接字符串**
   - 创建完成后，复制连接字符串
   - 格式如：`postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`

---

## Vercel 部署步骤

### 步骤 1：访问 Vercel

1. 打开浏览器，访问：https://vercel.com/new
2. 使用 GitHub 账号登录

### 步骤 2：导入项目

1. 在 "Import Git Repository" 页面
2. 找到 `guizhuci` 仓库
3. 点击 "Import"

### 步骤 3：配置项目

在项目配置页面，设置以下内容：

#### 基础配置
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 环境变量（重要！）

1. 点击 "Environment Variables"
2. 添加以下环境变量：

```
Name: DATABASE_URL
Value: postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**说明**：
- 替换为您的实际数据库连接字符串
- 不要包含方括号 `[]`

#### 数据库初始化

由于Vercel每次部署都是全新的环境，需要创建数据库表。有两种方式：

**方式1：使用 Drizzle Kit（推荐）**

在 `package.json` 中添加：
```json
{
  "scripts": {
    "db:push": "drizzle-kit push"
  }
}
```

然后在本地执行：
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**方式2：创建初始化脚本**

创建 `scripts/init-db.ts`：
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/storage/database/shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

const db = drizzle(pool, { schema });

// 推送 schema 到数据库
import { push } from 'drizzle-kit';
await push({ config: './drizzle.config.ts' });
```

### 步骤 4：部署

1. 点击页面底部的 "Deploy" 按钮
2. 等待 2-5 分钟，构建和部署
3. 部署完成后，会看到：
   ```
   ✅ Production: https://guizhuci.vercel.app
   ```

### 步骤 5：验证部署

访问以下地址验证：
- 前端首页：https://guizhuci.vercel.app
- 科目列表：https://guizhuci.vercel.app/api/subjects
- 后台管理：https://guizhuci.vercel.app/admin

---

## 部署后配置

### 1. 数据库表创建

部署完成后，需要创建数据库表。在本地执行：

```bash
# 设置环境变量
export DATABASE_URL="您的Supabase连接字符串"

# 推送数据库 schema
npx drizzle-kit push --config=drizzle.config.ts
```

或者创建一个初始化脚本在 Vercel 部署时自动执行。

### 2. 导入题库

1. 访问后台：https://guizhuci.vercel.app/admin
2. 使用默认账号登录：admin / admin123
3. 在题库管理中导入题目

### 3. 生成 VIP 码

在后台生成测试码，用于测试VIP功能。

---

## 常见问题

### Q1: 部署失败，提示数据库连接错误

**A**:
1. 检查 `DATABASE_URL` 是否正确
2. 确保数据库密码中不包含特殊字符，或进行URL编码
3. 检查 Supabase/Neon 的连接池设置

### Q2: 页面显示 "Server Error" 500

**A**:
1. 查看 Vercel 的部署日志
2. 检查数据库表是否创建
3. 检查环境变量是否正确

### Q3: 如何查看部署日志？

**A**:
1. 访问 Vercel 控制台
2. 进入项目 → Deployments
3. 点击最新的部署
4. 查看 "Build Logs" 或 "Function Logs"

### Q4: 数据库表如何创建？

**A**:
在本地执行以下命令（先设置 DATABASE_URL）：
```bash
npx drizzle-kit push
```

或在 Supabase/Neon 控制台手动执行 SQL。

---

## 快速检查清单

部署前检查：
- [ ] 已创建云数据库（Supabase 或 Neon）
- [ ] 已复制数据库连接字符串
- [ ] 代码已推送到 GitHub
- [ ] `package.json` 中的依赖完整

部署中检查：
- [ ] Vercel 项目配置正确
- [ ] DATABASE_URL 环境变量已添加
- [ ] 构建成功，无错误

部署后检查：
- [ ] 前端页面可访问
- [ ] API 接口正常返回数据
- [ ] 数据库表已创建
- [ ] 可以正常登录和使用

---

## 更新部署

后续更新代码时：

```bash
# 1. 修改代码
git add .
git commit -m "feat: xxx"

# 2. 推送到 GitHub
git push

# 3. Vercel 会自动部署
# 或在 Vercel 控制台手动触发
```

---

## 自定义域名（可选）

1. 在 Vercel 项目设置中
2. Domains → Add Domain
3. 输入您的域名（如 `guizhuci.com`）
4. 配置 DNS 记录

---

## 成功标志

部署成功后，您应该能看到：
- ✅ 前端页面正常显示
- ✅ 5个科目列表正常
- ✅ 可以进行刷题练习
- ✅ 模拟卷功能正常
- ✅ 错题集功能正常

---

## 需要帮助？

- Vercel 文档：https://vercel.com/docs
- Supabase 文档：https://supabase.com/docs
- Drizzle 文档：https://orm.drizzle.team

---

**祝您部署顺利！** 🎉
