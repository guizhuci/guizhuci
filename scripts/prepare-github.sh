#!/bin/bash

echo "======================================="
echo "  准备推送到 GitHub"
echo "======================================="
echo ""

# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    echo "✅ Git 仓库初始化完成"
    echo ""
fi

# 创建 .gitignore
echo "📝 创建 .gitignore 文件..."
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
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# logs
logs/
*.log
EOF

echo "✅ .gitignore 文件创建完成"
echo ""

# 添加所有文件
echo "➕ 添加所有文件到 Git..."
git add .
echo "✅ 文件添加完成"
echo ""

# 提交
echo "💾 提交代码..."
git commit -m "Initial commit: 桂职测助手 - 广西单招刷题Web应用"
echo "✅ 代码提交完成"
echo ""

echo "======================================="
echo "  ✅ 准备完成！"
echo "======================================="
echo ""
echo "下一步操作："
echo ""
echo "1️⃣  在 GitHub 上创建新仓库："
echo "   https://github.com/new"
echo ""
echo "2️⃣  添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）："
echo "   git remote add origin https://github.com/YOUR_USERNAME/guizhuci.git"
echo ""
echo "3️⃣  推送代码到 GitHub："
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4️⃣  在 Vercel 控制台导入项目："
echo "   https://vercel.com/new"
echo ""
echo "💡 提示："
echo "  - 更多详细信息请查看 docs/DEPLOYMENT_ALTERNATIVE.md"
echo "  - 如果遇到 GitHub 权限问题，请使用 SSH 方式："
echo "    git remote set-url origin git@github.com:YOUR_USERNAME/guizhuci.git"
echo ""
