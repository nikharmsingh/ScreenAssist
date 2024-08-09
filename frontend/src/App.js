// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import QueryPage from './pages/QueryPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/screen-assist" element={<LandingPage />} /> {/* Correct path for Landing Page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;