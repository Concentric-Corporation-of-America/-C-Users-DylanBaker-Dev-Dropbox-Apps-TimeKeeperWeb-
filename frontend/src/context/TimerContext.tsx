import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { TimeEntry } from '../types/timer.types';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface TimerState {
  id?: string;
  description: string;
  startTime?: string;
  projectId?: string;
  tags: string[];
  isRunning: boolean;
}

interface TimerUpdate {
  description?: string;
  projectId?: string;
  tags?: string[];
}

interface TimerContextType {
  currentTimer: TimerState;
  recentEntries: TimeEntry[];
  isLoading: boolean;
  error: string | null;
  startTimer: (projectId: string | null, description: string, tags: string[]) => Promise<void>;
  stopTimer: () => Promise<void>;
  updateTimer: (update: TimerUpdate) => Promise<void>;
  getTimeEntries: (skip?: number, limit?: number) => Promise<TimeEntry[]>;
  refreshEntries: () => Promise<void>;
}

const defaultTimerState: TimerState = {
  description: '',
  tags: [],
  isRunning: false
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTimer, setCurrentTimer] = useState<TimerState>(defaultTimerState);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      checkCurrentTimer();
      refreshEntries();
    } else {
      setCurrentTimer(defaultTimerState);
      setRecentEntries([]);
    }
  }, [isAuthenticated, token]);

  const checkCurrentTimer = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${API_URL}/timer/current`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const timerData = response.data;
      setCurrentTimer({
        id: timerData.id,
        description: timerData.description,
        startTime: timerData.start_time,
        projectId: timerData.project_id,
        tags: timerData.tags,
        isRunning: true
      });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error checking current timer:', err);
        setError(err.response?.data?.detail || 'Failed to check current timer');
      } else {
        setCurrentTimer(defaultTimerState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEntries = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${API_URL}/timer/entries?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setRecentEntries(response.data);
    } catch (err: any) {
      console.error('Error fetching time entries:', err);
      setError(err.response?.data?.detail || 'Failed to fetch time entries');
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = async (projectId: string | null, description: string, tags: string[]) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const timerData = {
        description,
        project_id: projectId,
        tags
      };
      
      const response = await axios.post(`${API_URL}/timer/start`, timerData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const newTimer = response.data;
      setCurrentTimer({
        id: newTimer.id,
        description: newTimer.description,
        startTime: newTimer.start_time,
        projectId: newTimer.project_id,
        tags: newTimer.tags,
        isRunning: true
      });
      
      await refreshEntries();
    } catch (err: any) {
      console.error('Error starting timer:', err);
      setError(err.response?.data?.detail || 'Failed to start timer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const stopTimer = async () => {
    if (!token) throw new Error('Not authenticated');
    if (!currentTimer.isRunning) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post(`${API_URL}/timer/stop`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCurrentTimer(defaultTimerState);
      await refreshEntries();
    } catch (err: any) {
      console.error('Error stopping timer:', err);
      setError(err.response?.data?.detail || 'Failed to stop timer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimer = async (update: TimerUpdate) => {
    if (!token) throw new Error('Not authenticated');
    if (!currentTimer.isRunning || !currentTimer.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updateData = {
        description: update.description,
        project_id: update.projectId,
        tags: update.tags
      };
      
      await axios.put(`${API_URL}/timer/entries/${currentTimer.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCurrentTimer(prev => ({
        ...prev,
        description: update.description || prev.description,
        projectId: update.projectId || prev.projectId,
        tags: update.tags || prev.tags
      }));
    } catch (err: any) {
      console.error('Error updating timer:', err);
      setError(err.response?.data?.detail || 'Failed to update timer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeEntries = async (skip = 0, limit = 100): Promise<TimeEntry[]> => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${API_URL}/timer/entries?skip=${skip}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Error fetching time entries:', err);
      setError(err.response?.data?.detail || 'Failed to fetch time entries');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        currentTimer,
        recentEntries,
        isLoading,
        error,
        startTimer,
        stopTimer,
        updateTimer,
        getTimeEntries,
        refreshEntries
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export default TimerContext;
