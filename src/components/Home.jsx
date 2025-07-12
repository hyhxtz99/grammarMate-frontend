import React, { useState } from 'react';

import './Home.css';

const Home = ({ hasSelectedLanguage, selectedLanguage,setSelectedLanguage,setHasSelectedLanguage }) => {

  
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

      </div>

    </div>
  );
};


export default Home;