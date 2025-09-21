# 🗒️ Web Note - Markdown笔记应用

一个功能完整、安全可靠的Markdown笔记应用，支持密码保护、主题切换、文件夹管理等功能。

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

## ✨ 功能特性

### 🔐 安全功能
- **密码保护**: 应用启动需要密码验证
- **会话管理**: 支持7天记住密码功能
- **安全注销**: 随时可以安全退出
- **数据加密**: 会话数据安全加密存储

### 📝 笔记功能
- **Markdown编辑器**: 基于Vditor的强大编辑器
- **文件夹管理**: 支持创建、编辑、删除文件夹
- **笔记管理**: 创建、编辑、删除、搜索笔记
- **自动保存**: 编辑时自动保存功能
- **全文搜索**: 快速搜索笔记内容

### 🎨 界面特性
- **响应式设计**: 支持桌面和移动设备
- **主题切换**: 支持亮色/暗色主题切换
- **现代化UI**: 美观的用户界面
- **主题同步**: 编辑器与界面主题同步

## 🚀 快速开始

### 使用Docker（推荐）

#### 方法一：Docker Compose
```bash
# 克隆仓库
git clone https://github.com/tonyhzk/web-note.git
cd web-note

# 启动应用
docker compose up -d
```

#### 方法二：直接使用Docker镜像
```bash
# 拉取并运行最新版本
docker run -d \
  --name web-note \
  -p 8080:8080 \
  -v ./data:/app/data \
  -e APP_PASSWORD=admin123 \
  --restart unless-stopped \
  tonyhzk/web-note:latest
```

### 本地开发

#### 环境要求
- Python 3.10+
- Node.js（可选，用于前端开发）

#### 安装步骤
```bash
# 克隆仓库
git clone https://github.com/tonyhzk/web-note.git
cd web-note

# 安装Python依赖
pip install -r requirements.txt

# 设置环境变量
export APP_PASSWORD=admin123
export SECRET_KEY=your-secret-key

# 运行应用
python run.py
```

## 🔧 配置说明

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `APP_PASSWORD` | `admin123` | 应用访问密码 |
| `SECRET_KEY` | `your-secret-key-change-in-production` | 会话加密密钥 |

### Docker Compose配置

```yaml
services:
  web:
    image: tonyhzk/web-note:latest
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
    environment:
      - APP_PASSWORD=${APP_PASSWORD:-admin123}
      - SECRET_KEY=${SECRET_KEY:-your-secret-key-change-in-production}
    restart: unless-stopped
```

## 🌐 访问应用

1. **打开浏览器**: 访问 `http://localhost:8080`
2. **输入密码**: 默认密码为 `admin123`
3. **开始使用**: 创建文件夹和笔记

## 📊 技术栈

### 后端
- **Python 3.10**: 主要编程语言
- **Flask**: Web框架
- **SQLAlchemy**: ORM数据库操作
- **SQLite**: 数据库
- **Gunicorn**: WSGI服务器

### 前端
- **Vanilla JavaScript**: 前端逻辑
- **Vditor**: Markdown编辑器
- **Font Awesome**: 图标库
- **CSS3**: 样式和主题

### 部署
- **Docker**: 容器化部署
- **Docker Compose**: 编排工具

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

## 📁 项目结构

```
web-note/
├── frontend/                 # 前端文件
│   ├── index.html           # 主页面
│   ├── app.js               # 主要JavaScript逻辑
│   ├── styles.css           # 样式文件
│   └── res/                 # 资源文件
│       ├── vditor/          # Vditor编辑器
│       └── font-awesome/    # 图标库
├── data/                    # 数据目录
│   └── notepad.db          # SQLite数据库
├── run.py                   # 主应用文件
├── requirements.txt         # Python依赖
├── Dockerfile              # Docker构建文件
├── docker-compose.yml      # Docker Compose配置
├── .env                    # 环境变量配置
└── README.md               # 项目说明
```

## 🔄 版本历史

### v1.0.1 (2025-09-21)
- 🐛 修复登出功能无响应的问题
- ✅ 添加登出按钮事件监听器

### v1.0.0 (2025-09-21)
- ✨ 首次发布
- 🔐 密码保护功能
- 📝 完整的笔记管理功能
- 🎨 主题切换功能
- 🐳 Docker容器化部署

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

**Q: 登出按钮无响应？**
- 确保使用v1.0.1或更高版本
- 检查浏览器控制台是否有错误

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **Docker Hub**: https://hub.docker.com/r/tonyhzk/web-note
- **GitHub**: https://github.com/tonyhzk/web-note

---

**🎉 感谢使用 Web Note！一个安全、美观、功能完整的Markdown笔记应用！**