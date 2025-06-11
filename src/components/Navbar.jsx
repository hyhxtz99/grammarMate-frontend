import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const toggleSubmenu = (e) => {
    e.preventDefault();
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>English Learning Assistant</h2>
      </div>
      <ul className="nav-links">
        <li className={`nav-item ${isSubmenuOpen ? 'active' : ''}`}>
          <a href="#" onClick={toggleSubmenu} className="nav-link-with-arrow">
            <span className="arrow">▼</span>Grammar Correction
          </a>
          <ul className={`submenu ${isSubmenuOpen ? 'show' : ''}`}>
            <li><Link to="/grammar/correction">Sentence Correction</Link></li>
            <li><Link to="/grammar/qa">Grammar Q&A</Link></li>
          </ul>
        </li>
        <li className="pronunciation">
          <Link to="/pronunciation">Pronounciation Correction</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar; 