import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalCentre.css';

function PersonalCenter({ username,setSelectedLanguage, userId, setIsLoggedIn, setUsername, setUserId }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    email: ''
  });
  const [editingField, setEditingField] = useState(null); // 当前正在编辑的字段
  const [editValues, setEditValues] = useState({}); // 编辑时的临时值
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取用户信息
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const startEditing = (field) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: profile[field] });
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({});
  };

  const saveField = async (field) => {
    const newValue = editValues[field];
    if (newValue === profile[field]) {
      setEditingField(null);
      setEditValues({});
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = { ...profile, [field]: newValue };
      const response = await fetch(`http://localhost:5000/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProfile)
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(updatedProfile);
        setEditingField(null);
        setEditValues({});
        setMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
        
        // 如果更新的是用户名，也要更新全局状态
        if (field === 'username') {
          setUsername(newValue);
        }
      } else {
        setMessage(data.error || `Failed to update ${field}`);
      }
    } catch (error) {
      setMessage(`Error updating ${field}`);
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage('New passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/user/password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordData({ new_password: '', confirm_password: '' });
      } else {
        setMessage(data.error || 'Failed to change password');
      }
    } catch (error) {
      setMessage('Error changing password');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserId(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const renderField = (field, label, type = 'text') => {
    const isEditing = editingField === field;
    const value = isEditing ? editValues[field] : profile[field];

    return (
      <div className="profile-field">
        <label>{label}:</label>
        <div className="field-content">
          {isEditing ? (
            <>
              <input
                type={type}
                value={value}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                disabled={loading}
              />
              <div className="field-actions">
                <button 
                  className="save-btn small" 
                  onClick={() => saveField(field)}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="cancel-btn small" 
                  onClick={cancelEditing}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <span>{field === 'email' && !value ? 'Not set' : value}</span>
              <button 
                className="edit-field-btn" 
                onClick={() => startEditing(field)}
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="personal-center">
     
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <div className="profile-section">
        <h3>Profile Information</h3>
        {renderField('username', 'Username')}
        {renderField('email', 'Email', 'email')}
      </div>
      <div className="password-section">
        <h3>Change Password</h3>
        {isChangingPassword ? (
          <div className="password-form">
            <div className="password-field">
              <label>New Password:</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              />
            </div>
            
            <div className="password-field">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              />
            </div>
            
            <div className="password-actions">
              <button 
                className="save-btn small" 
                onClick={handlePasswordChange}
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button 
                className="cancel-btn small" 
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ new_password: '', confirm_password: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="change-password-btn" 
            onClick={() => setIsChangingPassword(true)}
          >
            Change Password
          </button>
        )}
      </div>

      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default PersonalCenter;
