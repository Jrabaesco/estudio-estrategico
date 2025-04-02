import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  }

  const handleLogout = () => {
    closeMenu();
    logout(); 
    navigate.push('/login'); 
  };

  return (
    <div className='container_navbar'>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/dashboard">
            <img src="favicon.ico" alt="Logo" />
          </Link>
        </div>
        <img src="/images/menu-icon.png" alt="Menu" className="menu-icon" onClick={toggleMenu} />
        <ul className={isOpen ? 'open' : ''}>
          <li><Link to="/dashboard" onClick={closeMenu}>Inicio</Link></li>
          <li><Link to="/ballot" onClick={closeMenu}>Balotario Didáctico</Link></li>
          <li><Link to="/exam-generator" onClick={closeMenu}>Examen por Temas</Link></li>
          <li><Link to="/general-exam" onClick={closeMenu}>Examen General</Link></li>
          <li><button onClick={handleLogout}>Salir</button></li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
