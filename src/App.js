import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GrammarCorrection from './components/GrammarCorrection';

import GrammarQA from './components/GrammarQA';
import './App.css';

const Home = ({ selectedLanguage, setSelectedLanguage, hasSelectedLanguage, setHasSelectedLanguage }) => {
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    setHasSelectedLanguage(true);
  };

  return (
    <div className="home">
       <div className='content'>
      <h1 className='slogan'>Speak Smarter. Write Better.</h1>
     
      <div className="mother-language">
          <span className="arrow-pointing">→</span>
          Your mother language:&nbsp;
          <select
            name="language"
            id="language"
            value={selectedLanguage}
            onChange={handleLanguageChange}
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
      {hasSelectedLanguage && (
        <p className="journey-text">You can correct your grammar and pronunciation here. Please choose the function from the navigation bar and start your journey.</p>
      )}
      {/* <div className="feature-list">
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
       
      </div> */}
      </div>

    </div>
  );
};

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} hasSelectedLanguage={hasSelectedLanguage} setHasSelectedLanguage={setHasSelectedLanguage} />} />
            <Route path="/grammar/correction" element={<GrammarCorrection selectedLanguage={selectedLanguage} />} />
            <Route path="/grammar/qa" element={<GrammarQA selectedLanguage={selectedLanguage} />} />
            
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
