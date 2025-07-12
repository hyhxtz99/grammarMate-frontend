import React, { useState, useEffect } from 'react';
import './PersonaliseCorrection.css';

const PersonaliseCorrection = ({ username, selectedLanguage, userId }) => {
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
  
  // 新增状态用于练习题展示
  const [exercises, setExercises] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);

  // 获取用户统计数据
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
      
      // 统计今日和本周数据
      if (recordDate.toDateString() === today.toDateString()) {
        todayCount++;
      }
      if (recordDate >= weekAgo) {
        weekCount++;
      }

      // 统计错误类型
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
        setMessage(`成功获取 ${count} 道个性化练习题！`);
        console.log(data.exercises)
      } else {
        setMessage(data.error || '获取练习题失败');
      }
    } catch (error) {
      setMessage('获取练习题时出错');
    } finally {
      setLoading(false);
    }
  };

  // 处理用户选择
  const handleUserChoice = (isCorrect) => {
    if (isCorrect) {
      // 选择对钩，直接跳到下一题
      nextQuestion();
    } else {
      // 选择X，显示答案和解释
      setShowAnswer(true);
    }
  };

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex < exercises.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      // 练习完成
      setIsPracticing(false);
      setExercises([]);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      setMessage('练习完成！');
    }
  };

  // 计算错误类型统计的百分比
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

  // 渲染当前问题
  const renderCurrentQuestion = () => {
    if (!exercises.length || currentQuestionIndex >= exercises.length) {
      return null;
    }

    const currentExercise = exercises[currentQuestionIndex];

    return (
      <div className="question-container">
        <div className="question-header">
          <h3>问题 {currentQuestionIndex + 1} / {exercises.length}</h3>
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
            ✅ 我知道答案
          </button>
          <button 
            className="choice-btn incorrect-btn"
            onClick={() => handleUserChoice(false)}
            disabled={showAnswer}
          >
            ❌ 我需要帮助
          </button>
        </div>

        {showAnswer && (
          <div className="answer-section">
            <div className="answer-content">
              <h4>正确答案：</h4>
              <p className="correct-answer">{currentExercise.answer}</p>
              <h4>解释：</h4>
              <p className="explanation">{currentExercise.explanation}</p>
            </div>
            <button 
              className="next-btn"
              onClick={nextQuestion}
            >
              下一个
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
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {isPracticing ? (
        <div className="practice-mode">
          {renderCurrentQuestion()}
        </div>
      ) : (
        <div className="stats-grid">
          {/* 错误类型统计饼图 */}
          <div className="stats-card error-pie-chart">
            <h3>📊 错误类型统计</h3>
            <div className="pie-chart-container">
              {Object.keys(errorStats).map(errorType => {
                const percentage = errorPercentages[errorType] || 0;
                const count = errorStats[errorType];
                if (count === 0) return null;
                
                return (
                  <div key={errorType} className="error-type-item">
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
                <div className="no-data">暂无错误数据</div>
              )}
            </div>
          </div>

          {/* 我的纠错数据 */}
          <div className="stats-card user-stats">
            <h3>📈 我的纠错数据</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <span className="stat-label">今日提问：</span>
                <span className="stat-value">{userStats.today}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <span className="stat-label">本周提问：</span>
                <span className="stat-value">{userStats.thisWeek}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📝</span>
                <span className="stat-label">总提问数：</span>
                <span className="stat-value">{userStats.total}</span>
              </div>
            </div>
          </div>

          {/* 个性化推荐练习 */}
          <div className="stats-card personalized-practice">
            <h3>🎯 个性化推荐练习</h3>
            <div className="practice-buttons">
              <button 
                className="practice-btn"
                onClick={() => getPersonalizedExercises(5)}
                disabled={loading}
              >
                {loading ? '获取中...' : '获取5题'}
              </button>
              <button 
                className="practice-btn"
                onClick={() => getPersonalizedExercises(10)}
                disabled={loading}
              >
                {loading ? '获取中...' : '获取10题'}
              </button>
            </div>
            <div className="practice-info">
              <p>基于您的错误类型统计，为您推荐针对性练习</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaliseCorrection;