import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // User details, token, role, loading state ivide manage cheyyunnu
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Current user-ne fetch cheyyan ulla function
    const fetchUser = async () => {
      // Token illenkil loading false aakki return cheyyum
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Backend-il ninnu user data edukkuvan api call cheyyunnu
        const res = await api.get('/auth/me');
        if (res.data.success) {
          // User data kittiyal state-il set cheyyum
          setUser(res.data.data);
          setRole(res.data.data.role);
          localStorage.setItem('role', res.data.data.role);
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
        // Error vannal logout cheyyum
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // User login cheyumbol details local storage-il save cheyyum
  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newUser.role);
    setToken(newToken);
    setRole(newUser.role);
    setUser(newUser);
  };

  // User logout cheyumbol local storage clear cheythu login page-lekku pokum
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setUser(null);
    window.location.href = '/auth';
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    role,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
