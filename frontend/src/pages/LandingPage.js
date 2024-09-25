import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './LandingPage.css';
import { checkAuthStatus } from '../utils/auth';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        navigate('/');
      }
    };

    verifyAuth();
  }, [navigate]);

  return (
    <div className="landing-page">
      <Navbar />
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