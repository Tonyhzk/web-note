#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import webbrowser
import threading
from datetime import datetime, timedelta
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import markdown2
import bleach
import hashlib

# pip install Flask Flask-CORS Flask-SQLAlchemy markdown2 bleach

# 获取脚本所在目录
BASE_DIR = Path(__file__).parent.resolve()
DATA_DIR = BASE_DIR / 'data'
FRONTEND_DIR = BASE_DIR / 'frontend'
DATABASE_PATH = DATA_DIR / 'notepad.db'

# 确保必要的目录存在
DATA_DIR.mkdir(exist_ok=True)

# 从环境变量获取密码，默认为 'admin123'
APP_PASSWORD = os.environ.get('APP_PASSWORD', 'admin123')

# 初始化Flask应用
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DATABASE_PATH}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_AS_ASCII'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # 7天会话有效期

# 初始化扩展
CORS(app, supports_credentials=True)
db = SQLAlchemy(app)

def hash_password(password):
    """对密码进行哈希处理"""
    return hashlib.sha256(password.encode()).hexdigest()

def check_auth():
    """检查用户是否已认证"""
    return session.get('authenticated', False)

def require_auth(f):
    """装饰器：要求认证"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not check_auth():
            return jsonify({'error': '需要认证', 'code': 'AUTH_REQUIRED'}), 401
        return f(*args, **kwargs)
    return decorated_function

# 数据模型
class Folder(db.Model):
    """文件夹模型"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.relationship('Note', backref='folder', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'note_count': len(self.notes)
        }

class Note(db.Model):
    """笔记模型"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, default='')
    content_html = db.Column(db.Text, default='')
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'content_html': self.content_html,
            'folder_id': self.folder_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Markdown处理
def markdown_to_html(content):
    """将Markdown转换为HTML"""
    extras = ['task_list', 'tables', 'fenced-code-blocks', 'header-ids']
    html = markdown2.markdown(content, extras=extras)
    # 清理HTML，防止XSS攻击
    allowed_tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
                   'blockquote', 'code', 'pre', 'strong', 'em', 'a', 'img',
                   'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr',
                   'input', 'del', 'sup', 'sub']
    allowed_attributes = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title'],
        'input': ['type', 'checked', 'disabled']
    }
    return bleach.clean(html, tags=allowed_tags, attributes=allowed_attributes)

# 静态文件服务（提供前端页面）
@app.route('/')
def index():
    """主页"""
    return send_from_directory(str(FRONTEND_DIR), 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """提供静态文件"""
    if path and Path(FRONTEND_DIR / path).exists():
        return send_from_directory(str(FRONTEND_DIR), path)
    return send_from_directory(str(FRONTEND_DIR), 'index.html')

# API路由
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'ok', 'authenticated': check_auth()})

@app.route('/api/auth/check', methods=['GET'])
def check_authentication():
    """检查认证状态"""
    return jsonify({'authenticated': check_auth()})

@app.route('/api/folders', methods=['GET'])
@require_auth
def get_folders():
    """获取所有文件夹"""
    folders = Folder.query.order_by(Folder.created_at).all()
    return jsonify([folder.to_dict() for folder in folders])

@app.route('/api/folders', methods=['POST'])
@require_auth
def create_folder():
    """创建新文件夹"""
    data = request.json
    folder = Folder(name=data.get('name', '新建文件夹'))
    db.session.add(folder)
    db.session.commit()
    return jsonify(folder.to_dict()), 201

@app.route('/api/folders/<int:folder_id>', methods=['PUT'])
@require_auth
def update_folder(folder_id):
    """更新文件夹"""
    folder = Folder.query.get_or_404(folder_id)
    data = request.json
    folder.name = data.get('name', folder.name)
    folder.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(folder.to_dict())

@app.route('/api/folders/<int:folder_id>', methods=['DELETE'])
@require_auth
def delete_folder(folder_id):
    """删除文件夹及其所有笔记"""
    folder = Folder.query.get_or_404(folder_id)
    db.session.delete(folder)
    db.session.commit()
    return '', 204

@app.route('/api/notes', methods=['GET'])
@require_auth
def get_notes():
    """获取笔记列表"""
    folder_id = request.args.get('folder_id', type=int)
    search = request.args.get('search', '')
    
    query = Note.query
    
    if folder_id:
        query = query.filter_by(folder_id=folder_id)
    
    if search:
        query = query.filter(
            db.or_(
                Note.title.contains(search),
                Note.content.contains(search)
            )
        )
    
    notes = query.order_by(Note.updated_at.desc()).all()
    return jsonify([note.to_dict() for note in notes])

@app.route('/api/notes', methods=['POST'])
@require_auth
def create_note():
    """创建新笔记"""
    data = request.json
    note = Note(
        title=data.get('title', '无标题笔记'),
        content=data.get('content', ''),
        folder_id=data.get('folder_id')
    )
    db.session.add(note)
    db.session.commit()
    return jsonify(note.to_dict()), 201

@app.route('/api/notes/<int:note_id>', methods=['GET'])
@require_auth
def get_note(note_id):
    """获取单个笔记"""
    note = Note.query.get_or_404(note_id)
    return jsonify(note.to_dict())

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@require_auth
def update_note(note_id):
    """更新笔记"""
    note = Note.query.get_or_404(note_id)
    data = request.json
    
    note.title = data.get('title', note.title)
    note.content = data.get('content', note.content)
    note.folder_id = data.get('folder_id', note.folder_id)
    note.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(note.to_dict())

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@require_auth
def delete_note(note_id):
    """删除笔记"""
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    return '', 204

@app.route('/api/notes/<int:note_id>/move', methods=['POST'])
@require_auth
def move_note(note_id):
    """移动笔记到指定文件夹"""
    note = Note.query.get_or_404(note_id)
    data = request.json
    note.folder_id = data.get('folder_id')
    note.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(note.to_dict())

@app.route('/api/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.json
    password = data.get('password', '')
    remember = data.get('remember', False)
    
    # 检查密码
    if hash_password(password) == hash_password(APP_PASSWORD):
        session['authenticated'] = True
        if remember:
            session.permanent = True  # 启用7天记住功能
        return jsonify({'message': '登录成功'}), 200
    else:
        return jsonify({'error': '密码错误', 'code': 'INVALID_PASSWORD'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """用户注销"""
    session.pop('authenticated', None)
    session.permanent = False
    return jsonify({'message': '注销成功'}), 200

def init_database():
    """初始化数据库"""
    with app.app_context():
        try:
            db.create_all()
            print(f"✓ 数据库初始化成功: {DATABASE_PATH}")
            
            # 检查是否需要创建默认文件夹
            if Folder.query.count() == 0:
                default_folder = Folder(name='默认文件夹')
                db.session.add(default_folder)
                db.session.commit()
                print("✓ 创建默认文件夹")
                
        except Exception as e:
            print(f"✗ 数据库初始化错误: {e}")
            import traceback
            traceback.print_exc()

def open_browser(port):
    """延迟打开浏览器"""
    def _open():
        threading.Event().wait(1.5)  # 等待服务器启动
        webbrowser.open(f'http://127.0.0.1:{port}')
    
    thread = threading.Thread(target=_open)
    thread.daemon = True
    thread.start()

def main():
    """主函数"""
    print(f"""
╔══════════════════════════════════════════════════════════╗
║            Markdown 记事本 - 独立运行版                   ║
╚══════════════════════════════════════════════════════════╝

• 工作目录: {BASE_DIR}
• 数据目录: {DATA_DIR}
• 前端目录: {FRONTEND_DIR}
• 数据库路径: {DATABASE_PATH}
""")
    
    # 检查前端文件是否存在
    if not FRONTEND_DIR.exists():
        print(f"✗ 错误: 前端目录不存在 ({FRONTEND_DIR})")
        print("  请确保 frontend 文件夹在正确的位置")
        sys.exit(1)
    
    if not (FRONTEND_DIR / 'index.html').exists():
        print(f"✗ 错误: index.html 不存在")
        print("  请确保前端文件完整")
        sys.exit(1)
    
    print("✓ 前端文件检查通过")
    
    # 初始化数据库
    init_database()
    
    # 配置端口
    port = 8080
    
    print(f"""
══════════════════════════════════════════════════════════
服务器启动中...
══════════════════════════════════════════════════════════

访问地址: http://127.0.0.1:{port}

按 Ctrl+C 停止服务器
══════════════════════════════════════════════════════════
""")
    
    # 自动打开浏览器
    open_browser(port)
    
    # 启动服务器
    try:
        app.run(
            host='127.0.0.1',
            port=port,
            debug=False,  # 生产环境设为False
            use_reloader=False  # 避免重复打开浏览器
        )
    except KeyboardInterrupt:
        print("\n\n✓ 服务器已停止")
    except Exception as e:
        print(f"\n✗ 服务器错误: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()