import React, { useState, useRef, useEffect } from 'react';
import './GrammarQA.css';

function getStorageKey(userId) {
  return `grammar_qa_chat_history_${userId}`;
}

function getInitialMessages(userId) {
  try {
    const storageKey = getStorageKey(userId);
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

const GrammarQA = ({ selectedLanguage, userId }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // 初始化为空数组
  const [isLoading, setIsLoading] = useState(false);
  const [translatingIdx, setTranslatingIdx] = useState(null); // 当前正在翻译的消息索引
  const chatEndRef = useRef(null);
  const prevMsgLenRef = useRef(0);

  // 当userId改变时，加载对应用户的聊天记录
  useEffect(() => {
    if (userId) {
      const userMessages = getInitialMessages(userId);
      setMessages(userMessages);
      prevMsgLenRef.current = userMessages.length;
    }
  }, [userId]);

  // 聊天记录变动时保存到对应用户的存储
  useEffect(() => {
    if (userId && messages.length > 0) {
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // 只有新消息加入时才滚动到底部
  useEffect(() => {
    if (messages.length > prevMsgLenRef.current) {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMsgLenRef.current = messages.length;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !userId) return;
    
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setQuestion('');
    
    try {
      const response = await fetch('http://localhost:5000/api/grammar/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content })
      });
      const data = await response.json();
      let answerMsg = { role: 'assistant', content: data.answer };
      
      // 如果需要翻译
      if (selectedLanguage && selectedLanguage !== 'en') {
        const transResp = await fetch('http://localhost:5000/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.answer, to_lang: selectedLanguage })
        });
        const transData = await transResp.json();
        if (transData.translated_text) {
          answerMsg = { ...answerMsg, translated: transData.translated_text };
        }
      }
      setMessages((prev) => [...prev, answerMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '处理问题时出错' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 单条消息翻译
  const handleTranslate = async (idx) => {
    setTranslatingIdx(idx);
    try {
      const msg = messages[idx];
      const resp = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, to_lang: selectedLanguage })
      });
      const data = await resp.json();
      if (data.translated_text) {
        setMessages((prev) => prev.map((m, i) => i === idx ? { ...m, translated: data.translated_text } : m));
      }
    } catch {}
    setTranslatingIdx(null);
  };

  // 清除当前用户的聊天记录
  const clearChatHistory = () => {
    if (userId) {
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
      setMessages([]);
      prevMsgLenRef.current = 0;
    }
  };

  return (
    <div className="chatgpt-qa-container">
      <div className="chatgpt-qa-header">
        <span>Grammar Q&A</span>
        {userId && messages.length > 0 && (
          <button 
            className="clear-chat-btn" 
            onClick={clearChatHistory}
            title="Clear chat history"
          >
            🗑️ Clear
          </button>
        )}
        
      </div>
      <div className="chatgpt-qa-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Welcome to Grammar Q&A!</p>
            <p>Ask any grammar questions and get instant answers.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`chatgpt-qa-message ${msg.role}`}> 
              <div className="chatgpt-qa-avatar">{msg.role === 'user' ? '🧑' : '🤖'}</div>
              <div className="chatgpt-qa-bubble">
                {msg.content}
                {msg.translated && (
                  <div className="qa-translation">{msg.translated}</div>
                )}
              </div>
              {/* 仅AI回答显示翻译按钮，且未翻译时 */}
              {msg.role === 'assistant' && !msg.translated && (
                <button
                  className="qa-translate-btn"
                  onClick={() => handleTranslate(idx)}
                  disabled={translatingIdx === idx}
                  style={{ marginLeft: 8 }}
                >
                  {translatingIdx === idx ? '翻译中...' : '翻译'}
                </button>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <form className="chatgpt-qa-inputbar" onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Please enter your questions here..."
          rows={1}
          disabled={isLoading || !userId}
        />
        <button type="submit" disabled={isLoading || !question.trim() || !userId}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default GrammarQA; 