# 快速访问指南

## 请告诉我：你是如何访问这个开发环境的？

### 情况1：SSH终端连接
在本地终端执行：
```bash
ssh -L 5000:localhost:5000 root@服务器IP
```
然后访问 http://localhost:5000/admin

### 情况2：VS Code Remote SSH
按F1 → 输入"Forward a Port" → 输入5000

### 情况3：Coze/Coder等云平台
查找页面上的"预览"按钮并点击

### 情况4：本地开发
直接访问 http://localhost:5000/admin

---

服务已确认正常运行（HTTP 200）。
