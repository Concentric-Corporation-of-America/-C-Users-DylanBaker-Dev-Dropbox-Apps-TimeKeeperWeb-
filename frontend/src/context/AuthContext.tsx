import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, UserLogin, UserRegister, VerificationRequest, OnboardingRequest } from '../types/auth.types';
import axios, { AxiosError } from 'axios';
import { 
  login as authServiceLogin, 
  register as authServiceRegister, 
  verifyEmail as authServiceVerifyEmail,
  resendVerification as authServiceResendVerification,
  completeOnboarding as authServiceCompleteOnboarding
} from '../services/auth.service';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// Use the VITE_USE_MOCK_API environment variable to determine fallback behavior
const USE_FALLBACK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Log configuration on startup
console.log('🔐 Auth Configuration:');
console.log(`   API URL: ${API_URL}`);
console.log(`   Mock API: ${USE_FALLBACK ? 'Enabled' : 'Disabled'}`);

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
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(!USE_FALLBACK);

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user]);

  useEffect(() => {
    if (USE_FALLBACK) {
      console.log('🔶 Mock API explicitly enabled via environment variable');
      setIsBackendAvailable(false);
      return;
    }
    
    const checkBackendAvailability = async () => {
      try {
        console.log(`🔄 Checking backend availability at ${API_URL}/healthz...`);
        // Check the /healthz endpoint instead of root with longer timeout
        await axios.get(`${API_URL}/healthz`, { timeout: 10000 });
        console.log('✅ Backend connection successful! Online mode activated.');
        setIsBackendAvailable(true);
      } catch (err: any) {
        console.warn(`❌ Backend connection failed: ${err.message}`);
        console.warn('⚠️ Falling back to offline mode');
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
        timeout: 10000 // Increased timeout
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
      
      let registerResponse;
      
      if (isBackendAvailable) {
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData, { timeout: 5000 });
          registerResponse = response.data;
        } catch (err) {
          console.warn('Backend registration failed, using fallback auth service');
          setIsBackendAvailable(false);
          registerResponse = await authServiceRegister(userData);
        }
      } else {
        registerResponse = await authServiceRegister(userData);
      }
      
      // Don't automatically log in after registration - require email verification
      setUser(registerResponse);
      
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

  const verifyEmail = async (verification: VerificationRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let verifyResponse: any = null;
      
      if (isBackendAvailable) {
        try {
          const response = await axios.post(`${API_URL}/auth/verify-email`, verification, { timeout: 5000 });
          verifyResponse = response.data;
        } catch (err) {
          console.warn('Backend verification failed, using fallback auth service');
          setIsBackendAvailable(false);
          verifyResponse = await authServiceVerifyEmail(verification);
        }
      } else {
        verifyResponse = await authServiceVerifyEmail(verification);
      }
      
      // Update user state with verification data if needed
      if (verifyResponse && user) {
        setUser({...user, is_verified: true});
      }
      
      // After verification, log the user in
      await login({
        email: verification.email,
        password: '' // This would come from a form in the verification page
      });
      
    } catch (err: any) {
      console.error('Verification error:', err);
      
      let errorMessage = 'Verification failed. Please try again.';
      
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

  const resendVerification = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isBackendAvailable) {
        try {
          await axios.post(`${API_URL}/auth/resend-verification?email=${email}`, {}, { timeout: 5000 });
        } catch (err) {
          console.warn('Backend resend verification failed, using fallback auth service');
          setIsBackendAvailable(false);
          await authServiceResendVerification(email);
        }
      } else {
        await authServiceResendVerification(email);
      }
      
    } catch (err: any) {
      console.error('Resend verification error:', err);
      
      let errorMessage = 'Could not resend verification email. Please try again.';
      
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

  const completeOnboarding = async (onboarding: OnboardingRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let onboardingResponse;
      
      if (isBackendAvailable) {
        try {
          const response = await axios.post(
            `${API_URL}/auth/onboarding`, 
            onboarding, 
            { 
              timeout: 5000,
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          onboardingResponse = response.data;
        } catch (err) {
          console.warn('Backend onboarding failed, using fallback auth service');
          setIsBackendAvailable(false);
          onboardingResponse = await authServiceCompleteOnboarding(onboarding);
        }
      } else {
        onboardingResponse = await authServiceCompleteOnboarding(onboarding);
      }
      
      // Update the user data with the onboarding information
      setUser(onboardingResponse);
      localStorage.setItem('user', JSON.stringify(onboardingResponse));
      
    } catch (err: any) {
      console.error('Onboarding error:', err);
      
      let errorMessage = 'Could not complete onboarding. Please try again.';
      
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
        verifyEmail,
        resendVerification,
        completeOnboarding,
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
