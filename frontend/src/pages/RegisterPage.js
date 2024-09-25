import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from '../api/axios'; // Import the Axios instance
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', formData);
      console.log(response.data.message);
      navigate('/login');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="register-page">
      <Navbar />
      <main className="register-main">
        <h1>ScreenAssist Register</h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" required />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          {errors.general && <span className="error">{errors.general}</span>}
          <button type="submit" className="register-button">Register</button>
        </form>
        <div className="back-link">
          <Link to="/">Back to Homepage</Link>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;