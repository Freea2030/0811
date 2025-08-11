// h1.js - 健身房登入系統的 JSON 存檔與讀取功能

// 存儲用戶資料的變數
let userData = {};
let isLoginMode = true;

// 初始化函數
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeDefaultData(); // << 新增的函數呼叫
    
    // 檢查是否已經登入
    if (!checkLoginStatus()) {
        setupFormValidation();
    }
});

// 新增：初始化預設使用者資料
function initializeDefaultData() {
    // 檢查 localStorage 是否已經有資料，如果没有，則載入預設資料
    if (!localStorage.getItem('arnorGymUsers')) {
        console.log('首次載入，正在初始化預設使用者資料...');
        // 這是從 data.json 複製過來的預設使用者物件
        const defaultUsers = {
          "admin": {
            "password": "password123",
            "email": "admin@arnorgym.com",
            "role": "administrator"
          },
          "user1": {
            "password": "123456",
            "email": "user1@example.com",
            "role": "member"
          },
          "guest": {
            "password": "guest123",
            "email": "guest@arnorgym.com",
            "role": "guest"
          },
          "arnor": {
            "password": "gym2024",
            "email": "arnor@arnorgym.com",
            "role": "trainer"
          }
        };
        
        userData = defaultUsers;
        saveUserData(); // 將預設資料存檔
        console.log('預設使用者資料已成功載入並存檔。');
    }
}


// 從 localStorage 讀取用戶資料
function loadUserData() {
    try {
        const savedData = localStorage.getItem('arnorGymUsers');
        if (savedData) {
            userData = JSON.parse(savedData);
            console.log('用戶資料載入成功');
        }
    } catch (error) {
        console.error('載入用戶資料失敗:', error);
        userData = {};
    }
}

// 將用戶資料存檔到 localStorage
function saveUserData() {
    try {
        localStorage.setItem('arnorGymUsers', JSON.stringify(userData));
        console.log('用戶資料存檔成功');
        return true;
    } catch (error) {
        console.error('存檔用戶資料失敗:', error);
        showMessage('存檔失敗，請稍後再試', 'error');
        return false;
    }
}

// 匯出 JSON 檔案到本地
function exportUserData() {
    try {
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'arnor_gym_users.json';
        link.click();
        
        showMessage('用戶資料已匯出', 'success');
    } catch (error) {
        console.error('匯出失敗:', error);
        showMessage('匯出失敗，請稍後再試', 'error');
    }
}

// 匯入 JSON 檔案
function importUserData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                userData = { ...userData, ...importedData };
                saveUserData();
                showMessage('用戶資料匯入成功', 'success');
            } catch (error) {
                console.error('匯入失敗:', error);
                showMessage('JSON 格式錯誤，匯入失敗', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// 設置表單驗證
function setupFormValidation() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleFormSubmit);
}

// 處理表單提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (isLoginMode) {
        handleLogin(username, password);
    } else {
        const confirmPassword = document.getElementById('confirmPassword').value;
        const email = document.getElementById('email').value;
        handleRegister(username, password, confirmPassword, email);
    }
}

// 處理登入
function handleLogin(username, password) {
    if (!username || !password) {
        showMessage('請填寫完整的登入資訊', 'error');
        return;
    }
    
    if (userData[username] && userData[username].password === password) {
        showMessage(`歡迎回來，${username}！\n登入成功，正在跳轉...`, 'success');
        console.log('登入成功:', userData[username]);
        
        // 儲存當前登入用戶資訊
        sessionStorage.setItem('currentUser', username);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        // 延遲跳轉到主畫面
        setTimeout(() => {
            redirectToMainPage(username);
        }, 1500);
    } else {
        showMessage('帳號或密碼錯誤', 'error');
    }
}

// 處理註冊
function handleRegister(username, password, confirmPassword, email) {
    // 驗證必填欄位
    if (!username || !password || !confirmPassword || !email) {
        showMessage('請填寫完整的註冊資訊', 'error');
        return;
    }
    
    // 驗證密碼一致性
    if (password !== confirmPassword) {
        showMessage('密碼與確認密碼不相符', 'error');
        return;
    }
    
    // 驗證用戶名是否已存在
    if (userData[username]) {
        showMessage('此帳號已存在，請選擇其他帳號名稱', 'error');
        return;
    }
    
    // 建立新用戶
    userData[username] = {
        password: password,
        email: email,
        registeredAt: new Date().toISOString()
    };
    
    // 存檔用戶資料
    if (saveUserData()) {
        showMessage(`註冊成功！歡迎加入 ARNOR GYM，${username}`, 'success');
        
        // 自動切換到登入模式
        setTimeout(() => {
            toggleAuthMode();
        }, 2000);
    }
}

// 切換登入/註冊模式
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    
    const submitBtn = document.getElementById('submitBtn');
    const switchText = document.getElementById('switchText');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const emailGroup = document.getElementById('emailGroup');
    
    if (isLoginMode) {
        // 切換到登入模式
        submitBtn.textContent = '登入';
        switchText.innerHTML = '還沒有帳號？ <a href="#" onclick="toggleAuthMode()">立即註冊</a>';
        
        // 隱藏額外欄位
        confirmPasswordGroup.style.display = 'none';
        emailGroup.style.display = 'none';
        confirmPasswordGroup.classList.remove('slide-in');
        emailGroup.classList.remove('slide-in');
        confirmPasswordGroup.classList.add('slide-out');
        emailGroup.classList.add('slide-out');
    } else {
        // 切換到註冊模式
        submitBtn.textContent = '註冊';
        switchText.innerHTML = '已有帳號？ <a href="#" onclick="toggleAuthMode()">立即登入</a>';
        
        // 顯示額外欄位
        confirmPasswordGroup.style.display = 'block';
        emailGroup.style.display = 'block';
        confirmPasswordGroup.classList.remove('slide-out');
        emailGroup.classList.remove('slide-out');
        confirmPasswordGroup.classList.add('slide-in');
        emailGroup.classList.add('slide-in');
    }
    
    // 清除表單
    document.getElementById('loginForm').reset();
    clearMessages();
}

// 處理忘記密碼
function handleForgotPassword() {
    const username = prompt('請輸入您的帳號名稱：');
    
    if (!username) {
        return;
    }
    
    if (userData[username]) {
        const userInfo = userData[username];
        showMessage(`帳號：${username}\n註冊信箱：${userInfo.email}\n請聯絡管理員重設密碼`, 'info');
    } else {
        showMessage('找不到此帳號', 'error');
    }
}

// 顯示訊息
function showMessage(message, type) {
    // 清除舊訊息
    clearMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.login-container');
    container.appendChild(messageDiv);
    
    // 3秒後自動移除訊息
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// 清除訊息
function clearMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    });
}

// 開發者工具函數（在瀏覽器控制台中使用）
window.gymDevTools = {
    // 查看所有用戶資料
    viewUsers: () => {
        console.table(userData);
        return userData;
    },
    
    // 匯出用戶資料
    export: exportUserData,
    
    // 匯入用戶資料
    import: importUserData,
    
    // 清除所有用戶資料
    clearAll: () => {
        if (confirm('確定要清除所有用戶資料嗎？此操作無法復原！')) {
            userData = {};
            localStorage.removeItem('arnorGymUsers');
            console.log('所有用戶資料已清除');
        }
    },
    
    // 新增測試用戶
    addTestUser: () => {
        userData['test'] = {
            password: '123456',
            email: 'test@example.com',
            registeredAt: new Date().toISOString()
        };
        saveUserData();
        console.log('測試用戶已新增 (帳號: test, 密碼: 123456)');
    }
};

// 跳轉到主畫面
function redirectToMainPage(username) {
    // 如果有 main.html 或其他主頁面，可以跳轉過去
    // window.location.href = 'main.html';
    
    // 或者直接在當前頁面顯示主畫面
    showMainDashboard(username);
}

// 顯示主畫面儀表板
function showMainDashboard(username) {
    const container = document.querySelector('.login-container');
    const userInfo = userData[username];
    
    container.innerHTML = `
        <div class="dashboard">
            <div class="logo">
                <h1>ARNOR GYM</h1>
            </div>
            
            <div class="welcome-section">
                <h2>歡迎回來，${username}！</h2>
                <p>會員信箱: ${userInfo.email}</p>
                <p>註冊時間: ${new Date(userInfo.registeredAt || new Date()).toLocaleDateString('zh-TW')}</p>
            </div>
            
            <div class="dashboard-menu">
                <button class="menu-btn" onclick="showProfile()">
                    <span>👤</span>
                    個人資料
                </button>
                
                <button class="menu-btn" onclick="showWorkout()">
                    <span>💪</span>
                    我的訓練
                </button>
                
                <button class="menu-btn" onclick="showSchedule()">
                    <span>📅</span>
                    課程表
                </button>
                
                <button class="menu-btn" onclick="showSettings()">
                    <span>⚙️</span>
                    設定
                </button>
            </div>
            
            <div class="logout-section">
                <button class="logout-btn" onclick="logout()">登出</button>
            </div>
        </div>
    `;
    
    // 添加主畫面的 CSS
    addDashboardStyles();
}

// 添加主畫面樣式
function addDashboardStyles() {
    if (document.getElementById('dashboard-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dashboard-styles';
    style.textContent = `
        .dashboard {
            text-align: center;
        }
        
        .welcome-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
            border: 2px solid #e1e5e9;
        }
        
        .welcome-section h2 {
            color: #333;
            font-size: 1.8rem;
            margin-bottom: 15px;
        }
        
        .welcome-section p {
            color: #666;
            margin: 5px 0;
        }
        
        .dashboard-menu {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 30px 0;
        }
        
        .menu-btn {
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        
        .menu-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .menu-btn span {
            font-size: 24px;
        }
        
        .logout-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
        }
        
        .logout-btn {
            padding: 12px 30px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
            background: #c82333;
            transform: translateY(-2px);
        }
        
        @media (max-width: 480px) {
            .dashboard-menu {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// 檢查登入狀態 (簡易版)
function checkLoginStatus() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        showMainDashboard(currentUser);
        return true;
    }
    return false;
}

// 登出
function logout() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('loginTime');
    // 重新載入頁面以返回登入畫面
    window.location.reload();
}