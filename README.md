# 桂职测助手 - 广西单招刷题Web应用

> 基于 Next.js 16 + PostgreSQL 的职业技能测试刷题平台

## 📚 题库概况

当前题库包含以下5个科目：

| 科目 | 题目数量 | 模拟卷数量 |
|------|---------|----------|
| 信息技术 | 21道 | 1卷（10题） |
| 通用技术 | 12道 | 1卷（10题） |
| 美术 | 11道 | 1卷（10题） |
| 音乐 | 12道 | 1卷（10题） |
| 综合实践 | 11道 | 1卷（10题） |
| **合计** | **67道** | **5卷（50题）** |

> 注：当前为上线版本题库，后续可通过后台管理持续扩充

## ✨ 功能特性

### 用户端
- ✅ 每日免费刷题（5题，零点刷新）
- ✅ 专项练习（前9题免费，后续需VIP）
- ✅ 全真模拟卷（150分钟倒计时）
- ✅ 错题集功能
- ✅ VIP码激活系统

### 管理端
- ✅ 题库管理（支持Word导入）
- ✅ VIP码生成与管理
- ✅ 用户统计查看

---

## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问：http://localhost:5000

---

## 🌐 部署到公网

### 方式 1：GitHub + Vercel（推荐，免费）

#### 1. 推送代码到 GitHub
```bash
# 创建 GitHub 仓库
git remote add origin https://github.com/YOUR_USERNAME/guizhuci.git
git branch -M main
git push -u origin main
```

#### 2. 在 Vercel 导入
- 访问 https://vercel.com/new
- 导入 GitHub 仓库
- 点击 Deploy

#### 3. 完成！
访问地址：`https://guizhuci.vercel.app`

**详细指南**: [docs/FINAL_DEPLOYMENT_STEPS.md](docs/FINAL_DEPLOYMENT_STEPS.md)

### 方式 2：VPS 云服务器

购买云服务器后，执行：
```bash
# SSH 登录服务器
ssh root@YOUR_SERVER_IP

# 安装依赖
apt update && apt install -y nodejs npm git
npm install -g pnpm pm2

# 克隆代码
git clone https://github.com/YOUR_USERNAME/guizhuci.git
cd guizhuci

# 安装依赖并启动
pnpm install
pnpm build
pm2 start npm --name "guizhuci" -- start
```

**详细指南**: [docs/DEPLOYMENT_ALTERNATIVE.md](docs/DEPLOYMENT_ALTERNATIVE.md)

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [FINAL_DEPLOYMENT_STEPS.md](docs/FINAL_DEPLOYMENT_STEPS.md) | 部署完成指南（3步上线） |
| [DEPLOYMENT_ALTERNATIVE.md](docs/DEPLOYMENT_ALTERNATIVE.md) | 替代部署方案 |
| [VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md) | Vercel 详细指南 |
| [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) | 生产环境检查清单 |
| [QUESTION_IMPORT_GUIDE.md](docs/QUESTION_IMPORT_GUIDE.md) | 题库导入指南 |
| [VIP_MANAGEMENT_GUIDE.md](docs/VIP_MANAGEMENT_GUIDE.md) | VIP 管理指南 |

---

## 🛠️ 技术栈

- **前端**: Next.js 16, React 19, TypeScript 5
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL + Drizzle ORM
- **部署**: Vercel / VPS

---

## 📁 项目结构

```
.
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # 后台管理
│   │   ├── daily-free/   # 每日免费
│   │   ├── practice/     # 专项练习
│   │   ├── exam/         # 模拟考试
│   │   └── mistake/      # 错题集
│   ├── components/       # 组件
│   └── lib/             # 工具库
├── docs/                # 文档
├── scripts/             # 脚本
└── public/              # 静态资源
```

---

## 🔐 环境变量

创建 `.env.local` 文件：

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## 📝 开发指南

### 添加新页面
```bash
# 创建页面
mkdir -p src/app/new-page
touch src/app/new-page/page.tsx
```

### 数据库迁移
```bash
# 生成迁移
pnpm drizzle-kit generate

# 执行迁移
pnpm drizzle-kit migrate
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 📞 联系方式

如有问题，请提交 Issue 或联系开发团队。

---

**立即部署，让广西单招刷题神器上线！** 🚀
