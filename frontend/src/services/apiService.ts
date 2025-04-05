import api from './api';
import { mockAuthApi, mockProjectApi, mockTimerApi, mockReportApi } from './mockApi';
import { UserLogin, UserRegister } from '../types/auth.types';
import { ProjectCreate, ProjectUpdate } from '../types/project.types';
import { TimerUpdate } from '../types/timer.types';
import { ReportFilters } from './report.service';

const USE_MOCK_API = true; // Set to false to use real API

const checkBackendAvailability = async (): Promise<boolean> => {
  if (USE_MOCK_API) return false;
  
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.warn('Backend API is not available, falling back to mock data');
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
