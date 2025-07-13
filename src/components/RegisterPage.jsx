import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // 设置页面背景
  useEffect(() => {
    document.body.classList.add('register-background');
    return () => {
      document.body.classList.remove('register-background');
    };
  }, []);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to connect to server.');
    }
  };

  return (
    <div className="register-wrapper">
      <div className='register-page'></div>
      <div className='register-container'>
        <h2>Register</h2>
        <input 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Username *" 
          className="username"
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password *" 
          className="password"
        />
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email (optional)" 
          className="email"
        />
        <button onClick={handleRegister}>Register</button>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    </div>
  );
}

export default RegisterPage;
