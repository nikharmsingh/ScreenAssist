import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../api/axios'; // Import the Axios instance
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', formData);
      console.log(response.data.message);
      navigate('/landing'); // Redirect to landing page on successful login
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <main className="login-main">
        <h1>ScreenAssist Login Page</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
          </div>
          {error && <span className="error">{error}</span>}
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="back-link">
          <Link to="/">Back to Homepage</Link>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;