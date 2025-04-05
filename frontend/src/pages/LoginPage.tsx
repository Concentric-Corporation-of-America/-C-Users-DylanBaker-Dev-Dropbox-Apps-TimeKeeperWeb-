import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { UserLogin } from '../types/auth.types';

const LoginPage: React.FC = () => {
  const { login, error, clearError, isAuthenticated, isBackendAvailable } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserLogin>({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
    if (localError) setLocalError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setLocalError('Password is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(formData);
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'password'
    });
    if (error) clearError();
    if (localError) setLocalError(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Log In</CardTitle>
        {!isBackendAvailable && (
          <div className="text-amber-600 text-sm text-center mt-2 p-2 bg-amber-50 rounded">
            Note: Running in offline mode. Your account will be stored locally.
          </div>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {(error || localError) && (
            <Alert variant="destructive">
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mt-2" 
            onClick={fillDemoAccount}
          >
            Use Demo Account
          </Button>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
          
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginPage;
