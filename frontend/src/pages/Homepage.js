import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Navbar from './Navbar';
import { checkAuthStatus } from '../utils/auth';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        navigate('/landing');
      }
    };

    verifyAuth();
  }, [navigate]);

  return (
    <div className="landing-page">
      <Navbar />
      <main className="screen-assist-main">
        <h1>ScreenAssist</h1>
        <p>Chat with your Videos</p>
        <div className="buttons">
          <Link to="/Login">
            <button>Login</button>
          </Link>
          <Link to="/Register">
            <button>Register</button>
          </Link>
        </div>
      </main>
      <footer className="footer">
        <p>Created With Love &hearts;</p>
      </footer>
    </div>
  );
};

export default HomePage;