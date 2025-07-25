import React, { useState } from 'react';
import { BrowserRouter , Routes, Route, Navigate } from 'react-router-dom';
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

import './App.css';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [selectedLanguage,setSelectedLanguage]=useState('en')
  const [hasSelectedLanguage,setHasSelectedLanguage]=useState(false)

  return (
    // <BrowserRouter>
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

          {/* 受保护路由 */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <HomePage setHasSelectedLanguage={setHasSelectedLanguage} setSelectedLanguage={setSelectedLanguage} selectedLanguage={selectedLanguage} hasSelectedLanguage={hasSelectedLanguage} />
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
          <Route path='/personalise_correction'
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
  // </BrowserRouter>
  );
}

export default App;
