# 快速部署到 Vercel

## 第一步：准备数据库

### 1. 创建 Supabase 数据库（免费）

1. 访问 https://supabase.com 并注册
2. 创建新项目（Project）
3. 项目创建完成后，进入 Settings → Database
4. 复制 "Connection string" → "URI" 格式
5. 保存连接字符串（格式如：`postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`）

### 2. 初始化数据库

在本地执行以下命令：

```bash
# 设置数据库连接字符串（替换为您的实际连接字符串）
export DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# 运行数据库初始化脚本
node scripts/init-database.js
```

如果成功，您会看到：
```
开始初始化数据库...

1. 创建数据库表...
✓ 所有表创建完成

2. 初始化科目数据...
✓ 科目数据初始化完成

3. 验证数据...
科目列表：
  1. 信息技术
  2. 通用技术
  3. 美术
  4. 音乐
  5. 综合实践

✅ 数据库初始化完成！
```

---

## 第二步：部署到 Vercel

### 1. 导入项目

1. 访问 https://vercel.com/new
2. 使用 GitHub 账号登录
3. 找到 `guizhuci` 仓库，点击 "Import"

### 2. 配置环境变量

在 Vercel 项目配置页面：

1. 点击 "Environment Variables"
2. 添加环境变量：
   - Name: `DATABASE_URL`
   - Value: 粘贴您的 Supabase 连接字符串（不含方括号）
3. 点击 "Add"

### 3. 部署

点击页面底部的 "Deploy" 按钮，等待 2-5 分钟。

部署成功后，您会看到：
```
✅ Production: https://guizhuci.vercel.app
```

---

## 第三步：导入题库

部署完成后：

1. 访问后台管理：https://guizhuci.vercel.app/admin
2. 使用默认账号登录：`admin` / `admin123`
3. 在"题库管理"中导入题目数据

---

## 验证部署

访问以下地址验证功能：

- 前端首页：https://guizhuci.vercel.app
- 科目API：https://guizhuci.vercel.app/api/subjects
- 后台管理：https://guizhuci.vercel.app/admin

---

## 更新代码

后续修改代码后：

```bash
git add .
git commit -m "update: xxx"
git push
```

Vercel 会自动检测到推送并重新部署。

---

## 常见问题

### Q: 部署后页面显示数据库错误？

A: 检查以下内容：
1. Vercel 环境变量中的 `DATABASE_URL` 是否正确
2. 数据库表是否已创建（运行 `node scripts/init-database.js`）

### Q: 如何查看部署日志？

A: 在 Vercel 控制台 → 项目 → Deployments → 选择部署 → 查看日志

### Q: 数据库连接字符串格式？

A: 
```
postgresql://postgres.xxxx:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```
将 `[YOUR_PASSWORD]` 替换为您的实际密码。

---

## 成功标志

部署成功后，您应该能够：
- ✅ 打开首页并看到应用界面
- ✅ 查看科目列表
- ✅ 进行刷题练习
- ✅ 使用后台管理系统

---

**详细部署指南**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
