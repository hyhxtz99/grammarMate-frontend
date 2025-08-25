import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ setIsLoggedIn,username,setUsername,setUserId }) {
    
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('login-background');
        return () => {
            document.body.classList.remove('login-background');
        };
    }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
  
      if (data.success) {
        setIsLoggedIn(true);
        setUserId(data.user_id);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('username', data.username);
        navigate('/');
      } else {
        (alert(data.detail));
      }
    } catch (error) {
      alert('Failed to connect to server.');
    }
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
      </div>
    </div>
  );
}


export default LoginPage;
