import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        // 将用户名转换为邮箱格式（Firebase 要求邮箱格式）
        const email = `${username}@aml-system.com`;
        
        // 使用 Firebase Authentication 进行登录
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 保存用户信息到 localStorage
        localStorage.setItem('username', username);
        
        // 跳转到主页
        window.location.href = 'index.html';
    } catch (error) {
        console.error('登录失败：', error);
        // 显示错误信息
        errorMessage.style.display = 'block';
        errorMessage.textContent = '用户名或密码错误';
        
        // 3秒后隐藏错误信息
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
}); 