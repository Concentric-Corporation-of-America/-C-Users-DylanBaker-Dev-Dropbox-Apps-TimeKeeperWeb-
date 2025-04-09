import api from './api';
import { mockAuthApi, mockProjectApi, mockTimerApi, mockReportApi } from './mockApi';
import { UserLogin, UserRegister, VerificationRequest, OnboardingRequest } from '../types/auth.types';
import { ProjectCreate, ProjectUpdate } from '../types/project.types';
import { TimerUpdate } from '../types/timer.types';
import { ReportFilters } from './report.service';

// Use the environment variable to determine if mock API should be used
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false;
console.log(`API Service Mode: ${USE_MOCK_API ? 'Using Mock Data' : 'Using Backend'}`);

// Cached backend availability state
let isBackendAvailable: boolean | null = null;
const AVAILABILITY_CACHE_TIME = 15000; // 15 seconds
let lastAvailabilityCheck = 0;

const checkBackendAvailability = async (): Promise<boolean> => {
  // Force mock if configured in env
  if (USE_MOCK_API) {
    console.log('🔸 Mock API explicitly enabled via environment, using mock data');
    return false;
  }
  
  // Return cached result if it's recent
  const now = Date.now();
  if (isBackendAvailable !== null && (now - lastAvailabilityCheck) < AVAILABILITY_CACHE_TIME) {
    console.log(`🔄 Using cached backend availability: ${isBackendAvailable}`);
    return isBackendAvailable;
  }
  
  try {
    // Try to reach the backend healthcheck endpoint
    console.log('🔄 Checking backend availability at /healthz...');
    const response = await api.get('/healthz', { timeout: 10000 });
    console.log('📡 Backend response:', response.data);
    
    // Update cached state
    isBackendAvailable = true;
    lastAvailabilityCheck = now;
    
    console.log('✅ Backend API is available');
    return true;
  } catch (error: any) {
    // Update cached state
    isBackendAvailable = false;
    lastAvailabilityCheck = now;
    
    console.warn('❌ Backend API check failed:', error.message);
    console.warn('⚠️ Falling back to mock data');
    return false;
  }
};

export const authService = {
  login: async (credentials: UserLogin) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post('/auth/login', credentials);
        return response.data;
      } else {
        return mockAuthApi.login(credentials);
      }
    } catch (error) {
      console.error('Login error:', error);
      return mockAuthApi.login(credentials);
    }
  },
  
  register: async (userData: UserRegister) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post('/auth/register', userData);
        return response.data;
      } else {
        return mockAuthApi.register(userData);
      }
    } catch (error) {
      console.error('Registration error:', error);
      return mockAuthApi.register(userData);
    }
  },
  
  verifyEmail: async (verification: VerificationRequest) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post('/auth/verify-email', verification);
        return response.data;
      } else {
        return mockAuthApi.verifyEmail(verification);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return mockAuthApi.verifyEmail(verification);
    }
  },
  
  resendVerification: async (email: string) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post(`/auth/resend-verification?email=${email}`);
        return response.data;
      } else {
        return mockAuthApi.resendVerification(email);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return mockAuthApi.resendVerification(email);
    }
  },
  
  completeOnboarding: async (onboarding: OnboardingRequest) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post('/auth/onboarding', onboarding);
        return response.data;
      } else {
        return mockAuthApi.completeOnboarding(onboarding);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      return mockAuthApi.completeOnboarding(onboarding);
    }
  },
  
  logout: async () => {
    try {
      if (await checkBackendAvailability()) {
        await api.post('/auth/logout');
      }
      mockAuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      mockAuthApi.logout();
    }
  }
};

export const projectService = {
  getProjects: async () => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get('/projects');
        return response.data;
      } else {
        return mockProjectApi.getProjects();
      }
    } catch (error) {
      console.error('Get projects error:', error);
      return mockProjectApi.getProjects();
    }
  },
  
  getProject: async (id: string) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get(`/projects/${id}`);
        return response.data;
      } else {
        return mockProjectApi.getProject(id);
      }
    } catch (error) {
      console.error(`Get project ${id} error:`, error);
      return mockProjectApi.getProject(id);
    }
  },
  
  createProject: async (data: ProjectCreate) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post('/projects', data);
        return response.data;
      } else {
        return mockProjectApi.createProject(data);
      }
    } catch (error) {
      console.error('Create project error:', error);
      return mockProjectApi.createProject(data);
    }
  },
  
  updateProject: async (id: string, data: ProjectUpdate) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.put(`/projects/${id}`, data);
        return response.data;
      } else {
        return mockProjectApi.updateProject(id, data);
      }
    } catch (error) {
      console.error(`Update project ${id} error:`, error);
      return mockProjectApi.updateProject(id, data);
    }
  },
  
  deleteProject: async (id: string) => {
    try {
      if (await checkBackendAvailability()) {
        await api.delete(`/projects/${id}`);
      } else {
        await mockProjectApi.deleteProject(id);
      }
    } catch (error) {
      console.error(`Delete project ${id} error:`, error);
      await mockProjectApi.deleteProject(id);
    }
  }
};

export const timerService = {
  startTimer: async (projectId: string | null, description: string, tags: string[]) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post('/timer/start', {
          project_id: projectId,
          description,
          tags
        });
        return response.data;
      } else {
        return mockTimerApi.startTimer({
          projectId: projectId === null ? undefined : projectId,
          description,
          tags
        });
      }
    } catch (error) {
      console.error('Start timer error:', error);
      return mockTimerApi.startTimer({
        projectId: projectId === null ? undefined : projectId,
        description,
        tags
      });
    }
  },
  
  stopTimer: async () => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.post('/timer/stop');
        return response.data;
      } else {
        return mockTimerApi.stopTimer();
      }
    } catch (error) {
      console.error('Stop timer error:', error);
      return mockTimerApi.stopTimer();
    }
  },
  
  getCurrentTimer: async () => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get('/timer/current');
        return response.data;
      } else {
        return mockTimerApi.getCurrentTimer();
      }
    } catch (error) {
      console.error('Get current timer error:', error);
      return mockTimerApi.getCurrentTimer();
    }
  },
  
  updateTimer: async (data: TimerUpdate) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.put('/timer/current', data);
        return response.data;
      } else {
        return mockTimerApi.updateTimer(data);
      }
    } catch (error) {
      console.error('Update timer error:', error);
      return mockTimerApi.updateTimer(data);
    }
  },
  
  getRecentEntries: async (limit: number = 10) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get('/timer/entries', {
          params: { limit }
        });
        return response.data;
      } else {
        return mockTimerApi.getRecentEntries(limit);
      }
    } catch (error) {
      console.error('Get recent entries error:', error);
      return mockTimerApi.getRecentEntries(limit);
    }
  }
};

export const reportService = {
  generateReport: async (filters: ReportFilters) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get('/reports/generate', {
          params: filters
        });
        return response.data;
      } else {
        return mockReportApi.generateReport(filters);
      }
    } catch (error) {
      console.error('Generate report error:', error);
      return mockReportApi.generateReport(filters);
    }
  },
  
  exportReport: async (filters: ReportFilters, format: 'csv' | 'pdf') => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get(`/reports/export/${format}`, {
          params: filters,
          responseType: 'blob'
        });
        return response.data;
      } else {
        return mockReportApi.exportReport(filters, format);
      }
    } catch (error) {
      console.error(`Export report as ${format} error:`, error);
      return mockReportApi.exportReport(filters, format);
    }
  },
  
  getProjectSummary: async (projectId: string) => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get(`/reports/project/${projectId}/summary`);
        return response.data;
      } else {
        return mockReportApi.getProjectSummary(projectId);
      }
    } catch (error) {
      console.error(`Get project ${projectId} summary error:`, error);
      return mockReportApi.getProjectSummary(projectId);
    }
  },
  
  getUserSummary: async () => {
    try {
      if (await checkBackendAvailability()) {
        const response = await api.get('/reports/user/summary');
        return response.data;
      } else {
        return mockReportApi.getUserSummary();
      }
    } catch (error) {
      console.error('Get user summary error:', error);
      return mockReportApi.getUserSummary();
    }
  }
};
