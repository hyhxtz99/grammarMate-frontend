import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GrammarCorrection from './components/GrammarCorrection';
import PronunciationCorrection from './components/PronunciationCorrection';
import GrammarQA from './components/GrammarQA';
import './App.css';

const Home = ({ selectedLanguage, setSelectedLanguage }) => (
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
      <div className="mother-language">
        mother language:
        <select
          name="language"
          id="language"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="zh-Hans">Chinese (Simplified)</option>
          <option value="sw">Swahili</option>
          <option value="ha">Hausa</option>
          <option value="yo">Yoruba</option>
          <option value="ig">Igbo</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="pt">Portuguese</option>
          <option value="ar">Arabic</option>
          <option value="bn">Bengali</option>
          <option value="hi">Hindi</option>
          <option value="ne">Nepali</option>
          <option value="my">Burmese</option>
          <option value="km">Khmer</option>
          <option value="lo">Lao</option>
          <option value="am">Amharic</option>
          <option value="om">Oromo</option>
          <option value="rw">Kinyarwanda</option>
          <option value="so">Somali</option>
          <option value="ug">Uyghur</option>
        </select>
      </div>
    </div>
  </div>
);

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />} />
            <Route path="/grammar/correction" element={<GrammarCorrection selectedLanguage={selectedLanguage} />} />
            <Route path="/grammar/qa" element={<GrammarQA selectedLanguage={selectedLanguage} />} />
            <Route path="/pronunciation" element={<PronunciationCorrection />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
