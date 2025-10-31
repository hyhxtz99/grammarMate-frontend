import React, { useState, useEffect } from 'react';
import './GitHubLogin.css';

function GitHubLogin({ onLoginSuccess, onClose }) {
    const [authUrl, setAuthUrl] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [status, setStatus] = useState('loading'); // loading, waiting, success, expired
    const [countdown, setCountdown] = useState(1800); // 30分钟倒计时
    const [error, setError] = useState('');

    useEffect(() => {
        getGitHubAuthUrl();
        startCountdown();
    }, []);

    useEffect(() => {
        if (status === 'waiting' && sessionId) {
            const interval = setInterval(checkLoginStatus, 2000); // 每2秒检查一次
            return () => clearInterval(interval);
        }
    }, [status, sessionId]);

    const getGitHubAuthUrl = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/github/login');
            const data = await response.json();
            
            if (response.ok) {
                setAuthUrl(data.auth_url);
                setSessionId(data.session_id);
                setStatus('waiting');
            } else {
                setError('获取GitHub登录链接失败');
                setStatus('error');
            }
        } catch (error) {
            setError('网络连接失败');
            setStatus('error');
        }
    };

    const checkLoginStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/github/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: sessionId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (data.status === 'success') {
                    setStatus('success');
                    onLoginSuccess(data);
                } else if (data.status === 'expired') {
                    setStatus('expired');
                    setError('登录会话已过期，请重新获取登录链接');
                } else {
                    // 保持等待状态，继续轮询
                    console.log('登录状态:', data.status);
                }
            } else if (response.status === 410) {
                setStatus('expired');
                setError('登录会话已过期，请重新获取登录链接');
            } else {
                console.error('状态检查失败:', data.error);
                // 不要因为网络错误就停止轮询
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            // 网络错误时不改变状态，继续轮询
        }
    };

    const startCountdown = () => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setStatus('expired');
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRefresh = () => {
        setStatus('loading');
        setError('');
        setCountdown(1800); // 重置为30分钟
        getGitHubAuthUrl();
    };

    const handleClose = () => {
        onClose();
    };

    const handleGitHubLogin = () => {
        window.open(authUrl, '_blank', 'width=600,height=700');
    };

    return (
        <div className="wechat-login-overlay">
            <div className="wechat-login-modal">
                <div className="wechat-login-header">
                    <h3>GitHub 登录</h3>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>
                
                <div className="wechat-login-content">
                    {status === 'loading' && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>正在准备GitHub登录...</p>
                        </div>
                    )}
                    
                    {status === 'waiting' && (
                        <div className="qr-container">
                            <div className="github-icon">
                                <svg height="64" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="64" data-view-component="true" className="octicon octicon-mark-github">
                                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                                </svg>
                            </div>
                            <p className="qr-instruction">
                                点击下方按钮使用GitHub账号登录
                            </p>
                            <button className="github-login-btn" onClick={handleGitHubLogin}>
                                <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" data-view-component="true" className="octicon octicon-mark-github">
                                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                                </svg>
                                使用 GitHub 登录
                            </button>
                            <div className="countdown">
                                登录链接将在 {formatTime(countdown)} 后过期
                            </div>
                        </div>
                    )}
                    
                    {status === 'success' && (
                        <div className="success-container">
                            <div className="success-icon">✓</div>
                            <p>登录成功！</p>
                        </div>
                    )}
                    
                    {status === 'expired' && (
                        <div className="expired-container">
                            <div className="expired-icon">⏰</div>
                            <p>登录链接已过期</p>
                            <button className="refresh-btn" onClick={handleRefresh}>
                                重新获取
                            </button>
                        </div>
                    )}
                    
                    {status === 'error' && (
                        <div className="error-container">
                            <div className="error-icon">⚠️</div>
                            <p>{error}</p>
                            <button className="refresh-btn" onClick={handleRefresh}>
                                重试
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GitHubLogin;
