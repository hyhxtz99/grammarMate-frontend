import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GrammarCorrection from './components/GrammarCorrection';
import PronunciationCorrection from './components/PronunciationCorrection';
import GrammarQA from './components/GrammarQA';
import './App.css';

const Home = () => (
  <div className="home">
    <h1>Welcome to English Learning Assistant</h1>
    <p>Please choose the function from the navigation bar:</p>
    <div className="feature-list">
      <div className="feature-item">
        <h3>Grammar Features</h3>
        <ul>
          <li>Sentence Correction - Check and correct your English sentences</li>
          <li>Grammar Q&A - Ask questions about English grammar rules</li>
        </ul>
      </div>
      <div className="feature-item">
        <h3>Pronunciation Features</h3>
        <ul>
          <li>Pronunciation Correction - Practice and improve your English pronunciation</li>
        </ul>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/grammar/correction" element={<GrammarCorrection />} />
            <Route path="/grammar/qa" element={<GrammarQA />} />
            <Route path="/pronunciation" element={<PronunciationCorrection />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
