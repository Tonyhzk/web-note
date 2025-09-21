# 密码保护功能使用说明

## 🔐 功能概述

您的Markdown记事本现在已经添加了密码保护功能，包括：

- **密码验证**：访问应用需要输入正确密码
- **7天记住功能**：可选择7天内免密码登录
- **会话管理**：安全的用户会话控制
- **注销功能**：可随时安全退出

## 🚀 快速开始

### 1. 默认密码
- 默认密码：`admin123`
- 首次使用建议立即修改密码

### 2. 修改密码
编辑 `.env` 文件中的 `APP_PASSWORD` 值：
```bash
APP_PASSWORD=your_new_password
```

### 3. 重启应用
修改密码后需要重启Docker容器：
```bash
docker compose down
docker compose up -d --build
```

## 🔧 环境变量配置

### .env 文件配置
```bash
# 应用密码（请修改为您的密码）
APP_PASSWORD=admin123

# 会话密钥（生产环境请使用随机长字符串）
SECRET_KEY=your-secret-key-change-in-production-environment
```

### Docker Compose 环境变量
```yaml
environment:
  - APP_PASSWORD=${APP_PASSWORD:-admin123}
  - SECRET_KEY=${SECRET_KEY:-your-secret-key-change-in-production}
```

## 🎯 功能特性

### 登录界面
- 美观的渐变背景设计
- 响应式布局，支持移动设备
- 密码输入框带图标提示
- "记住密码7天"复选框选项
- 错误提示信息自动消失

### 安全特性
- 密码哈希验证
- 会话超时控制（7天）
- 自动认证检查
- 安全的注销功能

### 用户体验
- 登录状态持久化
- 无缝的认证流程
- 友好的错误提示
- 快捷键支持（回车登录）

## 🛡️ 安全建议

### 生产环境配置
1. **修改默认密码**
   ```bash
   APP_PASSWORD=your_strong_password_here
   ```

2. **使用强密钥**
   ```bash
   SECRET_KEY=your_random_long_secret_key_here
   ```

3. **定期更新密码**
   - 建议定期更换应用密码
   - 更新后重启容器应用更改

### 密码要求建议
- 至少8个字符
- 包含大小写字母、数字和特殊字符
- 避免使用常见密码

## 📱 使用流程

### 首次访问
1. 打开浏览器访问 `http://localhost:8080`
2. 看到登录界面
3. 输入密码：`admin123`（默认）
4. 可选择勾选"记住密码7天"
5. 点击登录按钮

### 日常使用
1. 如果选择了"记住密码7天"，7天内无需重新登录
2. 可以随时点击右上角的注销按钮退出
3. 注销后需要重新输入密码

### 修改密码后
1. 编辑 `.env` 文件
2. 重启容器：`docker compose up -d --build`
3. 使用新密码登录

## 🔍 故障排除

### 常见问题

**Q: 忘记密码怎么办？**
A: 编辑 `.env` 文件重新设置 `APP_PASSWORD`，然后重启容器。

**Q: 登录后立即要求重新登录？**
A: 检查 `SECRET_KEY` 是否正确设置，确保容器重启后密钥一致。

**Q: "记住密码7天"不生效？**
A: 确保浏览器允许cookies，并且 `SECRET_KEY` 配置正确。

**Q: 无法访问应用？**
A: 检查容器是否正常运行：`docker compose logs`

### 重置所有设置
如果遇到问题，可以重置所有设置：
```bash
# 停止容器
docker compose down

# 删除数据（注意：这会删除所有笔记数据）
rm -rf data/

# 重新启动
docker compose up -d --build
```

## 📞 技术支持

如果您在使用过程中遇到任何问题，请：
1. 检查容器日志：`docker compose logs`
2. 确认环境变量配置正确
3. 验证密码设置无误
4. 检查浏览器控制台错误信息

---

**🎉 恭喜！您的Markdown记事本现在已经具备了完整的密码保护功能！**