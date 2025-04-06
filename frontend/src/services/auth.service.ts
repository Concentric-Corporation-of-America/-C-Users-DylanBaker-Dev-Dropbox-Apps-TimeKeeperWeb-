import api from './api';
import { User, UserLogin, UserRegister } from '../types/auth.types';
import { authService as fallbackAuthService } from './apiService';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const login = async (data: UserLogin): Promise<AuthResponse> => {
  try {
    const formData = new FormData();
    formData.append('username', data.email);
    formData.append('password', data.password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.warn('Backend login failed, using mock data');
    const mockResponse = await fallbackAuthService.login(data);
    
    localStorage.setItem('token', mockResponse.access_token);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));
    
    return mockResponse;
  }
};

export const register = async (data: UserRegister): Promise<User> => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.warn('Backend registration failed, using mock data');
    return fallbackAuthService.register(data);
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
