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
          <NavLink id='home' to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        </li>
        
        <li className={location.pathname === '/grammar/correction' ? 'active' : ''}>
          <NavLink id='sentence-correction' to="/grammar/correction" title=' Check and correct your English sentences' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Sentence Correction</NavLink>
        </li>
        <li className={location.pathname === '/grammar/qa' ? 'active' : ''}>
          <NavLink id='grammar-qa' to="/grammar/qa" title='Ask questions about English grammar rules' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Grammar Q&A</NavLink>
        </li>
    
       
      </ul>
    </nav>
  );
}

export default Navbar; 