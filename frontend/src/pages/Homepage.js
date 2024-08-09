import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/tekion_logo.png';
import logo1 from '../assets/logo1.png';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Tekion Logo" />
        </div>
        <nav className="nav-links">
          <select className="dropdown">
            <option>Repair Order...</option>
          </select>
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="get-help">
            <button className="dropbtn">Get Help</button>
            <div className="dropdown-content">
              <Link to="/chat">Chat with TARA</Link>
              <Link to="/ticket">Submit a Ticket</Link>
              <Link to="/screen-assist">Screen Assist</Link>
              <Link to="/knowledge-base">Knowledge Base</Link>
              <Link to="/onboarding">Tekion Onboarding</Link>
              <Link to="/integration-health">Integration Health</Link>
              <Link to="/status-page">Status Page</Link>
            </div>
          </div>
        </nav>
        <div className="user-info">
          <div className="user-logo">TM</div>
          <span>Tech Motors</span>
        </div>
      </header>
      <main className="main-content">
        <img src={logo1} alt="Automotive Retail Cloud" />
      </main>
    </div>
  );
};

export default Homepage;