#!/bin/bash

echo "======================================="
echo "  桂职测助手 - Vercel 一键部署脚本"
echo "======================================="
echo ""

# 检查是否已安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 正在安装 Vercel CLI..."
    pnpm add -g vercel
    echo "✅ Vercel CLI 安装完成"
    echo ""
fi

# 检查是否已登录
echo "🔐 检查登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel："
    echo "  执行命令: vercel login"
    echo "  然后重新运行此脚本"
    exit 1
fi

echo "✅ 已登录 Vercel"
echo ""

# 询问项目名称
read -p "请输入项目名称（默认: guizhuci）: " project_name
project_name=${project_name:-guizhuci}

echo ""
echo "======================================="
echo "  开始部署到 Vercel"
echo "======================================="
echo ""

# 执行部署
echo "🚀 正在部署..."
vercel --prod --yes --name "$project_name"

echo ""
echo "======================================="
echo "  ✅ 部署完成！"
echo "======================================="
echo ""
echo "📱 您的应用已成功部署！"
echo ""
echo "访问地址: https://$project_name.vercel.app"
echo "后台管理: https://$project_name.vercel.app/admin"
echo ""
echo "💡 提示："
echo "  - 修改代码后，执行 'vercel --prod' 即可更新部署"
echo "  - 更多信息请查看 docs/VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
