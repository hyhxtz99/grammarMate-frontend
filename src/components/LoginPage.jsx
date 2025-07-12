import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setIsLoggedIn,username,setUsername,setUserId }) {
    
    const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
    <div style={styles.container}>
      <h2>Login</h2>
      <input
        style={styles.input}
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button style={styles.button} onClick={handleLogin}>Login</button>
      <button style={styles.button} onClick={() => navigate('/register')}>Register</button>

    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' },
  input: { margin: '10px', padding: '8px', width: '200px' },
  button: { padding: '8px 20px' }
};

export default LoginPage;
