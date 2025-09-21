# 📁 项目文件结构

```
web-note/
├── 📁 data/                    # 数据目录（SQLite数据库）
├── 📁 frontend/                # 前端文件
│   ├── 📁 res/                 # 静态资源
│   │   ├── 📁 font-awesome/    # FontAwesome图标
│   │   └── 📁 vditor/          # Vditor编辑器
│   ├── 📄 app.js               # 主要JavaScript逻辑
│   ├── 📄 index.html           # 主页面
│   └── 📄 styles.css           # 样式文件
├── 📄 .dockerignore            # Docker忽略文件
├── 📄 .env                     # 环境变量配置
├── 📄 .gitignore               # Git忽略文件
├── 📄 docker-compose.yml       # Docker Compose配置
├── 📄 Dockerfile               # Docker镜像构建文件
├── 📄 requirements.txt         # Python依赖
├── 📄 run.py                   # Flask应用主文件
├── 📄 README.md                # 项目说明
├── 📄 DOCKER_DEPLOYMENT_GUIDE.md    # Docker部署指南
└── 📄 PASSWORD_PROTECTION_GUIDE.md  # 密码保护使用指南
```

## 🔧 核心文件说明

### Docker相关
- `Dockerfile`: 定义镜像构建过程
- `docker-compose.yml`: 定义服务配置
- `.dockerignore`: 排除不必要的文件

### 应用核心
- `run.py`: Flask后端应用
- `requirements.txt`: Python依赖包
- `.env`: 环境变量配置

### 前端资源
- `frontend/`: 包含所有前端文件
- `data/`: 数据持久化目录

### 文档
- `README.md`: 项目主要说明
- `DOCKER_DEPLOYMENT_GUIDE.md`: 部署指南
- `PASSWORD_PROTECTION_GUIDE.md`: 功能说明

## 🚀 快速开始

```bash
# 克隆或下载项目后
docker compose up -d --build

# 访问应用
http://localhost:8080
```

默认密码：`admin123`