import React, { useState, useRef } from 'react';
import './GrammarCorrection.css';

const GrammarCorrection = ({ selectedLanguage }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setLoading]=useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [translatedResult, setTranslatedResult] = useState(null);

  

  const startRecording = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/speech/start', {
        method: 'POST'
      });
      if (response.ok) {
        setIsRecording(true);
       
      } else {
        const data = await response.json();
        alert(data.error || 'Unable to start recording');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Unable to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/speech/stop', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.text) {
        setText(data.text);
        setResult(data.grammar_result);
      }
      setIsRecording(false);
      
     
    } catch (error) {
      console.error('Error:', error);
      alert('error stopping recording. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!text) {
      alert('please say something...');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      setResult(data.grammar_result);
    } catch (error) {
      console.error('Error:', error);
      alert('error in processing text');
    }
    setLoading(false);
  };


  const handleTranslate = async () => {
    if (!result) {
      alert('please get the grammar-checked results first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: Array.isArray(result) ? result[0] : result,
          to_lang: selectedLanguage
        })
      });
      const data = await response.json();
      if (data.translated_text) {
        setTranslatedResult(data.translated_text);
      } else {
        alert('Translation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('error in translation');
    }
  };
  return (
    <div className="grammar-container">
      <h2>Sentence Correction</h2>
     <div>Please wait for one second after the recording starts before speaking.</div> 
      
      <div className="speech-input">
        <button 
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop recording' : 'Start recording'}
        </button>
        {isRecording && <div className="recording-status">Recording...</div>}
        
      </div>

      <div className="text-input">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Please enter the text you want to check..."
        />
        <button onClick={handleSubmit}>Check Grammar</button>
      </div>

      {/* 结果显示部分 */}
      {isLoading && <div className="loading">Processing, please wait...</div>}

      {result && (
        <div className="result-section">
          <h3>Checked results: (If you want a more detailed explanation about a grammar point, you can ask in the Q&A channel.)</h3>
          <div className="result-content">
            {Array.isArray(result) ? result[0] : result}
          </div>
          <div  className="choose-to-translate">Translate to...</div>
          <select name="language" id="language" value={selectedLanguage} disabled>
            <option value={selectedLanguage}>{selectedLanguage}</option>
          </select>
          <button onClick={handleTranslate} className="translate">translate</button>
        {translatedResult &&
        <p>{translatedResult}</p>
        }
        </div>
      )}
    </div>
  );
};

export default GrammarCorrection; 