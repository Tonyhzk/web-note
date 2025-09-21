# 🐳 Docker镜像发布说明

## 📦 镜像信息

- **镜像名称**: `tonyhzk/web-note:1.0.0`
- **镜像大小**: 237MB
- **发布时间**: 2025年9月21日
- **Docker Hub地址**: https://hub.docker.com/r/tonyhzk/web-note

## ✨ 功能特性

### 🔐 安全功能
- **密码保护**: 应用启动需要密码验证
- **会话管理**: 支持7天记住密码功能
- **安全注销**: 随时可以安全退出

### 📝 笔记功能
- **Markdown编辑器**: 基于Vditor的强大编辑器
- **文件夹管理**: 支持创建、编辑、删除文件夹
- **笔记管理**: 创建、编辑、删除、搜索笔记
- **自动保存**: 编辑时自动保存功能
- **主题切换**: 支持亮色/暗色主题切换

### 🎨 界面特性
- **响应式设计**: 支持桌面和移动设备
- **现代化UI**: 美观的用户界面
- **主题同步**: 编辑器与界面主题同步

## 🚀 快速部署

### 方法一：使用Docker Compose（推荐）

1. **创建项目目录**:
   ```bash
   mkdir web-note && cd web-note
   ```

2. **创建docker-compose.yml**:
   ```yaml
   services:
     web:
       image: tonyhzk/web-note:1.0.0
       ports:
         - "8080:8080"
       volumes:
         - ./data:/app/data
       environment:
         - APP_PASSWORD=${APP_PASSWORD:-admin123}
         - SECRET_KEY=${SECRET_KEY:-your-secret-key-change-in-production}
       restart: unless-stopped
   ```

3. **创建.env文件**（可选）:
   ```bash
   # 应用密码（请修改为您的密码）
   APP_PASSWORD=your_password_here
   
   # 会话密钥（请使用随机长字符串）
   SECRET_KEY=your_random_secret_key_here
   ```

4. **启动应用**:
   ```bash
   docker compose up -d
   ```

### 方法二：直接使用Docker

```bash
# 创建数据目录
mkdir -p ./data

# 运行容器
docker run -d \
  --name web-note \
  -p 8080:8080 \
  -v ./data:/app/data \
  -e APP_PASSWORD=admin123 \
  -e SECRET_KEY=your-secret-key \
  --restart unless-stopped \
  tonyhzk/web-note:1.0.0
```

## 🔧 配置说明

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `APP_PASSWORD` | `admin123` | 应用访问密码 |
| `SECRET_KEY` | `your-secret-key-change-in-production` | 会话加密密钥 |

### 端口映射

- **容器端口**: 8080
- **建议映射**: 8080:8080

### 数据持久化

- **容器路径**: `/app/data`
- **建议映射**: `./data:/app/data`

## 🌐 访问应用

1. **打开浏览器**: 访问 `http://localhost:8080`
2. **输入密码**: 默认密码为 `admin123`
3. **开始使用**: 创建文件夹和笔记

## 🔒 安全建议

### 生产环境配置

1. **修改默认密码**:
   ```bash
   APP_PASSWORD=your_strong_password_here
   ```

2. **使用强密钥**:
   ```bash
   SECRET_KEY=your_random_long_secret_key_here_at_least_32_characters
   ```

3. **使用HTTPS**: 在生产环境中建议使用反向代理配置HTTPS

### 密码要求建议
- 至少8个字符
- 包含大小写字母、数字和特殊字符
- 避免使用常见密码

## 📊 系统要求

- **Docker**: 20.10+
- **内存**: 最少512MB
- **存储**: 最少1GB可用空间
- **网络**: 需要访问Docker Hub（首次拉取）

## 🔄 更新升级

### 更新到新版本

1. **停止当前容器**:
   ```bash
   docker compose down
   ```

2. **拉取新版本**:
   ```bash
   docker pull tonyhzk/web-note:latest
   ```

3. **更新docker-compose.yml**:
   ```yaml
   image: tonyhzk/web-note:latest
   ```

4. **重新启动**:
   ```bash
   docker compose up -d
   ```

### 备份数据

```bash
# 备份数据目录
tar -czf web-note-backup-$(date +%Y%m%d).tar.gz ./data
```

## 🐛 故障排除

### 常见问题

**Q: 无法访问应用？**
```bash
# 检查容器状态
docker ps

# 查看容器日志
docker logs web-note
```

**Q: 忘记密码？**
```bash
# 修改环境变量重新启动
docker compose down
# 编辑.env文件或docker-compose.yml
docker compose up -d
```

**Q: 数据丢失？**
- 确保正确映射了数据卷
- 检查./data目录是否存在

## 📞 技术支持

- **Docker Hub**: https://hub.docker.com/r/tonyhzk/web-note
- **镜像大小**: 237MB
- **基础镜像**: python:3.10-slim

---

**🎉 感谢使用 Web Note！一个安全、美观、功能完整的Markdown笔记应用！**