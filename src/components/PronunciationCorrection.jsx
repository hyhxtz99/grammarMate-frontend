import React, { useState } from 'react';
import './PronunciationCorrection.css';

function PronunciationCorrection() {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [fluency, setFluency] = useState(null);
  const [completeness, setCompleteness] = useState(null);
  const [spokenText, setSpokenText] = useState('');
  const [referenceText, setReferenceText] = useState('');

  const startRecording = async () => {
    setIsRecording(true);
    setFeedback('');
    setScore(null);
    setAccuracy(null);
    setFluency(null);
    setCompleteness(null);
    setSpokenText('');
    setReferenceText('');
    try {
      await fetch('http://localhost:5000/api/pronunciation/start', { method: 'POST' });
    } catch {}
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      const resp = await fetch('http://localhost:5000/api/pronunciation/stop', { method: 'POST' });
      const data = await resp.json();
      setFeedback(data.feedback || '');
      setScore(data.score || null);
      setAccuracy(data.accuracy || null);
      setFluency(data.fluency || null);
      setCompleteness(data.completeness || null);
      setSpokenText(data.spoken_text || '');
      setReferenceText(data.reference_text || '');
    } catch {
      setFeedback('Error analyzing pronunciation');
      setScore(null);
      setAccuracy(null);
      setFluency(null);
      setCompleteness(null);
      setSpokenText('');
      setReferenceText('');
    }
  };

  return (
    <div className="pronunciation-container">
      <h2>pronunciation correction</h2>
      Please wait for one second after the recording starts before speaking.
      <div className="recording-controls">
     
        <button
          className={isRecording ? 'recording' : ''}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'stop recording' : 'start recording'}
        </button>
      </div>
      {(feedback || score !== null) && (
        <div className="feedback-result">
          <h3>analysis result:</h3>
          {referenceText && <p><b>Reference:</b> {referenceText}</p>}
          {spokenText && <p><b>You read:</b> {spokenText}</p>}
          {score !== null && <p><b>Score:</b> {score}</p>}
          {accuracy !== null && <p><b>Accuracy:</b> {accuracy}</p>}
          {fluency !== null && <p><b>Fluency:</b> {fluency}</p>}
          {completeness !== null && <p><b>Completeness:</b> {completeness}</p>}
         
        </div>
      )}
    </div>
  );
}

export default PronunciationCorrection; 