import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GitHubLogin from './GitHubLogin';
import { login } from '../utils/auth';
import './LoginPage.css';

function LoginPage({ setIsLoggedIn,username,setUsername,setUserId }) {
    
    const [password, setPassword] = useState('');
    const [showGitHubLogin, setShowGitHubLogin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('login-background');
        return () => {
            document.body.classList.remove('login-background');
        };
    }, []);

  const handleLogin = async () => {
    try {
      const result = await login(username, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        setUserId(result.user_id);
        setUsername(result.username);
        localStorage.setItem('userId', result.user_id);
        localStorage.setItem('username', result.username);
        navigate('/');
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      alert('Failed to connect to server.');
    }
  };

  const handleGitHubLoginSuccess = (data) => {
    setIsLoggedIn(true);
    setUserId(data.user_id);
    setUsername(data.username);
    localStorage.setItem('userId', data.user_id);
    localStorage.setItem('username', data.username);
    setShowGitHubLogin(false);
    navigate('/');
  };

  const handleGitHubLoginClose = () => {
    setShowGitHubLogin(false);
  };

  return (
    <div className="login-wrapper">
      <div className='login-page'></div>
      <div className='container' >
        <h2>Welcome to GrammarMate!</h2>
        <input
          className='username'
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input className='password'
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button  onClick={handleLogin}>Login</button>
        <button  onClick={() => navigate('/register')}>Register</button>
        
        <div className="login-divider">
          <span>或</span>
        </div>
        
        <button 
          className="github-login-btn" 
          onClick={() => setShowGitHubLogin(true)}
        >
          <span className="github-icon">🐙</span>
          GitHub 登录
        </button>
      </div>
      
      {showGitHubLogin && (
        <GitHubLogin 
          onLoginSuccess={handleGitHubLoginSuccess}
          onClose={handleGitHubLoginClose}
        />
      )}
    </div>
  );
}


export default LoginPage;
