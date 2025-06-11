import React, { useState } from 'react';
import './GrammarQA.css';

const GrammarQA = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question) {
      alert('请输入问题');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/grammar/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error:', error);
      alert('处理问题时出错');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grammar-qa-container">
      <h2>Grammar Q&A</h2>
      
      <div className="question-input">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="请输入您的语法问题..."
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : '提交问题'}
        </button>
      </div>

      {answer && (
        <div className="answer-section">
          <h3>回答：</h3>
          <div className="answer-content">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarQA; 