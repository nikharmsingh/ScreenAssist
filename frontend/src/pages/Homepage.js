import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Navbar from './Navbar';

const HomePage = () => {
  const navigate = useNavigate();

  // Mock authentication check
  const isAuthenticated = false; // Replace with actual authentication logic

  if (isAuthenticated) {
    navigate('/landing'); // Redirect to landing page if already logged in
  }

  return (
    <div className="landing-page">
      <Navbar /> {/* Use the new Navbar here */}
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
        <p>Powered by Tekion</p>
      </footer>
    </div>
  );
};

export default HomePage;
