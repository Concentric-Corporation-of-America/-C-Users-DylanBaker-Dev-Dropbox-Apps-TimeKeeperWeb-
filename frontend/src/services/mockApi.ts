import { User, UserLogin, UserRegister } from '../types/auth.types';
import { Project, ProjectCreate, ProjectUpdate } from '../types/project.types';
import { TimeEntry, TimerUpdate } from '../types/timer.types';
import { ReportFilters, ReportData } from './report.service';

let currentUser: User | null = null;
let projects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Redesign company website with new branding',
    color: '#3b82f6',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '1'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Develop iOS and Android mobile applications',
    color: '#10b981',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: '1'
  }
];

let timeEntries: TimeEntry[] = [
  {
    id: '1',
    user_id: '1',
    project_id: '1',
    description: 'Working on homepage design',
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date().toISOString(),
    duration: 3600,
    tags: ['design', 'frontend'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '1',
    project_id: '2',
    description: 'API integration',
    start_time: new Date(Date.now() - 7200000).toISOString(),
    end_time: new Date(Date.now() - 3600000).toISOString(),
    duration: 3600,
    tags: ['backend', 'api'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let currentTimer: TimeEntry | null = null;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => Math.random().toString(36).substring(2, 15);

export const mockAuthApi = {
  login: async (data: UserLogin) => {
    await delay(500);
    
    if (data.email === 'demo@example.com' && data.password === 'password') {
      currentUser = {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        created_at: new Date().toISOString()
      };
      
      return {
        access_token: 'mock_token',
        token_type: 'bearer',
        user: currentUser
      };
    }
    
    currentUser = {
      id: '1',
      email: data.email,
      name: 'Test User',
      created_at: new Date().toISOString()
    };
    
    return {
      access_token: 'mock_token',
      token_type: 'bearer',
      user: currentUser
    };
  },
  
  register: async (data: UserRegister) => {
    await delay(500);
    
    currentUser = {
      id: '1',
      email: data.email,
      name: data.name,
      created_at: new Date().toISOString()
    };
    
    return currentUser;
  },
  
  logout: () => {
    currentUser = null;
  },
  
  getCurrentUser: () => {
    return currentUser;
  },
  
  isAuthenticated: () => {
    return !!currentUser;
  }
};

export const mockProjectApi = {
  getProjects: async () => {
    await delay(300);
    return projects;
  },
  
  getProject: async (id: string) => {
    await delay(300);
    const project = projects.find(p => p.id === id);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project;
  },
  
  createProject: async (data: ProjectCreate) => {
    await delay(500);
    
    const newProject: Project = {
      id: generateId(),
      name: data.name,
      description: data.description || '',
      color: data.color || '#3b82f6',
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '1'
    };
    
    projects.push(newProject);
    return newProject;
  },
  
  updateProject: async (id: string, data: ProjectUpdate) => {
    await delay(500);
    
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...projects[projectIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    projects[projectIndex] = updatedProject;
    return updatedProject;
  },
  
  deleteProject: async (id: string) => {
    await delay(500);
    
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    projects.splice(projectIndex, 1);
  }
};

export const mockTimerApi = {
  startTimer: async (data: {
    projectId?: string;
    description: string;
    tags: string[];
  }) => {
    await delay(300);
    
    if (currentTimer) {
      throw new Error('Timer already running');
    }
    
    const newTimer: TimeEntry = {
      id: generateId(),
      user_id: currentUser?.id || '1',
      project_id: data.projectId,
      description: data.description,
      start_time: new Date().toISOString(),
      tags: data.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    currentTimer = newTimer;
    return newTimer;
  },
  
  stopTimer: async () => {
    await delay(300);
    
    if (!currentTimer) {
      throw new Error('No timer running');
    }
    
    const now = new Date();
    const startTime = new Date(currentTimer.start_time);
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    const completedTimer: TimeEntry = {
      ...currentTimer,
      end_time: now.toISOString(),
      duration,
      updated_at: now.toISOString()
    };
    
    timeEntries.unshift(completedTimer);
    currentTimer = null;
    
    return completedTimer;
  },
  
  getCurrentTimer: async () => {
    await delay(200);
    return currentTimer;
  },
  
  updateTimer: async (data: TimerUpdate) => {
    await delay(300);
    
    if (!currentTimer) {
      throw new Error('No timer running');
    }
    
    currentTimer = {
      ...currentTimer,
      ...data,
      updated_at: new Date().toISOString()
    };
    
    return currentTimer;
  },
  
  getRecentEntries: async (limit: number = 10) => {
    await delay(300);
    return timeEntries.slice(0, limit);
  },
  
  getTimeEntry: async (id: string) => {
    await delay(300);
    
    const entry = timeEntries.find(e => e.id === id);
    
    if (!entry) {
      throw new Error('Time entry not found');
    }
    
    return entry;
  },
  
  updateTimeEntry: async (id: string, data: TimerUpdate) => {
    await delay(500);
    
    const entryIndex = timeEntries.findIndex(e => e.id === id);
    
    if (entryIndex === -1) {
      throw new Error('Time entry not found');
    }
    
    const updatedEntry = {
      ...timeEntries[entryIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    timeEntries[entryIndex] = updatedEntry;
    return updatedEntry;
  },
  
  deleteTimeEntry: async (id: string) => {
    await delay(500);
    
    const entryIndex = timeEntries.findIndex(e => e.id === id);
    
    if (entryIndex === -1) {
      throw new Error('Time entry not found');
    }
    
    timeEntries.splice(entryIndex, 1);
  }
};

export const mockReportApi = {
  generateReport: async (filters: ReportFilters): Promise<ReportData[]> => {
    await delay(500);
    
    const mockData: ReportData[] = [];
    
    if (filters.reportType === 'time') {
      mockData.push({ name: 'Monday', hours: 5.2 });
      mockData.push({ name: 'Tuesday', hours: 7.5 });
      mockData.push({ name: 'Wednesday', hours: 6.8 });
      mockData.push({ name: 'Thursday', hours: 8.1 });
      mockData.push({ name: 'Friday', hours: 4.5 });
    } else if (filters.reportType === 'project') {
      mockData.push({ name: 'Website Redesign', hours: 15.3 });
      mockData.push({ name: 'Mobile App Development', hours: 12.8 });
      mockData.push({ name: 'Marketing Campaign', hours: 8.5 });
    } else if (filters.reportType === 'tag') {
      mockData.push({ name: 'design', hours: 10.2 });
      mockData.push({ name: 'development', hours: 18.5 });
      mockData.push({ name: 'meetings', hours: 5.8 });
      mockData.push({ name: 'research', hours: 3.2 });
    }
    
    return mockData;
  },
  
  exportReport: async (_filters: ReportFilters, format: 'csv' | 'pdf'): Promise<Blob> => {
    await delay(1000);
    
    return new Blob(['Mock report data'], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
  },
  
  getProjectSummary: async (_projectId: string): Promise<any> => {
    await delay(500);
    
    return {
      totalHours: 28.1,
      thisWeek: 12.5,
      lastWeek: 15.6,
      tasks: [
        { name: 'Design', hours: 10.2 },
        { name: 'Development', hours: 15.3 },
        { name: 'Testing', hours: 2.6 }
      ]
    };
  },
  
  getUserSummary: async (): Promise<any> => {
    await delay(500);
    
    return {
      totalHours: 42.3,
      thisWeek: 18.7,
      lastWeek: 23.6,
      projects: [
        { name: 'Website Redesign', hours: 15.3 },
        { name: 'Mobile App Development', hours: 12.8 },
        { name: 'Marketing Campaign', hours: 8.5 },
        { name: 'Other', hours: 5.7 }
      ]
    };
  }
};
