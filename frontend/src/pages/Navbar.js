import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Ensure the path is correct
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="Logo" />
      </Link>
    </header>
  );
};

export default Navbar;