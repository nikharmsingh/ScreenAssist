import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar'; // Import the new Navbar
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar /> {/* Use the new Navbar here */}
      <main className="main">
      <h1>ScreenAssist</h1>
      <p>Chat with your Videos</p>
      <div className="buttons">
        <Link to="/upload">
          <button>Upload</button>
        </Link>
        <Link to="/query">
          <button>Query</button>
        </Link>
        <Link to="/">
          <button>Go Back</button>
        </Link>
      </div>
      </main>
      <footer className="footer">
        <p>Powered by Tekion</p>
      </footer>
    </div>
  );
};

export default LandingPage;