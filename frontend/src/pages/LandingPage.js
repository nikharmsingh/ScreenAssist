import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1>VideoGPT</h1>
      <p>Chat with your Videos</p>
      <div className="buttons">
        <Link to="/upload">
          <button>Upload</button>
        </Link>
        <Link to="/query">
          <button>Query</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;