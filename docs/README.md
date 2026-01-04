# 桂职测助手 - 上线运营文档

> 🚀 快速上线？请查看 [QUICK_START.md](./QUICK_START.md)

## 📚 文档导航

### 快速开始
- **[QUICK_START.md](./QUICK_START.md)** - 30分钟快速上线指南（推荐先看）
- **[quick-deploy.sh](../scripts/quick-deploy.sh)** - 一键部署脚本

### 核心文档
| 文档 | 说明 | 适合谁 |
|------|------|--------|
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | 完整的上线检查清单和指南 | 首次上线 |
| [QUESTION_IMPORT_GUIDE.md](./QUESTION_IMPORT_GUIDE.md) | 题库导入详细指南和格式要求 | 内容准备 |
| [VIP_MANAGEMENT_GUIDE.md](./VIP_MANAGEMENT_GUIDE.md) | VIP码生成、定价、销售策略 | 运营管理 |

### 配置文件
- **[.env.example](../.env.example)** - 环境变量配置模板
- **[package.json](../package.json)** - 项目依赖和脚本命令

---

## 🎯 文档使用建议

### 我是首次上线，不知道从哪开始？

**推荐阅读顺序**：
1. 先看 [QUICK_START.md](./QUICK_START.md) - 了解快速上线路径
2. 再看 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 完整检查清单
3. 准备题库时看 [QUESTION_IMPORT_GUIDE.md](./QUESTION_IMPORT_GUIDE.md)
4. 准备运营时看 [VIP_MANAGEMENT_GUIDE.md](./VIP_MANAGEMENT_GUIDE.md)

### 我想快速测试产品？

**快速测试步骤**：
```bash
# 1. 启动本地服务
pnpm run dev

# 2. 导入测试题库（查看 QUESTION_IMPORT_GUIDE.md）
# 访问 http://localhost:5000/admin

# 3. 生成测试VIP码
# 在后台管理系统中生成

# 4. 测试核心功能
# 登录 -> 刷题 -> 激活VIP
```

### 我要正式上线部署？

**部署步骤**：
1. 选择部署平台：Vercel（推荐）或 云服务器
2. 配置数据库：Supabase（推荐）或 云数据库
3. 设置环境变量：参考 [.env.example](../.env.example)
4. 执行部署：
   - Vercel: `vercel --prod`
   - 云服务器: 参考 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
5. 验证部署：访问域名，测试功能

---

## 🚀 上线路径选择

### 路径A：快速试运行（1-2天）
**适合**：小规模验证市场

```bash
# 1. 使用本地或 Vercel 快速部署
bash scripts/quick-deploy.sh

# 2. 导入 50 道测试题

# 3. 生成 20 个测试VIP码

# 4. 朋友圈/小范围试运行
```

### 路径B：正式上线（3-5天）
**适合**：正式运营，追求规模

```bash
# 1. 导入 300+ 道完整题库

# 2. 生成 100+ VIP码

# 3. 准备推广物料

# 4. 多渠道推广上线
```

### 路径C：完善运营（1-2周）
**适合**：长期运营，打造品牌

```bash
# 1. 导入 500+ 道题目

# 2. 搭建运营团队

# 3. 系统化推广

# 4. 持续优化迭代
```

---

## 💡 常见问题

### Q1: 数据库用哪个好？

**推荐：Supabase**
- 免费：500MB
- 简单：可视化界面
- 快速：无需配置

**备选：阿里云/腾讯云RDS**
- 稳定：企业级服务
- 灵活：可扩展
- 成本：50-200元/月

### Q2: 部署用哪个平台？

**推荐：Vercel**
- 免费：100GB带宽/月
- 简单：一键部署
- 快速：全球CDN

**备选：云服务器**
- 自由：完全控制
- 稳定：国内访问快
- 成本：50-100元/月

### Q3: 题库从哪里找？

**推荐来源**：
1. 广西单招历年真题
2. 各培训机构模拟卷
3. 教材课后习题
4. 网络整理资源

**详细说明**：查看 [QUESTION_IMPORT_GUIDE.md](./QUESTION_IMPORT_GUIDE.md)

### Q4: VIP怎么定价？

**推荐定价**：
- 月卡：39 元（2元/天）
- 季卡：79 元（0.9元/天）
- 年卡：199 元（0.5元/天）

**定价策略**：查看 [VIP_MANAGEMENT_GUIDE.md](./VIP_MANAGEMENT_GUIDE.md)

---

## 📊 数据监控指标

### 核心指标
| 指标 | 说明 | 目标值 |
|------|------|--------|
| DAU | 日活跃用户 | 100-500 |
| VIP激活率 | 注册用户中VIP占比 | 10-30% |
| 日刷题量 | 每日答题总数 | 500-2000 |
| 7日留存 | 7天后仍活跃比例 | 40-60% |
| 日收入 | 每日VIP销售额 | 300-1000元 |

### 监控方式
```sql
-- 每日用户统计
SELECT DATE(created_at) as date, COUNT(*) as users
FROM users
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;

-- VIP激活统计
SELECT DATE(used_at) as date, COUNT(*) as vip_count
FROM vip_codes
WHERE status = 'used'
GROUP BY DATE(used_at)
ORDER BY date DESC
LIMIT 7;

-- 答题统计
SELECT DATE(created_at) as date, COUNT(*) as answer_count
FROM answer_records
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
```

---

## 🔧 技术栈说明

### 前端
- Next.js 16 (React 19)
- TypeScript 5
- Tailwind CSS 4

### 后端
- Next.js API Routes
- PostgreSQL

### 部署
- Vercel / 云服务器
- Supabase / 云数据库

---

## 📞 获取帮助

### 技术问题
1. 查看项目 README.md
2. 查看各文档的常见问题部分
3. 查看日志：`npm run dev`

### 运营问题
1. 查看 [VIP_MANAGEMENT_GUIDE.md](./VIP_MANAGEMENT_GUIDE.md)
2. 查看 [QUESTION_IMPORT_GUIDE.md](./QUESTION_IMPORT_GUIDE.md)
3. 查看完整 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### 数据库问题
1. 检查 .env.local 中的 DATABASE_URL
2. 检查数据库服务是否运行
3. 查看 Supabase/云数据库文档

---

## 📈 迭代计划

### V1.1（预计2周后）
- [ ] 增加题目收藏功能
- [ ] 优化题目搜索
- [ ] 添加学习报告

### V1.2（预计1个月后）
- [ ] 社区讨论区
- [ ] 每日一练
- [ ] 学习排行榜

### V2.0（预计3个月后）
- [ ] 对口刷题模块
- [ ] AI智能推荐
- [ ] 直播答疑

### V3.0（预计6个月后）
- [ ] 志愿填报
- [ ] 院校信息
- [ ] 分数预测

---

## ✅ 文档更新日志

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2025-01-04 | 1.0 | 初始版本，包含核心上线文档 |

---

**祝你上线顺利，生意兴隆！** 🎉
