import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGrammarClick = () => {
    // 如果当前不在grammar相关页面，则跳转到sentence correction
    if (!location.pathname.startsWith('/grammar')) {
      navigate('/grammar/correction');
    }
  };

  return (
    <nav className="navbar">
 
      <ul className="nav-links">
        <li className={`home-page ${location.pathname === '/' ? 'active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        </li>
        <li className={`grammar-correction ${location.pathname.startsWith('/grammar') ? 'active' : ''}`}>
          <div 
            className="grammar-header" 
            onClick={handleGrammarClick}
            style={{ cursor: 'pointer' }}
          >
            Grammar Correction
          </div>
          <ul className={`submenu`}>
            <li className={location.pathname === '/grammar/correction' ? 'active' : ''}>
              <NavLink to="/grammar/correction" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Sentence Correction</NavLink>
            </li>
            <li className={location.pathname === '/grammar/qa' ? 'active' : ''}>
              <NavLink to="/grammar/qa" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Grammar Q&A</NavLink>
            </li>
          </ul>
        </li>
        <li className={`pronunciation ${location.pathname === '/pronunciation' ? 'active' : ''}`}>
          <NavLink to="/pronunciation" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Pronounciation Correction</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar; 