import api from './api';
import { TimeEntry, TimerUpdate } from '../types/timer.types';
import { timerService as fallbackTimerService } from './apiService';

export const startTimer = async (
  projectId: string | null,
  description: string,
  tags: string[]
): Promise<TimeEntry> => {
  try {
    const response = await api.post('/timer/start', {
      project_id: projectId,
      description,
      tags
    });
    return response.data;
  } catch (error) {
    console.warn('Backend startTimer failed, using mock data');
    return fallbackTimerService.startTimer(projectId, description, tags);
  }
};

export const stopTimer = async (): Promise<TimeEntry> => {
  try {
    const response = await api.post('/timer/stop');
    return response.data;
  } catch (error) {
    console.warn('Backend stopTimer failed, using mock data');
    return fallbackTimerService.stopTimer();
  }
};

export const getCurrentTimer = async (): Promise<TimeEntry | null> => {
  try {
    const response = await api.get('/timer/current');
    return response.data;
  } catch (error) {
    console.warn('Backend getCurrentTimer failed, using mock data');
    return fallbackTimerService.getCurrentTimer();
  }
};

export const updateTimer = async (data: TimerUpdate): Promise<TimeEntry> => {
  try {
    const response = await api.put('/timer/current', data);
    return response.data;
  } catch (error) {
    console.warn('Backend updateTimer failed, using mock data');
    return fallbackTimerService.updateTimer(data);
  }
};

export const getRecentEntries = async (limit: number = 10): Promise<TimeEntry[]> => {
  try {
    const response = await api.get(`/timer/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.warn('Backend getRecentEntries failed, using mock data');
    return fallbackTimerService.getRecentEntries(limit);
  }
};

export const getTimeEntry = async (id: string): Promise<TimeEntry> => {
  try {
    const response = await api.get(`/timer/entries/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend getTimeEntry ${id} failed, using mock data`);
    return {
      id,
      description: 'Mock time entry',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration: 0,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '1'
    };
  }
};

export const updateTimeEntry = async (id: string, data: TimerUpdate): Promise<TimeEntry> => {
  try {
    const response = await api.put(`/timer/entries/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn(`Backend updateTimeEntry ${id} failed, using mock data`);
    return {
      id,
      description: data.description || 'Updated mock entry',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration: 0,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '1',
      project_id: data.projectId
    };
  }
};

export const deleteTimeEntry = async (id: string): Promise<void> => {
  try {
    await api.delete(`/timer/entries/${id}`);
  } catch (error) {
    console.warn(`Backend deleteTimeEntry ${id} failed, using mock data`);
  }
};
