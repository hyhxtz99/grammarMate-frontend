import React, { useState, useEffect } from 'react';
import './PersonaliseCorrection.css';
import { useNavigate } from 'react-router-dom';

const PersonaliseCorrection = ({ username, selectedLanguage, userId }) => {
  const navigate = useNavigate();
  const [errorStats, setErrorStats] = useState({
    'subject-verb agreement': 0,
    'tense': 0,
    'article usage': 0,
    'preposition': 0,
    'plural form': 0,
    'word order': 0,
    'pronoun reference': 0,
    'comparative/superlative': 0
  });
  const [userStats, setUserStats] = useState({
    today: 0,
    thisWeek: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [historyDetails, setHistoryDetails] = useState([]); // 保存历史问题详情
  const [showHistory, setShowHistory] = useState(false); // 控制详情展开
  
  // New state for exercise display
  const [exercises, setExercises] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);

  // Get user statistics
  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/grammar/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        processUserData(data.history);
        setHistoryDetails(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const processUserData = (history) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let todayCount = 0;
    let weekCount = 0;
    const errorCounts = { ...errorStats };

    history.forEach(record => {
      const recordDate = new Date(record.created_at);
      
      // Count today and this week data
      if (recordDate.toDateString() === today.toDateString()) {
        todayCount++;
      }
      if (recordDate >= weekAgo) {
        weekCount++;
      }

      // Count error types
      if (record.error_types && Array.isArray(record.error_types)) {
        record.error_types.forEach(errorType => {
          if (errorCounts.hasOwnProperty(errorType)) {
            errorCounts[errorType]++;
          }
        });
      }
    });

    setUserStats({
      today: todayCount,
      thisWeek: weekCount,
      total: history.length
    });
    setErrorStats(errorCounts);
  };

  const getPersonalizedExercises = async (count) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/grammar/personalized/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          count: count,
          errorStats: errorStats 
        })
      });

      const data = await response.json();
      if (response.ok) {
        setExercises(data.exercises || []);
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
        setIsPracticing(true);
        setMessage(`Successfully retrieved ${count} personalized practice questions!`);
        console.log(data.exercises)
      } else {
        setMessage(data.error || 'Failed to get practice questions');
      }
    } catch (error) {
      setMessage('Error occurred while getting practice questions');
    } finally {
      setLoading(false);
    }
  };

  // Handle user choice
  const handleUserChoice = (isCorrect) => {
    if (isCorrect) {
      // Choose checkmark, go to next question directly
      nextQuestion();
    } else {
      // Choose X, show answer and explanation
      setShowAnswer(true);
    }
  };

  // Next question
  const nextQuestion = () => {
    if (currentQuestionIndex < exercises.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      // Practice completed
      setIsPracticing(false);
      setExercises([]);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      setMessage('Practice completed!');
    }
  };

  // Calculate error type statistics percentages
  const getErrorPercentages = () => {
    const total = Object.values(errorStats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return {};

    const percentages = {};
    Object.keys(errorStats).forEach(errorType => {
      percentages[errorType] = ((errorStats[errorType] / total) * 100).toFixed(1);
    });
    return percentages;
  };

  const errorPercentages = getErrorPercentages();

  // Render current question
  const renderCurrentQuestion = () => {
    if (!exercises.length || currentQuestionIndex >= exercises.length) {
      return null;
    }

    const currentExercise = exercises[currentQuestionIndex];

    return (
      <div className="question-container">
        <div className="question-header">
          <h3>Question {currentQuestionIndex + 1} / {exercises.length}</h3>
        </div>
        
        <div className="question-content">
          <p className="question-text">{currentExercise.question}</p>
        </div>

        <div className="choice-buttons">
          <button 
            className="choice-btn correct-btn"
            onClick={() => handleUserChoice(true)}
            disabled={showAnswer}
          >
            ✅ I know the answer
          </button>
          <button 
            className="choice-btn incorrect-btn"
            onClick={() => handleUserChoice(false)}
            disabled={showAnswer}
          >
            ❌ I need help
          </button>
        </div>

        {showAnswer && (
          <div className="answer-section">
            <div className="answer-content">
              <h4>Correct Answer:</h4>
              <p className="correct-answer">{currentExercise.answer}</p>
              <h4>Explanation:</h4>
              <p className="explanation">{currentExercise.explanation}</p>
            </div>
            <button 
              className="next-btn"
              onClick={nextQuestion}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="personalise-container">
      <h2>Personalized Grammar Correction</h2>
      
      {message && (
        <div className={`message ${message.includes('Successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {isPracticing ? (
        <div className="practice-mode">
          {renderCurrentQuestion()}
        </div>
      ) : (
        <div className="stats-grid">
          {/* Error type statistics pie chart */}
          <div className="stats-card error-pie-chart">
            <h3
              style={{cursor: historyDetails.length ? 'pointer' : 'default'}}
              onClick={() => {
                const allErrorTypeDetails = historyDetails.filter(item => Array.isArray(item.error_types) && item.error_types.length > 0 && !item.error_types.includes('none'));
                if (allErrorTypeDetails.length) {
                  navigate('/error-type-details', { state: { errorType: 'All', errorDetails: allErrorTypeDetails } });
                }
              }}
            >
              📊 Error Type Statistics
            </h3>
            <div className="pie-chart-container">
              {Object.keys(errorStats).map(errorType => {
                const percentage = errorPercentages[errorType] || 0;
                const count = errorStats[errorType];
                if (count === 0) return null;
                // 新增：筛选该类型的历史详情
                const errorTypeDetails = historyDetails.filter(item => Array.isArray(item.error_types) && item.error_types.includes(errorType));
                return (
                  <div key={errorType} className="error-type-item" style={{cursor: errorTypeDetails.length ? 'pointer' : 'default'}}
                    onClick={() => errorTypeDetails.length && navigate('/error-type-details', { state: { errorType, errorDetails: errorTypeDetails } })}
                  >
                    <div className="error-type-bar">
                      <div 
                        className="error-type-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="error-type-label">
                      <span className="error-type-name">{errorType}</span>
                      <span className="error-type-count">{count} ({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
              {Object.values(errorStats).every(count => count === 0) && (
                <div className="no-data">No error data available</div>
              )}
            </div>
          </div>

          {/* My correction data */}
          <div className="stats-card user-stats"
            onClick={() => historyDetails.length && navigate('/history-details', { state: { historyDetails } })}
            style={{ cursor: historyDetails.length ? 'pointer' : 'default' }}
          >
            <h3>📈 My Correction Data</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <span className="stat-label">Today's questions:</span>
                <span className="stat-value">{userStats.today}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <span className="stat-label">This week's questions:</span>
                <span className="stat-value">{userStats.thisWeek}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📝</span>
                <span className="stat-label">Total questions:</span>
                <span className="stat-value">{userStats.total}</span>
              </div>
            </div>
          </div>

          {/* Personalized practice recommendations */}
          <div className="stats-card personalized-practice">
            <h3>Targeted Practice Based on Your Errors</h3>
            <div className="practice-buttons">
              <button 
                className="practice-btn"
                onClick={() => getPersonalizedExercises(5)}
                disabled={loading}
              >
                {loading ? 'Fetching...' : 'Start 5-Question Practice'}
              </button>
              <button 
                className="practice-btn"
                onClick={() => getPersonalizedExercises(10)}
                disabled={loading}
              >
                {loading ? 'Fetching...' : 'Start 10-Question Practice'}
              </button>
            </div>
            <div className="practice-info">
              <p>Practice recommendations based on your grammar error statistics.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaliseCorrection;