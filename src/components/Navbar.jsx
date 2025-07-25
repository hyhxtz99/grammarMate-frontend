import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NavLink, } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const toggleNavbar = () => setCollapsed(c => !c);


  return (
    <nav className={`navbar${collapsed ? ' collapsed' : ''}`}>
      <button className="navbar-toggle-btn" onClick={toggleNavbar} title={collapsed ? 'Expand' : 'Collapse'}>
        {collapsed ? '⮞' : '⮜'}
      </button>
      <ul className="nav-links">
        <li className={`home-page ${location.pathname === '/' ? 'active' : ''}`}>
          <NavLink id='home' to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {collapsed ? '🏠' : 'Home'}
          </NavLink>
        </li>
        <li className={location.pathname === '/grammar/correction' ? 'active' : ''}>
          <NavLink id='sentence-correction' to="/grammar/correction" title='Check and correct your English sentences' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {collapsed ? '📝' : 'Fix My Sentence'}
          </NavLink>
        </li>
        <li className={location.pathname === '/grammar/qa' ? 'active' : ''}>
          <NavLink id='grammar-qa' to="/grammar/qa" title='Ask questions about English grammar rules' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {collapsed ? '❓' : 'Grammar Q&A'}
          </NavLink>
        </li>
        <li className={location.pathname === '/personalise_correction' ? 'active' : ''}>
          <NavLink id='personalise-correction' to="/personalise_correction" title='Personalise grammar correction' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {collapsed ? '⭐' : 'My Corrections'}
          </NavLink>
        </li>
        <li className={location.pathname === '/personal' ? 'active' : ''}>
          <NavLink id='personal-centre' to="/personal" title='Change your account information and logout' className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {collapsed ? '👤' : 'Account'}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar; 