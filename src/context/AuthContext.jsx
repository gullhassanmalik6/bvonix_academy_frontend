import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { canAccessAdminPanel } from '../navigation/adminAccess';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const cached = JSON.parse(storedUser);
        if (!cancelled) {
          setUser(cached);
          setIsAuthenticated(true);
        }
        const userData = await authService.getCurrentUser();
        if (cancelled) return;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { access_token } = response;
      
      // Store token
      localStorage.setItem('token', access_token);
      
      // Get user data
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { 
        success: true,
        canAccessAdmin: canAccessAdminPanel(userData.role),
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (data) => {
    try {
      // Register the user
      await authService.register(data);
      
      // Auto-login after registration
      const loginResult = await login(data.email, data.password);
      
      if (loginResult.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: loginResult.error || 'Registration successful but login failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.detail || error.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const isAdmin = user?.role === 'admin';
  const canAccessAdmin = canAccessAdminPanel(user?.role);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    canAccessAdmin,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
