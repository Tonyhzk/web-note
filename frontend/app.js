// API配置
const API_BASE = '/api'; 

// 应用状态
let state = { 
    folders: [], 
    notes: [], 
    currentFolder: null, 
    currentNote: null, 
    editor: null, // Vditor编辑器实例
    autoSaveTimer: null,
    theme: 'light', // 修改默认主题为light
    authenticated: false
}; 

// DOM元素
const elements = { 
    // 登录相关
    loginContainer: document.getElementById('loginContainer'),
    appContainer: document.getElementById('appContainer'),
    loginForm: document.getElementById('loginForm'),
    passwordInput: document.getElementById('passwordInput'),
    rememberCheckbox: document.getElementById('rememberCheckbox'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // 应用相关
    foldersList: document.getElementById('foldersList'), 
    notesList: document.getElementById('notesList'), 
    newFolderBtn: document.getElementById('newFolderBtn'), 
    newNoteBtn: document.getElementById('newNoteBtn'), 
    searchInput: document.getElementById('searchInput'), 
    noteTitle: document.getElementById('noteTitle'), 
    vditorContainer: document.getElementById('vditor'), 
    folderSelector: document.getElementById('folderSelector'), 
    folderSelect: document.getElementById('folderSelect'), 
    moveNoteBtn: document.getElementById('moveNoteBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn')
}; 

// 认证相关函数
const auth = {
    async checkAuth() {
        try {
            const response = await fetch(`${API_BASE}/auth/check`, {
                credentials: 'include'
            });
            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            console.error('检查认证状态失败:', error);
            return false;
        }
    },

    async login(password, remember = false) {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password, remember })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                state.authenticated = true;
                this.showApp();
                await initializeApp();
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: '网络错误，请重试' };
        }
    },

    async logout() {
        try {
            await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            state.authenticated = false;
            this.showLogin();
        } catch (error) {
            console.error('注销失败:', error);
        }
    },

    showLogin() {
        elements.loginContainer.style.display = 'flex';
        elements.appContainer.style.display = 'none';
        elements.passwordInput.focus();
    },

    showApp() {
        elements.loginContainer.style.display = 'none';
        elements.appContainer.style.display = 'flex';
    }
};

// API函数 - 添加错误处理和认证检查
const api = { 
    async handleResponse(response) {
        if (response.status === 401) {
            // 认证失败，显示登录界面
            state.authenticated = false;
            auth.showLogin();
            throw new Error('需要重新登录');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `请求失败: ${response.status}`);
        }
        
        return response.json();
    },

    // 文件夹操作
    async getFolders() { 
        try { 
            const response = await fetch(`${API_BASE}/folders`, {
                credentials: 'include'
            }); 
            return await this.handleResponse(response);
        } catch (error) { 
            console.error('getFolders错误:', error); 
            throw error; 
        } 
        }, 
        
        async createFolder({ name }) { 
            try { 
                const response = await fetch(`${API_BASE}/folders`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'include',
                    body: JSON.stringify({ name }) 
                }); 
                return await this.handleResponse(response);
            } catch (error) { 
                console.error('createFolder错误:', error); 
                throw error; 
            } 
        }, 
        
        async updateFolder(id, name) { 
            try { 
                const response = await fetch(`${API_BASE}/folders/${id}`, { 
                    method: 'PUT', 
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'include',
                    body: JSON.stringify({ name }) 
                }); 
                return await this.handleResponse(response);
            } catch (error) { 
                console.error('updateFolder错误:', error); 
                throw error; 
            } 
        }, 
        
        async deleteFolder(id) { 
            try { 
                const response = await fetch(`${API_BASE}/folders/${id}`, { 
                    method: 'DELETE', 
                    credentials: 'include'
                }); 
                return await this.handleResponse(response);
            } catch (error) { 
                console.error('deleteFolder错误:', error); 
                throw error; 
            } 
        }, 
    
        // 笔记操作
        async getNotes(folderId, searchTerm) { 
            try { 
                let url = `${API_BASE}/notes`; 
                const params = new URLSearchParams(); 
                if (folderId) params.append('folder_id', folderId); 
                if (searchTerm) params.append('search', searchTerm); 
                if (params.toString()) url += `?${params.toString()}`; 
                
                const response = await fetch(url, {
                    credentials: 'include'
                }); 
                return await this.handleResponse(response);
            } catch (error) { 
                console.error('getNotes错误:', error); 
                throw error; 
            } 
        }, 
        
        async createNote(note) { 
            try { 
                const response = await fetch(`${API_BASE}/notes`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'include',
                    body: JSON.stringify(note) 
                }); 
                return await this.handleResponse(response);
            } catch (error) { 
                console.error('createNote错误:', error); 
                throw error; 
            } 
        }, 
        
        async updateNote(id, note) { 
            try { 
                const response = await fetch(`${API_BASE}/notes/${id}`, { 
                    method: 'PUT', 
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'include',
                    body: JSON.stringify(note) 
                }); 
                return await this.handleResponse(response);
            } catch (error) { 
                console.error('updateNote错误:', error); 
                throw error; 
            } 
        }, 
        
        async moveNote(id, folderId) { 
            try { 
                const response = await fetch(`${API_BASE}/notes/${id}/move`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'include',
                    body: JSON.stringify({ folder_id: folderId }) 
                }); 
                return await this.handleResponse(response);
            } catch (error) { 
                console.error('moveNote错误:', error); 
                throw error; 
            } 
        } 
    }; 
    
    // 主题切换
    function applyTheme(theme) {
        state.theme = theme;
        // 修复：使用data-theme属性而不是className
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('notepadTheme', theme);
        
        // 更新编辑器主题
        if (state.editor) {
            state.editor.setTheme(
                theme === 'dark' ? 'dark' : 'classic',
                theme === 'dark' ? 'dark' : 'light'
            );
        }
        
        // 更新按钮图标
        const icon = elements.themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    function toggleTheme() {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }
    
    // 初始化应用
    async function initializeApp() { 
        try { 
            console.log('开始初始化应用...'); 
            // 1. 加载主题
            const savedTheme = localStorage.getItem('notepadTheme') || 'light';
            applyTheme(savedTheme);
            
            const healthCheck = await fetch(`${API_BASE}/health`); 
            if (!healthCheck.ok) { 
                throw new Error(`API健康检查失败: ${healthCheck.status}`); 
            } 
            console.log('API连接正常'); 
            
            console.log('初始化编辑器...'); 
            initEditor(); 
            console.log('编辑器初始化完成'); 
            
            console.log('加载文件夹...'); 
            state.folders = await api.getFolders(); 
            renderFolders(); 
            console.log(`已加载 ${state.folders.length} 个文件夹`); 
            
            console.log('加载笔记...'); 
            await loadNotes(); 
            console.log(`已加载 ${state.notes.length} 条笔记`); 
            
            // 绑定事件
            elements.newFolderBtn.addEventListener('click', createFolder); 
            elements.newNoteBtn.addEventListener('click', createNote); 
            elements.moveNoteBtn.addEventListener('click', moveNote);
            elements.themeToggleBtn.addEventListener('click', toggleTheme); 
            elements.logoutBtn.addEventListener('click', () => auth.logout());
            
            elements.noteTitle.addEventListener('input', triggerAutoSave); 
            
            window.addEventListener('beforeunload', (e) => { 
                if (hasUnsavedChanges()) { 
                    e.preventDefault(); 
                    e.returnValue = ''; 
                } 
            }); 
            
            console.log('应用初始化成功'); 
            
        } catch (error) { 
            console.error('初始化失败:', error); 
            console.error('错误堆栈:', error.stack); 
            const errorMsg = `应用初始化失败：\n${error.message}\n\n请按F12查看控制台了解详情`; 
            alert(errorMsg); 
        } 
    } 
    
    // 编辑器初始化
    function initEditor() { 
        if (state.editor) return; 
        
        state.editor = new Vditor('vditor', { 
            height: '100%', 
            mode: 'wysiwyg', // 默认模式：所见即所得
            theme: state.theme === 'dark' ? 'dark' : 'classic',
            preview: { 
                markdown: { 
                // 开启/关闭 Vditor 对task list的渲染
                taskLists: true, 
            },
            theme: {
                current: state.theme === 'dark' ? 'dark' : 'light'
            }
        }, 
        after: () => { 
             // 隐藏加载状态或进行其他操作
            state.editor.setValue(''); 
        }, 
        input: () => { 
            if (state.currentNote) { 
                triggerAutoSave(); 
            } 
        }, 
        // 可选：添加自定义工具栏按钮
        toolbar: [ 
            "headings", "bold", "italic", "strike", "|", 
            "list", "ordered-list", "check", "outdent", "indent", "|", 
            "quote", "line", "code", "inline-code", "|", 
            "insert-after", "insert-before", "|", 
            "table", "link", "|", 
            "undo", "redo", "|", 
            "fullscreen", "edit-mode", 
            { 
                name: "more", 
                toolbar: [ 
                    "export", 
                    "outline", 
                    "preview", 
                    "devtools", 
                    "info", 
                    "help", 
                ], 
            }, 
        ], 
    }); 
} 
// 文件夹管理
function renderFolders() { 
    elements.foldersList.innerHTML = ''; 
    
    // 添加"全部笔记"选项
    const allNotesItem = document.createElement('div'); 
    allNotesItem.className = `folder-item ${state.currentFolder === null ? 'active' : ''}`; 
    allNotesItem.innerHTML = `
        <div class="folder-name">
            <i class="fas fa-book"></i>
            <span>全部笔记</span>
        </div>
    `; 
    allNotesItem.onclick = () => selectFolder(null); 
    elements.foldersList.appendChild(allNotesItem); 
    
    // 渲染文件夹列表
    state.folders.forEach(folder => { 
        const folderItem = document.createElement('div'); 
        folderItem.className = `folder-item ${state.currentFolder?.id === folder.id ? 'active' : ''}`; 
        folderItem.innerHTML = `
            <div class="folder-name">
                <i class="fas fa-folder"></i>
                <span>${folder.name}</span>
            </div>
            <div class="folder-actions">
                <button class="icon-btn" onclick="editFolder(${folder.id}, event)" title="重命名">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn" onclick="deleteFolder(${folder.id}, event)" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `; 
        folderItem.onclick = (e) => { 
            // 防止点击按钮时触发
            if (e.target.closest('.folder-actions')) return; 
            selectFolder(folder); 
        }; 
        elements.foldersList.appendChild(folderItem); 
    }); 
    
    // 更新文件夹选择器
    updateFolderSelector(); 
} 
function updateFolderSelector() { 
    elements.folderSelect.innerHTML = '<option value="">无文件夹</option>'; 
    state.folders.forEach(folder => { 
        const option = document.createElement('option'); 
        option.value = folder.id; 
        option.textContent = folder.name; 
        if (state.currentNote && state.currentNote.folder_id === folder.id) { 
            option.selected = true; 
        } 
        elements.folderSelect.appendChild(option); 
    }); 
} 
async function selectFolder(folder) { 
    state.currentFolder = folder; 
    await loadNotes(); 
    renderFolders(); 
} 
async function createFolder() { 
    const name = prompt('请输入文件夹名称：'); 
    if (name) { 
        const newFolder = await api.createFolder({ name }); 
        // 获取最新的文件夹列表以保证排序正确
        state.folders = await api.getFolders(); 
        renderFolders(); 
        await selectFolder(state.folders.find(f => f.id === newFolder.id)); 
    } 
} 
async function editFolder(id, event) { 
    event.stopPropagation(); 
    const folder = state.folders.find(f => f.id === id); 
    const newName = prompt('请输入新的文件夹名称：', folder.name); 
    if (newName && newName !== folder.name) { 
        await api.updateFolder(id, newName); 
        state.folders = await api.getFolders(); 
        renderFolders(); 
    } 
} 
async function deleteFolder(id, event) { 
    event.stopPropagation(); 
    if (confirm('确定要删除此文件夹及其所有笔记吗？')) { 
        await api.deleteFolder(id); 
        state.folders = state.folders.filter(f => f.id !== id); 
        if (state.currentFolder?.id === id) { 
            state.currentFolder = null; 
            await loadNotes(); 
        } 
        renderFolders(); 
    } 
} 
// 笔记管理
function renderNotes() { 
    elements.notesList.innerHTML = ''; 
    
    if (state.notes.length === 0) { 
        elements.notesList.innerHTML = '<div class="no-notes-placeholder">暂无笔记</div>'; 
        return; 
    } 
    
    state.notes.forEach(note => { 
        const noteItem = document.createElement('div'); 
        noteItem.className = `note-item ${state.currentNote?.id === note.id ? 'active' : ''}`; 
        
        const date = new Date(note.updated_at); 
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`; 
        
        noteItem.innerHTML = `
            <div class="note-title-text">${note.title || '无标题'}</div>
            <div class="note-date">${dateStr}</div>
        `; 
        noteItem.onclick = () => selectNote(note); 
        elements.notesList.appendChild(noteItem); 
    }); 
} 
async function loadNotes() { 
    state.notes = await api.getNotes(state.currentFolder?.id, elements.searchInput.value); 
    renderNotes(); 
} 
async function selectNote(note) { 
    if (state.currentNote && state.currentNote.id === note.id) return; 
    if (state.currentNote && hasUnsavedChanges()) { 
        await saveCurrentNote(); 
        await loadNotes(); 
    } 
    
    state.currentNote = note; 
    elements.noteTitle.value = note.title; 
    
    if (state.editor) { 
        state.editor.setValue(note.content, true); 
    } 
    
    elements.folderSelector.style.display = 'flex'; 
    updateFolderSelector(); 
    
    renderNotes(); 
} 
async function createNote() { 
    if (state.currentNote && hasUnsavedChanges()) { 
        await saveCurrentNote(); 
    } 
    
    const noteData = { 
        title: '新建笔记', 
        content: '# 新建笔记\n\n在此处开始编辑...', 
        folder_id: state.currentFolder?.id
    }; 
    const newNote = await api.createNote(noteData); 
    
    state.notes.unshift(newNote); 
    renderNotes(); 
    await selectNote(newNote); 
    elements.noteTitle.select(); 
} 
async function saveCurrentNote() { 
    if (!state.currentNote) return; 
    
    const content = state.editor ? state.editor.getValue() : ''; 
    
    const updatedNote = await api.updateNote(state.currentNote.id, { 
        title: elements.noteTitle.value, 
        content: content, 
        folder_id: state.currentNote.folder_id
    }); 
    
    // 更新本地状态，保持列表顺序
    const index = state.notes.findIndex(n => n.id === state.currentNote.id); 
    if (index !== -1) { 
        state.notes[index] = updatedNote; 
        if (index > 0) { 
            const item = state.notes.splice(index, 1)[0]; 
            state.notes.unshift(item); 
        } 
    } 
    
    state.currentNote = updatedNote; 
    clearTimeout(state.autoSaveTimer); 
    state.autoSaveTimer = null; 
    renderNotes(); 
} 
async function moveNote() { 
    if (!state.currentNote) return; 
    
    const newFolderId = elements.folderSelect.value || null; 
    await api.moveNote(state.currentNote.id, newFolderId); 
    
    // 更新笔记的folder_id
    state.currentNote.folder_id = newFolderId ? parseInt(newFolderId) : null; 
    
    // 如果当前在特定文件夹视图中，移动后需要将笔记从列表中移除
    if (state.currentFolder && state.currentFolder.id != newFolderId) { 
        state.notes = state.notes.filter(n => n.id !== state.currentNote.id); 
        renderNotes(); 
    } 
    // 更新文件夹列表的笔记计数
    state.folders = await api.getFolders(); 
    renderFolders(); 
    
    alert('笔记已移动。'); 
} 
function hasUnsavedChanges() { 
    if (!state.currentNote || !state.editor) return false; 
    const currentContent = state.editor.getValue(); 
    return elements.noteTitle.value !== state.currentNote.title || 
           currentContent !== state.currentNote.content; 
} 
// 自动保存
function triggerAutoSave() { 
    clearTimeout(state.autoSaveTimer); 
    state.autoSaveTimer = setTimeout(async () => { 
        if (state.currentNote && hasUnsavedChanges()) { 
            await saveCurrentNote(); 
        } 
    }, 1500); // 延长一点延迟，避免过于频繁
} 
// 搜索功能
elements.searchInput.addEventListener('input', debounce(async () => { 
    await loadNotes(); 
}, 300)); 
// 工具函数
function debounce(func, wait) { 
    let timeout; 
    return function executedFunction(...args) { 
        const later = () => { 
            clearTimeout(timeout); 
            func(...args); 
        }; 
        clearTimeout(timeout); 
        timeout = setTimeout(later, wait); 
    }; 
} 
// 键盘快捷键
document.addEventListener('keydown', (e) => { 
    // Ctrl/Cmd + S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { 
        e.preventDefault(); 
        if (state.currentNote) { 
            saveCurrentNote(); 
        } 
    } 
    
    // Ctrl/Cmd + N 新建笔记
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { 
        e.preventDefault(); 
        createNote(); 
    } 
}); 
// 初始化应用
async function init() { 
    console.log('开始初始化应用...'); 
    // 首先初始化主题（在登录界面也需要正确的主题）
    const savedTheme = localStorage.getItem('notepadTheme') || 'light';
    applyTheme(savedTheme);
    
    // 设置登录事件
    setupLoginEvents();
    
    // 检查认证状态
    const isAuthenticated = await auth.checkAuth();
    
    if (isAuthenticated) {
        state.authenticated = true;
        auth.showApp();
        await initializeApp();
    } else {
        auth.showLogin();
    }
}

// 登录表单事件处理
function setupLoginEvents() {
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = elements.passwordInput.value;
        const remember = elements.rememberCheckbox.checked;
        
        if (!password) {
            showLoginError('请输入密码');
            return;
        }
        
        // 显示加载状态
        const loginBtn = elements.loginForm.querySelector('.login-btn');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
        loginBtn.disabled = true;
        
        try {
            const result = await auth.login(password, remember);
            
            if (result.success) {
                elements.passwordInput.value = '';
                elements.loginError.style.display = 'none';
            } else {
                showLoginError(result.error);
            }
        } catch (error) {
            showLoginError('登录失败，请重试');
        } finally {
            // 恢复按钮状态
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    });
    
    // 回车键登录
    elements.passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.loginForm.dispatchEvent(new Event('submit'));
        }
    });
}

function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = 'block';
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
        elements.loginError.style.display = 'none';
    }, 3000);
}

// 主初始化函数
async function init() {
    console.log('开始初始化应用...');
    
    // 首先初始化主题（在登录界面也需要正确的主题）
    const savedTheme = localStorage.getItem('notepadTheme') || 'light';
    applyTheme(savedTheme);
    
    // 设置登录事件
    setupLoginEvents();
    
    // 检查认证状态
    const isAuthenticated = await auth.checkAuth();
    
    if (isAuthenticated) {
        state.authenticated = true;
        auth.showApp();
        await initializeApp();
    } else {
        auth.showLogin();
    }
}

// 将函数暴露到全局作用域（用于内联事件处理） 
window.editFolder = editFolder; 
window.deleteFolder = deleteFolder; 

// 启动应用
document.addEventListener('DOMContentLoaded', init);