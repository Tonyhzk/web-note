FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8080

# 定义启动命令
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "run:app"]