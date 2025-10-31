import React, { useState, useRef, useEffect } from 'react';
import { downloadProtectedPDF } from '../utils/pdfGenerator';
import { downloadSimplePDF } from '../utils/simplePDF';
import { getStoredToken } from '../utils/auth';
import PDFPreviewModal from './PDFPreviewModal';
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
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const chatEndRef = useRef(null);
  const prevMsgLenRef = useRef(0);
  const eventSourceRef = useRef(null);

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
    if (e) e.preventDefault();
    if (!question.trim() || !userId) return;
    
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setIsLoading(true);
    setQuestion('');

    // 关闭上一条未完成的SSE
    if (eventSourceRef.current) {
      try { eventSourceRef.current.close(); } catch {}
      eventSourceRef.current = null;
    }

    try {
      // Get JWT token for authentication
      const token = getStoredToken();
      const url = `http://localhost:5000/api/grammar/qa/stream?q=${encodeURIComponent(userMsg.content)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('start', () => {
        // no-op, assistant message placeholder already added
      });

      es.onmessage = (evt) => {
        const chunk = evt.data || '';
        if (!chunk) return;
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: (updated[lastIdx].content || '') + (updated[lastIdx].content ? ' ' : '') + chunk };
          }
          return updated;
        });
      };

      es.addEventListener('end', () => {
        setIsLoading(false);
        try { es.close(); } catch {}
        eventSourceRef.current = null;
      });

      es.addEventListener('error', (evt) => {
        setIsLoading(false);
        setMessages((prev) => [...prev, { role: 'assistant', content: '流式传输出错，请重试。' }]);
        try { es.close(); } catch {}
        eventSourceRef.current = null;
      });
    } catch (error) {
      setIsLoading(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: '无法连接到服务器。' }]);
      if (eventSourceRef.current) {
        try { eventSourceRef.current.close(); } catch {}
        eventSourceRef.current = null;
      }
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

  // 显示PDF预览
  const handlePreviewPDF = () => {
    if (!messages.length) {
      alert('没有对话记录可以预览');
      return;
    }
    setShowPDFPreview(true);
  };

  // 处理PDF下载
  const handleDownloadPDF = async (pdfBlob) => {
    try {
      // 创建下载链接
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GrammarMate_QA_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL
      URL.revokeObjectURL(url);
      
      alert('PDF下载成功！');
    } catch (error) {
      console.error('PDF下载失败:', error);
      alert('PDF下载失败，请重试');
    }
  };

  // 导出问答记录为带水印的PDF文件（直接下载）
  const handleExport = async () => {
    if (!messages.length) return;
    
    try {
      console.log('Starting PDF export...', messages);
      
      // Try simple PDF first (more reliable)
      let result;
      try {
        result = downloadSimplePDF(messages, {
          filename: `GrammarMate_QA_${new Date().toISOString().slice(0, 10)}.pdf`
        });
      } catch (simpleError) {
        console.warn('Simple PDF failed, trying advanced version:', simpleError);
        
        // Fallback to advanced PDF
        result = await downloadProtectedPDF(messages, {
          title: 'GrammarMate Q&A Session',
          watermarkText: 'GrammarMate',
          watermarkOptions: {
            opacity: 0.1,
            fontSize: 20,
            angle: -45,
            color: '#cccccc',
            spacing: 100
          },
          userId: userId,
          filename: `GrammarMate_QA_${new Date().toISOString().slice(0, 10)}.pdf`
        });
      }
      
      if (result && result.success) {
        alert(`PDF exported successfully: ${result.filename}`);
      } else {
        console.error('PDF export failed:', result);
        alert(`Export failed: ${result?.error || result?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export PDF: ${error.message}`);
    }
  };

  // 组件卸载或切换时，清理SSE连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        try { eventSourceRef.current.close(); } catch {}
        eventSourceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="chatgpt-qa-container">
      <div className="chatgpt-qa-header">
        <span>Grammar Q&A</span>
        {userId && messages.length > 0 && (
          <div className="header-actions">
            <button 
              className="clear-chat-btn" 
              onClick={clearChatHistory}
              title="Clear chat history"
            >
              🗑️ Clear
            </button>
            <button
              className="preview-chat-btn"
              onClick={handlePreviewPDF}
              title="Preview PDF with watermark protection"
            >
              👁️ Preview PDF
            </button>
            <button
              className="export-chat-btn"
              onClick={handleExport}
              title="Export as PDF with GrammarMate watermark"
            >
              📄 Export PDF
            </button>
          </div>
        )}
      </div>
      <div className="chatgpt-qa-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Welcome to Grammar Q&A!</p>
            <p>Ask any grammar questions and get instant answers.</p>
            <div className="example-questions">
              <div className="example-title">Try asking:</div>
              <ul>
                <li onClick={() => setQuestion('What’s the difference between “I have eaten” and “I had eaten”?')}>What’s the difference between “I have eaten” and “I had eaten”?</li>
                <li onClick={() => setQuestion('When do I use “a” vs “an”?')}>When do I use “a” vs “an”?</li>
                <li onClick={() => setQuestion('Why do we say “much money” but “many apples”?')}>Why do we say “much money” but “many apples”?</li>
              </ul>
            </div>
            <div className="centered-input">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Please enter your grammar questions here..."
                rows={4}
                disabled={isLoading || !userId}
              />
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !question.trim() || !userId}
              >
                {isLoading ? 'Sending...' : 'Ask Question'}
              </button>
            </div>
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
                  {translatingIdx === idx ? 'translating...' : 'translate'}
                </button>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      {messages.length > 0 && (
        <>
         <div className="example-questions" style={{marginBottom: 8}}>
         <span className="example-title">Try asking:</span>
         <ul style={{display:'flex',gap:'16px',padding:0,margin:0,listStyle:'none'}}>
           <li style={{cursor:'pointer'}} onClick={() => setQuestion('What’s the difference between “I have eaten” and “I had eaten”?')}>What’s the difference between “I have eaten” and “I had eaten”?</li>
           <li style={{cursor:'pointer'}} onClick={() => setQuestion('When do I use “a” vs “an”?')}>When do I use “a” vs “an”?</li>
           <li style={{cursor:'pointer'}} onClick={() => setQuestion('Why do we say “much money” but “many apples”?')}>Why do we say “much money” but “many apples”?</li>
         </ul>
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
        </>
      )}
      
      {/* PDF预览模态框 */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        messages={messages}
        userId={userId}
        sessionId={sessionId}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
};

export default GrammarQA; 