import React, { useState, useEffect } from 'react';
import './PersonaliseCorrection.css';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/auth';
import ReactECharts from 'echarts-for-react';

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

  
  // New state for exercise display
  const [exercises, setExercises] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  
  // Chart state
  const [chartType, setChartType] = useState('pie'); // 'pie', 'combined', 'trend', 'heatmap'
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month'

  // Get user statistics
  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      const response = await authenticatedFetch(`/api/grammar/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        processUserData(data.history);
        setHistoryDetails(data.history || []);
      } else {
        console.error('Failed to fetch user stats:', response.status, response.statusText);
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

    // 如果没有真实数据，生成模拟数据
    if (history.length === 0) {
      console.log('No real data found, generating mock data for pie chart');
      const mockErrorStats = {
        'subject-verb agreement': Math.floor(Math.random() * 10) + 5,
        'tense': Math.floor(Math.random() * 8) + 3,
        'article usage': Math.floor(Math.random() * 6) + 2,
        'preposition': Math.floor(Math.random() * 7) + 1,
        'plural form': Math.floor(Math.random() * 5) + 1,
        'word order': Math.floor(Math.random() * 4) + 1,
        'pronoun reference': Math.floor(Math.random() * 6) + 2,
        'comparative/superlative': Math.floor(Math.random() * 3) + 1
      };
      
      setUserStats({
        today: Math.floor(Math.random() * 5) + 1,
        thisWeek: Math.floor(Math.random() * 20) + 10,
        total: Math.floor(Math.random() * 50) + 20
      });
      setErrorStats(mockErrorStats);
    } else {
      setUserStats({
        today: todayCount,
        thisWeek: weekCount,
        total: history.length
      });
      setErrorStats(errorCounts);
    }
  };

  const getPersonalizedExercises = async (count) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await authenticatedFetch(`/api/grammar/personalized/${userId}`, {
        method: 'POST',
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

  // Prepare data for ECharts pie chart
  const getPieChartData = () => {
    const total = Object.values(errorStats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return { seriesData: [], hasData: false };

    const seriesData = Object.keys(errorStats)
      .filter(errorType => errorStats[errorType] > 0)
      .map(errorType => ({
        name: errorType,
        value: errorStats[errorType]
      }));

    return { seriesData, hasData: seriesData.length > 0 };
  };

  const { seriesData, hasData } = getPieChartData();

  // Process data for time series charts
  const processTimeSeriesData = (history, range = 'week') => {
    const now = new Date();
    const daysBack = range === 'week' ? 7 : 30;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    // Create date buckets
    const dateBuckets = {};
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dateBuckets[dateKey] = {
        date: dateKey,
        errorCount: 0,
        studyCount: 0,
        errorTypes: {}
      };
    }
    
    // Process history data
    history.forEach(record => {
      const recordDate = new Date(record.created_at);
      const dateKey = recordDate.toISOString().split('T')[0];
      
      if (dateBuckets[dateKey]) {
        dateBuckets[dateKey].studyCount++;
        if (record.error_types && Array.isArray(record.error_types)) {
          record.error_types.forEach(errorType => {
            if (errorType !== 'none') {
              dateBuckets[dateKey].errorCount++;
              dateBuckets[dateKey].errorTypes[errorType] = (dateBuckets[dateKey].errorTypes[errorType] || 0) + 1;
            }
          });
        }
      }
    });
    
    // 如果没有真实数据，生成模拟数据用于演示
    const result = Object.values(dateBuckets).sort((a, b) => a.date.localeCompare(b.date));
    
    // 检查是否有真实数据
    const hasRealData = result.some(day => day.studyCount > 0);
    
    if (!hasRealData) {
      console.log('No real data found, generating mock data for demonstration');
      const errorTypes = ['subject-verb agreement', 'tense', 'article usage', 'preposition', 
                         'plural form', 'word order', 'pronoun reference', 'comparative/superlative'];
      
      return result.map((day, index) => {
        // 生成模拟的学习数据
        const studyCount = Math.floor(Math.random() * 8) + 1; // 1-8题
        const errorCount = Math.floor(Math.random() * 5) + 1; // 1-5个错误
        
        // 生成错误类型分布
        const errorTypesData = {};
        for (let i = 0; i < errorCount; i++) {
          const randomErrorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          errorTypesData[randomErrorType] = (errorTypesData[randomErrorType] || 0) + 1;
        }
        
        return {
          ...day,
          studyCount,
          errorCount,
          errorTypes: errorTypesData
        };
      });
    }
    
    return result;
  };

  // Get combined chart data (bar + line)
  const getCombinedChartData = () => {
    const timeSeriesData = processTimeSeriesData(historyDetails, timeRange);
    const dates = timeSeriesData.map(d => d.date);
    const errorCounts = timeSeriesData.map(d => d.errorCount);
    const studyCounts = timeSeriesData.map(d => d.studyCount);
    
    // 计算学习强度的移动平均线
    const calculateMovingAverage = (data, windowSize = 3) => {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const end = i + 1;
        const slice = data.slice(start, end);
        const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
        result.push(Math.round(average * 100) / 100);
      }
      return result;
    };
    
    const studyTrend = calculateMovingAverage(studyCounts);
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function (params) {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach(param => {
            const icon = param.seriesName.includes('趋势') ? '📈' : 
                       param.seriesName.includes('错误') ? '📊' : '📚';
            result += `${icon} ${param.seriesName}: ${param.value}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['错误数量', '学习强度', '学习趋势'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisPointer: {
          type: 'shadow'
        },
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '错误数量',
          position: 'left',
          axisLabel: {
            formatter: '{value} 个'
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              opacity: 0.3
            }
          }
        },
        {
          type: 'value',
          name: '学习强度',
          position: 'right',
          axisLabel: {
            formatter: '{value} 题'
          }
        }
      ],
      series: [
        {
          name: '错误数量',
          type: 'bar',
          data: errorCounts,
          itemStyle: {
            color: '#5470c6',
            borderRadius: [2, 2, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        },
        {
          name: '学习强度',
          type: 'line',
          yAxisIndex: 1,
          data: studyCounts,
          itemStyle: {
            color: '#ee6666'
          },
          lineStyle: {
            width: 3,
            type: 'solid'
          },
          symbol: 'circle',
          symbolSize: 6,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(238, 102, 102, 0.3)'
              }, {
                offset: 1, color: 'rgba(238, 102, 102, 0.1)'
              }]
            }
          }
        },
        {
          name: '学习趋势',
          type: 'line',
          yAxisIndex: 1,
          data: studyTrend,
          itemStyle: {
            color: '#ff6b6b'
          },
          lineStyle: {
            width: 2,
            type: 'dashed'
          },
          symbol: 'none',
          emphasis: {
            focus: 'series'
          }
        }
      ]
    };
  };

  // Get trend comparison chart data
  const getTrendChartData = () => {
    const timeSeriesData = processTimeSeriesData(historyDetails, timeRange);
    const dates = timeSeriesData.map(d => d.date);
    
    // Get all error types
    const allErrorTypes = ['subject-verb agreement', 'tense', 'article usage', 'preposition', 
                          'plural form', 'word order', 'pronoun reference', 'comparative/superlative'];
    
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', 
                   '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];
    
    // 计算移动平均线（3天移动平均）
    const calculateMovingAverage = (data, windowSize = 3) => {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const end = i + 1;
        const slice = data.slice(start, end);
        const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
        result.push(Math.round(average * 100) / 100); // 保留两位小数
      }
      return result;
    };
    
    // 生成原始数据系列和移动平均线系列
    const series = [];
    
    allErrorTypes.forEach((errorType, index) => {
      const rawData = timeSeriesData.map(d => d.errorTypes[errorType] || 0);
      const movingAvgData = calculateMovingAverage(rawData);
      
      // 原始数据线（真实趋势）
      series.push({
        name: errorType,
        type: 'line',
        data: rawData,
        smooth: false, // 保持真实趋势，不使用平滑
        itemStyle: { 
          color: colors[index],
          borderWidth: 2
        },
        lineStyle: { 
          width: 2,
          type: 'solid'
        },
        symbol: 'circle',
        symbolSize: 4,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3
          }
        }
      });
      
      // 移动平均线（整体趋势）
      series.push({
        name: `${errorType} (趋势)`,
        type: 'line',
        data: movingAvgData,
        smooth: true,
        itemStyle: { 
          color: colors[index],
          opacity: 0.8
        },
        lineStyle: { 
          width: 3,
          type: 'dashed'
        },
        symbol: 'none',
        emphasis: {
          focus: 'series'
        }
      });
    });
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function (params) {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach(param => {
            const isTrend = param.seriesName.includes('(趋势)');
            const prefix = isTrend ? '📈 ' : '📊 ';
            result += `${prefix}${param.seriesName}: ${param.value} 个错误<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: [...allErrorTypes, ...allErrorTypes.map(type => `${type} (趋势)`)],
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          fontSize: 10
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        name: '错误数量',
        axisLabel: {
          formatter: '{value} 个'
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.3
          }
        }
      },
      series: series
    };
  };

  // Get heatmap chart data
  const getHeatmapChartData = () => {
    const timeSeriesData = processTimeSeriesData(historyDetails, timeRange);
    const dates = timeSeriesData.map(d => d.date);
    const errorTypes = ['subject-verb agreement', 'tense', 'article usage', 'preposition', 
                       'plural form', 'word order', 'pronoun reference', 'comparative/superlative'];
    
    const data = [];
    errorTypes.forEach((errorType, typeIndex) => {
      dates.forEach((date, dateIndex) => {
        const value = timeSeriesData[dateIndex].errorTypes[errorType] || 0;
        if (value > 0) {
          data.push([dateIndex, typeIndex, value]);
        }
      });
    });
    
    return {
      tooltip: {
        position: 'top',
        formatter: function (params) {
          return `${dates[params.data[0]]}<br/>${errorTypes[params.data[1]]}: ${params.data[2]} 个错误`;
        }
      },
      grid: {
        height: '50%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: dates,
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: errorTypes,
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(d => d[2])),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
        inRange: {
          color: ['#50a3ba', '#eac736', '#d94e5d']
        }
      },
      series: [{
        name: '错误热力图',
        type: 'heatmap',
        data: data,
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };

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
          {/* Chart Controls */}
          <div className="stats-card chart-controls">
            <h3>📊 数据分析图表</h3>
            <div className="chart-controls-container">
              <div className="chart-type-buttons">
                <button 
                  className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`}
                  onClick={() => setChartType('pie')}
                >
                  🥧 饼图
                </button>
                <button 
                  className={`chart-btn ${chartType === 'combined' ? 'active' : ''}`}
                  onClick={() => setChartType('combined')}
                >
                  📊 组合图
                </button>
                <button 
                  className={`chart-btn ${chartType === 'trend' ? 'active' : ''}`}
                  onClick={() => setChartType('trend')}
                >
                  📈 趋势图
                </button>
                <button 
                  className={`chart-btn ${chartType === 'heatmap' ? 'active' : ''}`}
                  onClick={() => setChartType('heatmap')}
                >
                  🔥 热力图
                </button>
              </div>
              <div className="time-range-buttons">
                <button 
                  className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeRange('week')}
                >
                  最近7天
                </button>
                <button 
                  className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeRange('month')}
                >
                  最近30天
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Chart Display */}
          <div className="stats-card dynamic-chart">
            <h3>
              {chartType === 'pie' && '📊 错误类型分布'}
              {chartType === 'combined' && '📊 学习强度与错误趋势'}
              {chartType === 'trend' && '📈 错误类型趋势对比'}
              {chartType === 'heatmap' && '🔥 学习模式热力图'}
            </h3>
            <div className="chart-container">
              {chartType === 'pie' && (
                hasData ? (
                  <ReactECharts
                    option={{
                      tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                      },
                      legend: {
                        orient: 'vertical',
                        left: 'left',
                        textStyle: {
                          fontSize: 12
                        }
                      },
                      series: [
                        {
                          name: 'Error Types',
                          type: 'pie',
                          radius: ['40%', '70%'],
                          center: ['60%', '50%'],
                          avoidLabelOverlap: false,
                          itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                          },
                          label: {
                            show: false,
                            position: 'center'
                          },
                          emphasis: {
                            label: {
                              show: true,
                              fontSize: '18',
                              fontWeight: 'bold'
                            }
                          },
                          labelLine: {
                            show: false
                          },
                          data: seriesData
                        }
                      ],
                      color: [
                        '#5470c6', '#91cc75', '#fac858', '#ee6666',
                        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
                      ]
                    }}
                    style={{ height: '400px', width: '100%' }}
                  />
                ) : (
                  <div className="no-data">No error data available</div>
                )
              )}
              
              {chartType === 'combined' && (
                <ReactECharts
                  option={getCombinedChartData()}
                  style={{ height: '400px', width: '100%' }}
                />
              )}
              
              {chartType === 'trend' && (
                <ReactECharts
                  option={getTrendChartData()}
                  style={{ height: '400px', width: '100%' }}
                />
              )}
              
              {chartType === 'heatmap' && (
                <ReactECharts
                  option={getHeatmapChartData()}
                  style={{ height: '400px', width: '100%' }}
                />
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