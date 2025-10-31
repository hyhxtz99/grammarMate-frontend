import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GitHubCallback({ setIsLoggedIn, setUsername, setUserId }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    setError(`GitHub OAuth error: ${error}`);
                    return;
                }

                if (!code || !state) {
                    setStatus('error');
                    setError('缺少授权码或状态参数，请重新尝试登录');
                    return;
                }

                // 调用后端API处理回调
                const response = await fetch(`http://localhost:5000/api/github/callback?code=${code}&state=${state}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    
                    // 直接处理GitHub回调返回的token信息
                    if (data.access_token && data.user_id && data.username) {
                        // 清除所有旧的认证信息
                        localStorage.clear();
                        
                        // 存储新的token和用户信息
                        localStorage.setItem('access_token', data.access_token);
                        localStorage.setItem('refresh_token', data.refresh_token);
                        localStorage.setItem('userId', data.user_id);
                        localStorage.setItem('username', data.username);
                        
                        // 设置登录状态
                        setIsLoggedIn(true);
                        setUserId(data.user_id);
                        setUsername(data.username);
                        
                        // 等待一下让用户看到成功状态，然后跳转
                        setTimeout(() => {
                            navigate('/');
                        }, 1500);
                    } else {
                        // 如果没有token信息，回退到状态检查
                        setTimeout(async () => {
                            try {
                                const statusResponse = await fetch('http://localhost:5000/api/github/status', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ session_id: state })
                                });

                                const statusData = await statusResponse.json();

                                if (statusResponse.ok && statusData.status === 'success') {
                                    setIsLoggedIn(true);
                                    setUserId(statusData.user_id);
                                    setUsername(statusData.username);
                                    localStorage.setItem('userId', statusData.user_id);
                                    localStorage.setItem('username', statusData.username);
                                    navigate('/');
                                } else {
                                    setStatus('error');
                                    setError('登录完成但无法获取用户信息');
                                }
                            } catch (error) {
                                setStatus('error');
                                setError('登录状态检查失败');
                            }
                        }, 1500);
                    }
                } else {
                    setStatus('error');
                    setError(data.error || 'GitHub登录处理失败，请重试');
                }
            } catch (error) {
                setStatus('error');
                setError('网络连接失败，请检查网络后重试');
            }
        };

        handleCallback();
    }, [searchParams, navigate, setIsLoggedIn, setUsername, setUserId]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f8f9fa'
        }}>
            {status === 'processing' && (
                <>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #24292e',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '20px'
                    }}></div>
                    <h2 style={{ color: '#333', marginBottom: '10px' }}>Processing GitHub Login...</h2>
                    <p style={{ color: '#666' }}>Please wait while we complete your login.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '20px'
                    }}>✓</div>
                    <h2 style={{ color: '#333', marginBottom: '10px' }}>Login Successful!</h2>
                    <p style={{ color: '#666' }}>Redirecting to the application...</p>
                </>
            )}

            {status === 'error' && (
                <>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        marginBottom: '20px'
                    }}>⚠️</div>
                    <h2 style={{ color: '#333', marginBottom: '10px' }}>Login Failed</h2>
                    <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center', maxWidth: '400px' }}>{error}</p>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{
                            backgroundColor: '#24292e',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Back to Login
                    </button>
                </>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default GitHubCallback;
