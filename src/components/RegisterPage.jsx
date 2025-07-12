import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

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
    <div style={styles.container}>
      <h2>Register</h2>
      <input 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        placeholder="Username *" 
        style={styles.input}
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Password *" 
        style={styles.input}
      />
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="Email (optional)" 
        style={styles.input}
      />
      <button onClick={handleRegister} style={styles.button}>Register</button>
      <button onClick={() => navigate('/login')} style={styles.button}>Back to Login</button>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    marginTop: '100px' 
  },
  input: { 
    margin: '10px', 
    padding: '8px', 
    width: '200px' 
  },
  button: { 
    padding: '8px 20px',
    margin: '5px'
  }
};

export default RegisterPage;
