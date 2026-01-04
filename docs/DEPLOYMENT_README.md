# 桂职测助手 - 部署指南

## 🎉 好消息！

您的桂职测助手应用**已经成功启动**，服务运行在本地沙箱环境中。

### 当前状态
- ✅ 应用已启动，运行正常
- ✅ 端口：5000
- ✅ 本地访问：`http://localhost:5000`
- ✅ 页面显示：桂职测助手 - 广西单招刷题神器

---

## ❓ 为什么"链接打不开"？

### 说明
当前应用运行在**沙箱本地环境**中：
- ✅ 沙箱内部可以访问
- ❌ 外部浏览器无法直接访问
- ❌ 需要部署到公网服务器才能让所有人访问

**这不需要注册域名！**

---

## 🚀 快速部署方案（推荐，完全免费）

### 方案：Vercel 部署

**优势**：
- ✅ **完全免费**
- ✅ **自动分配域名**（如 `https://guizhuci.vercel.app`）
- ✅ **无需注册域名**（可选绑定自定义域名）
- ✅ **自动 HTTPS**
- ✅ **全球 CDN 加速**
- ✅ **2-5分钟即可完成**

### 一键部署

#### 方法1：使用部署脚本（推荐）
```bash
bash scripts/deploy-vercel.sh
```

#### 方法2：手动部署
```bash
# 1. 安装 Vercel CLI
pnpm add -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

### 部署完成后的访问地址
```
前端首页: https://guizhuci.vercel.app
后台管理: https://guizhuci.vercel.app/admin
```

**这个地址可以让所有人访问了！** 🎉

---

## 📖 详细文档

| 文档 | 说明 |
|------|------|
| [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) | Vercel 详细部署指南 |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | 生产环境部署检查清单 |
| [QUICK_START.md](./QUICK_START.md) | 快速开始指南 |

---

## 💡 关于域名问题

### 不需要注册域名！

Vercel 会自动分配免费域名：
- `https://guizhuci.vercel.app`
- `https://your-app-name.vercel.app`

### 可选：绑定自定义域名

如果您有自己的域名（如 `guizhuci.com`），可以在 Vercel 中绑定：
1. 登录 Vercel 控制台
2. 选择项目 → Settings → Domains
3. 添加您的域名并配置 DNS

**注意**：
- 使用 `.vercel.app` 免费子域名：**完全免费**
- 绑定自定义域名：Vercel 免费，但域名需要您自己购买（约 ¥60-100/年）

---

## 🔧 本地访问方式

### 在沙箱内访问
```bash
# 沙箱内部访问
curl http://localhost:5000

# 或者启动浏览器（如果沙箱支持）
# open http://localhost:5000
```

### 查看应用页面
```bash
# 查看首页 HTML
curl -s http://localhost:5000 | grep -E "title|桂职测"
```

---

## 📊 部署方案对比

| 方案 | 费用 | 难度 | 域名 | HTTPS | 推荐度 |
|------|------|------|------|-------|--------|
| Vercel | 免费 | ⭐ 简单 | 自动分配 | ✅ 自动 | ⭐⭐⭐⭐⭐ |
| VPS | ¥50/月起 | ⭐⭐ 中等 | 需要IP访问 | 需手动配置 | ⭐⭐⭐ |
| VPS + 域名 | ¥50/月 + 域名费 | ⭐⭐⭐ 较难 | 自定义域名 | 需手动配置 | ⭐⭐⭐ |

---

## 🎯 推荐方案

### 试运营阶段
🎯 **强烈推荐：Vercel 部署**
- 完全免费
- 2-5分钟即可完成
- 自动获得公网访问地址
- 不需要服务器配置知识

### 正式运营
可迁移到 VPS + 域名，获得更多控制权。

---

## 📝 部署后需要做的

### 1. 配置数据库
如果使用云数据库（如 Supabase、Neon），需要在 Vercel 中配置环境变量：

在 Vercel 控制台：
```
Settings → Environment Variables → Add New
Name: DATABASE_URL
Value: postgresql://...
```

### 2. 导入题库数据
访问 `https://guizhuci.vercel.app/admin`，使用后台管理系统导入题库。

参考文档：[QUESTION_IMPORT_GUIDE.md](./QUESTION_IMPORT_GUIDE.md)

### 3. 生成 VIP 码
在后台管理系统中生成 VIP 码：
- 测试码（给测试用户使用）
- 活动码（推广活动使用）
- 付费码（销售使用）

参考文档：[VIP_MANAGEMENT_GUIDE.md](./VIP_MANAGEMENT_GUIDE.md)

---

## ❓ 常见问题

### Q1: Vercel 真的免费吗？
A: 是的，Vercel 的免费套餐足够小型项目使用。

### Q2: 部署后手机能访问吗？
A: 可以！部署后，在任何设备上都能通过域名访问。

### Q3: 我的数据安全吗？
A: Vercel 是知名平台，安全性高。建议使用环境变量存储敏感信息。

### Q4: 如何更新应用？
A: 修改代码后，执行 `vercel --prod` 即可更新。

---

## 🚀 立即开始部署

```bash
# 使用一键部署脚本
bash scripts/deploy-vercel.sh
```

**2分钟后，您的应用就能让所有人访问了！** 🎉

---

## 📞 需要帮助？

- 查看 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) 获取详细指南
- 查看其他文档了解功能配置

---

**祝您部署顺利！** 🎊
