import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { canAccessAdminPanel } from '../navigation/adminAccess';
import { clearClientSession, refreshAccessToken, setAccessToken } from '../services/api';

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
      clearClientSession();
      try {
        await refreshAccessToken();
        const userData = await authService.getCurrentUser();
        if (cancelled) return;
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        clearClientSession();
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
      setAccessToken(response.access_token);

      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      
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
    authService.logout().catch(() => {});
    clearClientSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
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
