import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectEditPage from './pages/ProjectEditPage';
import TimerPage from './pages/TimerPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={isAuthenticated ? <DashboardPage /> : <HomePage />} />
        <Route path="/dashboard" element={
          isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
        } />
        <Route path="/projects" element={
          isAuthenticated ? <ProjectsPage /> : <Navigate to="/login" />
        } />
        <Route path="/projects/:id" element={
          isAuthenticated ? <ProjectDetailsPage /> : <Navigate to="/login" />
        } />
        <Route path="/projects/:id/edit" element={
          isAuthenticated ? <ProjectEditPage /> : <Navigate to="/login" />
        } />
        <Route path="/timer" element={
          isAuthenticated ? <TimerPage /> : <Navigate to="/login" />
        } />
        <Route path="/reports" element={
          isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />
        } />
        <Route path="/settings" element={
          isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />
        } />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
