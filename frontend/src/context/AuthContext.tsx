import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, UserLogin, UserRegister } from '../types/auth.types';
import axios, { AxiosError } from 'axios';
import { login as authServiceLogin, register as authServiceRegister } from '../services/auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user]);

  useEffect(() => {
    const checkBackendAvailability = async () => {
      try {
        await axios.get(`${API_URL}/`, { timeout: 5000 });
        setIsBackendAvailable(true);
      } catch (err) {
        console.warn('Backend not available, using fallback mode');
        setIsBackendAvailable(false);
      }
    };
    
    checkBackendAvailability();
    
    const interval = setInterval(checkBackendAvailability, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      
      if (!isBackendAvailable) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
        return;
      }
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000
      });
      
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error fetching user:', err);
      
      if ((err as AxiosError).code === 'ECONNABORTED' || 
          (err as AxiosError).message.includes('Network Error')) {
        setIsBackendAvailable(false);
        
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          return;
        }
      }
      
      logout();
      setError('Session expired. Please login again.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: UserLogin) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let authResponse;
      
      if (isBackendAvailable) {
        try {
          const formData = new FormData();
          formData.append('username', credentials.email);
          formData.append('password', credentials.password);
          
          const response = await axios.post(`${API_URL}/auth/token`, formData, {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
          
          authResponse = response.data;
        } catch (err) {
          console.warn('Backend login failed, using fallback auth service');
          setIsBackendAvailable(false);
          authResponse = await authServiceLogin(credentials);
        }
      } else {
        authResponse = await authServiceLogin(credentials);
      }
      
      const { access_token, user: userData } = authResponse;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if ((err as AxiosError).code === 'ECONNABORTED' || 
          (err as AxiosError).message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please try again later.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegister) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isBackendAvailable) {
        try {
          await axios.post(`${API_URL}/auth/register`, userData, { timeout: 5000 });
        } catch (err) {
          console.warn('Backend registration failed, using fallback auth service');
          setIsBackendAvailable(false);
          await authServiceRegister(userData);
        }
      } else {
        await authServiceRegister(userData);
      }
      
      await login({
        email: userData.email,
        password: userData.password
      });
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if ((err as AxiosError).code === 'ECONNABORTED' || 
          (err as AxiosError).message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please try again later.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        isBackendAvailable,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
