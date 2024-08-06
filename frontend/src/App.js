import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import QueryPage from './pages/QueryPage';
import logo from './assets/logo.png';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/upload">Upload</Link>
            <Link to="/query">Query</Link>
            <Link to="/signin" className="signin">Sign in</Link>
            <Link to="/register" className="register">Register</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/query" element={<QueryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;