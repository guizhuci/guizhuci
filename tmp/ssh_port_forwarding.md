# SSH 端口转发指南

## 问题说明
如果你通过SSH远程连接到服务器，想在本地浏览器访问服务器上的服务，需要配置SSH端口转发。

## 解决方案

### 方案1：SSH 端口转发（推荐）

**在本地终端执行：**
```bash
ssh -L 5000:localhost:5000 your_server_username@your_server_ip
```

**示例：**
```bash
ssh -L 5000:localhost:5000 root@192.168.1.100
```

然后在**本地浏览器**访问：
```
http://localhost:5000/admin
```

### 方案2：配置 SSH Config（永久配置）

编辑 `~/.ssh/config` 文件：
```
Host my-server
    HostName your_server_ip
    User your_username
    LocalForward 5000 localhost:5000
```

然后连接：
```bash
ssh my-server
```

### 方案3：使用 VS Code 远程开发

如果你使用 VS Code Remote SSH：
1. 打开 VS Code 设置 (Ctrl+,)
2. 搜索 "Remote.SSH: Local Server Listen On Socket"
3. 确保已安装 SSH 扩展
4. 连接后，在 VS Code 中使用"简单浏览器"扩展查看

### 方案4：如果使用 Coze/Coder 平台

查找以下内容：
1. 平台界面上的"预览"或"Preview"按钮
2. 点击后会自动打开浏览器并配置好访问
3. 不需要手动配置端口转发

### 方案5：修改 Next.js 配置监听 0.0.0.0

修改启动脚本：

```bash
# 编辑 .cozeproj/scripts/dev_run.sh
# 将命令改为：
pnpm run dev --port 5000 --hostname 0.0.0.0
```

然后可以直接用服务器IP访问：
```
http://server_ip:5000/admin
```

## 验证命令

**在服务器上验证服务：**
```bash
curl http://localhost:5000/admin
```

**在本地验证（配置端口转发后）：**
```bash
curl http://localhost:5000/admin
```

## 常见问题

### Q: curl 可以访问，但浏览器不行？
A: 浏览器可能配置了代理或缓存，尝试：
- 清除浏览器缓存
- 使用无痕模式
- 检查浏览器代理设置

### Q: SSH 连接断了，端口转发也失效了？
A: 使用 autossh 保持连接：
```bash
autossh -M 0 -o "ServerAliveInterval 30" -o "ServerAliveCountMax 3" -L 5000:localhost:5000 user@server
```

### Q: 端口被占用怎么办？
A: 使用其他端口：
```bash
ssh -L 8080:localhost:5000 user@server
```
然后访问 `http://localhost:8080/admin`

## 下一步

1. 确认你是通过SSH连接到服务器的
2. 按照上述方法配置端口转发
3. 在本地浏览器访问 http://localhost:5000/admin

如果使用云平台（Coze/Coder等），直接使用平台提供的预览功能即可。
