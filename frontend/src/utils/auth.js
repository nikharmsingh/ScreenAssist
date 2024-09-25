import api from '../api/axios';

export const checkAuthStatus = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await api.get('/check-auth', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.authenticated;
  } catch (err) {
    console.error('Error checking authentication:', err);
    return false;
  }
};