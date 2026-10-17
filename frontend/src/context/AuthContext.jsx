import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default axios base URL if needed, although vite proxy takes care of it
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error validating stored session:', err.response?.data?.msg || err.message);
          // Token expired or invalid
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      setToken(userToken);
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.msg || 'Failed to authenticate. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      setToken(userToken);
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.msg || 'Registration failed. Try using another email.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
