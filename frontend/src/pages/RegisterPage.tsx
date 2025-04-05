import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { UserRegister } from '../types/auth.types';

const RegisterPage: React.FC = () => {
  const { register, error, clearError, isAuthenticated, isBackendAvailable } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserRegister>({
    email: '',
    name: '',
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
    if (!formData.name.trim()) {
      setLocalError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
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
      await register(formData);
    } catch (err: any) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
          
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterPage;
