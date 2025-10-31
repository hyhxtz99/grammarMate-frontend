import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar.jsx';
import HomePage from './components/Home.jsx';
import GrammarCorrection from './components/GrammarCorrection.jsx';
import GrammarQA from './components/GrammarQA.jsx';
import PersonalCenter from './components/PersonalCentre.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import PersonaliseCorrection from './components/PersonaliseCorrection.jsx';
import HistoryDetails from './components/HistoryDetails.jsx';
import ErrorTypeDetails from './components/ErrorTypeDetails.jsx';
import GitHubCallback from './components/GitHubCallback.jsx';

import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 添加加载状态

  // 页面加载时检查localStorage中的用户信息
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        const storedUsername = localStorage.getItem('username');
        
        if (storedUserId && storedUsername) {
          // 如果localStorage中有用户信息，恢复登录状态
          setUserId(storedUserId);
          setUsername(storedUsername);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // 如果出错，清除可能损坏的数据
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
      } finally {
        setIsLoading(false); // 无论成功失败，都结束加载状态
      }
    };

    checkLoginStatus();
  }, []);

  // 如果正在检查登录状态，显示加载中
  if (isLoading) {
    return (
      <div className="app-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {isLoggedIn && (
        <>
          <Navbar />
        </>
      )}
      <div className="content-container">
        <Routes>
          <Route
            path="/login"
            element={
              <LoginPage
                setIsLoggedIn={setIsLoggedIn}
                username={username}
                setUsername={setUsername}
                setUserId={setUserId}
              />
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/auth/callback" 
            element={
              <GitHubCallback 
                setIsLoggedIn={setIsLoggedIn}
                setUsername={setUsername}
                setUserId={setUserId}
              />
            } 
          />
          {/* 受保护路由 */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <HomePage 
                  setHasSelectedLanguage={setHasSelectedLanguage} 
                  setSelectedLanguage={setSelectedLanguage} 
                  selectedLanguage={selectedLanguage} 
                  hasSelectedLanguage={hasSelectedLanguage} 
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/grammar/correction"
            element={
              isLoggedIn ? (
                <GrammarCorrection selectedLanguage={selectedLanguage} username={username} userId={userId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/grammar/qa"
            element={
              isLoggedIn ? (
                <GrammarQA username={username} selectedLanguage={selectedLanguage} userId={userId}/>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route 
            path='/personalise_correction'
            element={
              isLoggedIn ? (
                <PersonaliseCorrection username={username} selectedLanguage={selectedLanguage} userId={userId}/>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/personal"
            element={
              isLoggedIn ? (
                <PersonalCenter 
                  username={username} 
                  userId={userId}
                  setIsLoggedIn={setIsLoggedIn}
                  setUsername={setUsername}
                  setUserId={setUserId}
                  setSelectedLanguage={setSelectedLanguage}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/history-details"
            element={
              isLoggedIn ? (
                <HistoryDetails />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/error-type-details"
            element={
              isLoggedIn ? (
                <ErrorTypeDetails />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
