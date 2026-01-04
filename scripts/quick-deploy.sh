#!/bin/bash

# 桂职测助手 - 快速部署脚本
# 使用方法: bash scripts/quick-deploy.sh

echo "=========================================="
echo "  桂职测助手 - 快速部署工具"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查命令是否存在
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 打印成功信息
print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

# 打印警告信息
print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# 打印错误信息
print_error() {
  echo -e "${RED}✗${NC} $1"
}

# 检查 Node.js
echo "1. 检查开发环境..."
if command_exists node; then
  NODE_VERSION=$(node --version)
  print_success "Node.js 已安装: $NODE_VERSION"
else
  print_error "未安装 Node.js，请先安装 Node.js 18+"
  exit 1
fi

if command_exists pnpm; then
  PNPM_VERSION=$(pnpm --version)
  print_success "pnpm 已安装: $PNPM_VERSION"
else
  print_warning "未安装 pnpm，正在安装..."
  npm install -g pnpm
fi

echo ""

# 检查环境变量
echo "2. 检查环境变量..."
if [ -f ".env.local" ]; then
  print_success ".env.local 文件存在"
else
  print_warning ".env.local 文件不存在"
  echo "请创建 .env.local 文件，内容如下："
  echo ""
  cat << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/gzctest
EOF
  echo ""
  read -p "是否现在创建 .env.local 文件？(y/n): " create_env
  if [ "$create_env" = "y" ]; then
    cat > .env.local << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/gzctest
EOF
    print_success "已创建 .env.local 文件"
    print_warning "请修改 DATABASE_URL 为实际的数据库连接字符串"
  fi
fi

echo ""

# 安装依赖
echo "3. 安装依赖..."
pnpm install
if [ $? -eq 0 ]; then
  print_success "依赖安装成功"
else
  print_error "依赖安装失败"
  exit 1
fi

echo ""

# 构建项目
echo "4. 构建项目..."
pnpm run build
if [ $? -eq 0 ]; then
  print_success "项目构建成功"
else
  print_error "项目构建失败"
  exit 1
fi

echo ""

# 选择部署平台
echo "5. 选择部署平台..."
echo "  [1] Vercel (推荐，免费，快速)"
echo "  [2] 本地预览"
echo "  [3] 退出"
echo ""
read -p "请选择 (1-3): " deploy_choice

case $deploy_choice in
  1)
    echo ""
    echo "=========================================="
    echo "  部署到 Vercel"
    echo "=========================================="
    echo ""

    # 检查 Vercel CLI
    if command_exists vercel; then
      print_success "Vercel CLI 已安装"
    else
      echo "正在安装 Vercel CLI..."
      pnpm add -g vercel
    fi

    echo ""
    print_warning "请按照提示完成 Vercel 登录和部署配置"
    echo ""
    echo "重要提示："
    echo "1. 首次部署需要登录 Vercel 账号"
    echo "2. 需要配置环境变量 DATABASE_URL"
    echo "3. 建议连接 Supabase 等云数据库"
    echo ""
    read -p "按回车继续..." -r

    vercel --prod
    ;;

  2)
    echo ""
    echo "=========================================="
    echo "  本地预览"
    echo "=========================================="
    echo ""
    print_success "启动本地开发服务器..."
    echo ""
    echo "访问地址: http://localhost:5000"
    echo ""
    echo "按 Ctrl+C 停止服务"
    echo ""

    pnpm run dev
    ;;

  3)
    echo ""
    echo "部署已取消"
    exit 0
    ;;

  *)
    echo ""
    print_error "无效选择"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 访问应用并测试核心功能"
echo "2. 导入题库数据（通过后台管理系统）"
echo "3. 生成 VIP 码（通过后台管理系统）"
echo "4. 准备推广物料和活动"
echo ""
echo "详细上线指南请查看: docs/DEPLOYMENT_CHECKLIST.md"
echo ""
