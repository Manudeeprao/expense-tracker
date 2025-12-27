import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:8080/api/auth';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on load
  useEffect(() => {
    // ✅ Change from 'jwtToken' to 'token'
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Assuming you've already added this
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          // If we have a stored userId, use it. Otherwise fetch it from backend using the email in the token
          if (userId) {
            setUser({ email: decoded.sub, id: userId });
                  // store currency if present in local storage already
                  const c = localStorage.getItem('currency');
                  if (c) {
                    // nothing; keep existing value
                  }
          } else {
            // fetch user by email to get id for existing sessions where userId wasn't stored
            (async () => {
              try {
                const resp = await axios.get(`http://localhost:8080/api/users/by-email/${encodeURIComponent(decoded.sub)}`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                const u = resp.data;
                if (u && u.id) {
                  localStorage.setItem('userId', String(u.id));
                  setUser({ email: decoded.sub, id: u.id });
                    if (u.currency) localStorage.setItem('currency', u.currency);
                } else {
                  setUser({ email: decoded.sub, id: undefined });
                }
              } catch (err) {
                // If fetching user fails, still set user with email so UI shows email, but id remains undefined
                setUser({ email: decoded.sub, id: undefined });
              }
            })();
          }
        } else {
          localStorage.removeItem('token'); // ✅ Clear both
          localStorage.removeItem('userId'); // ✅ Clear both
        }
      } catch (e) {
        localStorage.removeItem('token'); // ✅ Clear both
        localStorage.removeItem('userId'); // ✅ Clear both
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    const { token, userId } = response.data;
    const decoded = jwtDecode(token);

    // ✅ Change from 'jwtToken' to 'token'
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);

    setIsAuthenticated(true);
    setUser({ email: decoded.sub, id: userId });
  };

  const logout = () => {
    localStorage.removeItem('token'); // ✅ Clear both
    localStorage.removeItem('userId'); // ✅ Clear both
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    axios.interceptors.request.use(
      (config) => {
        // This is already correct. It uses the 'token' key.
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);