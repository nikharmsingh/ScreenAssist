import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Adjust the base URL to match your backend server
});

export default api;