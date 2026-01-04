# Vercel 部署 - 替代方案

## 问题说明

在沙箱环境中，Vercel CLI 的登录需要浏览器交互，无法直接完成。

---

## ✅ 推荐方案：使用 GitHub + Vercel 控制台部署（最简单）

### 步骤 1：推送代码到 GitHub

#### 1.1 初始化 Git 仓库
```bash
cd /workspace/projects/
git init
```

#### 1.2 创建 .gitignore 文件
```bash
cat > .gitignore << 'EOF'
# dependencies
node_modules/
.pnpm-store/

# next.js
.next/
out/

# production
build/
dist/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# logs
logs/
*.log
EOF
```

#### 1.3 添加并提交代码
```bash
git add .
git commit -m "Initial commit: 桂职测助手"
```

#### 1.4 创建 GitHub 仓库并推送
```bash
# 替换为您的 GitHub 用户名和仓库名
git remote add origin https://github.com/YOUR_USERNAME/guizhuci.git
git branch -M main
git push -u origin main
```

### 步骤 2：在 Vercel 控制台导入项目

1. **访问 Vercel**：https://vercel.com
2. **登录账号**：使用 GitHub/Google/GitLab 登录
3. **新建项目**：
   - 点击 "Add New" → "Project"
   - 选择 "Continue with GitHub"
4. **导入仓库**：
   - 找到 `guizhuci` 仓库
   - 点击 "Import"
5. **配置项目**：
   - Framework Preset: Next.js
   - Root Directory: `./` (默认)
   - Build Command: `npm run build` (默认)
   - Output Directory: `.next` (默认)
   - 点击 "Deploy"

### 步骤 3：等待部署完成
部署过程大约需要 2-5 分钟，完成后会显示：
```
✅ Production: https://guizhuci.vercel.app
```

---

## 方案 2：使用 Vercel Token 部署（需要手动获取 token）

### 步骤 1：获取 Vercel Token

1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 输入 Token 名称（如 "Deployment Token"）
4. 选择权限范围（建议 "Full Account"）
5. 点击 "Create"
6. **复制 Token**（只显示一次，请妥善保存）

### 步骤 2：使用 Token 登录

```bash
export PNPM_HOME="/root/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# 使用 token 登录
vercel login --token YOUR_TOKEN_HERE
```

### 步骤 3：执行部署

```bash
vercel --prod --yes
```

---

## 方案 3：在本地计算机部署（推荐新手）

如果您有本地计算机，可以直接在本地执行：

### 1. 安装 Node.js
下载安装：https://nodejs.org/

### 2. 克隆项目代码
```bash
# 如果您有 GitHub 仓库
git clone https://github.com/YOUR_USERNAME/guizhuci.git
cd guizhuci

# 或者直接从当前沙箱复制代码
```

### 3. 安装依赖
```bash
pnpm install
```

### 4. 部署到 Vercel
```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

---

## 方案 4：使用 VPS 云服务器（替代方案）

如果不想用 Vercel，可以使用云服务器部署：

### 推荐服务商
- 阿里云轻量应用服务器：https://www.aliyun.com/product/swas
- 腾讯云轻量应用服务器：https://cloud.tencent.com/product/lighthouse

### 部署步骤（以阿里云为例）

#### 1. 购买服务器
- 选择配置：2核 2G（约 ¥60/月）
- 选择系统：Ubuntu 22.04
- 购买后获得公网 IP（如 123.45.67.89）

#### 2. SSH 登录服务器
```bash
ssh root@123.45.67.89
```

#### 3. 安装 Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

#### 4. 安装 pnpm
```bash
npm install -g pnpm
```

#### 5. 克隆代码
```bash
cd /root
git clone https://github.com/YOUR_USERNAME/guizhuci.git
cd guizhuci
```

#### 6. 安装依赖并构建
```bash
pnpm install
pnpm build
```

#### 7. 安装 PM2（进程管理）
```bash
pnpm add -g pm2
```

#### 8. 启动应用
```bash
pm2 start npm --name "guizhuci" -- start
pm2 save
pm2 startup
```

#### 9. 访问应用
在浏览器访问：`http://123.45.67.89`

#### 10. 配置 Nginx（可选）
```bash
apt install -y nginx

# 编辑配置
nano /etc/nginx/sites-available/default

# 修改 location 部分
location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# 重启 Nginx
systemctl restart nginx
```

---

## 方案对比

| 方案 | 难度 | 费用 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| GitHub + Vercel | ⭐⭐ 简单 | 免费 | 有 GitHub 账号 | ⭐⭐⭐⭐⭐ |
| Vercel Token | ⭐⭐ 中等 | 免费 | 已有 Token | ⭐⭐⭐⭐ |
| 本地部署 | ⭐⭐⭐ 中等 | 免费 | 有本地开发环境 | ⭐⭐⭐ |
| VPS 云服务器 | ⭐⭐⭐⭐ 较难 | ¥50/月起 | 需要更多控制权 | ⭐⭐⭐ |

---

## 🎯 推荐方案（按优先级）

### 1️⃣ 首选：GitHub + Vercel（最简单）
- 优点：完全免费，操作简单，自动部署
- 缺点：需要 GitHub 账号
- 适合：大多数用户

### 2️⃣ 次选：本地部署到 Vercel
- 优点：有浏览器可以完成登录
- 缺点：需要本地环境
- 适合：有本地开发环境的用户

### 3️⃣ 备选：VPS 云服务器
- 优点：完全控制，可配置更多功能
- 缺点：需要购买服务器，配置较复杂
- 适合：需要更多控制权的用户

---

## 📝 后续步骤

部署成功后，您需要：

### 1. 配置数据库
如果您使用云数据库（如 Supabase），需要在 Vercel 项目中配置环境变量：
```
Settings → Environment Variables → Add New
Name: DATABASE_URL
Value: postgresql://...
```

### 2. 导入题库
访问后台管理：`https://guizhuci.vercel.app/admin`

### 3. 生成 VIP 码
在后台生成测试码、活动码、付费码

---

## ❓ 需要帮助？

如果遇到问题，请：
1. 查看 Vercel 官方文档：https://vercel.com/docs
2. 参考其他部署文档
3. 联系我协助解决

---

**祝您部署顺利！** 🚀
