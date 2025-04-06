import api from './api';
import { Project, ProjectCreate, ProjectUpdate } from '../types/project.types';
import { projectService as fallbackProjectService } from './apiService';

export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/projects/');
    return response.data;
  } catch (error) {
    console.warn('Backend getProjects failed, using mock data');
    return fallbackProjectService.getProjects();
  }
};

export const getProject = async (id: string): Promise<Project> => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend getProject ${id} failed, using mock data`);
    return fallbackProjectService.getProject(id);
  }
};

export const createProject = async (data: ProjectCreate): Promise<Project> => {
  try {
    const response = await api.post('/projects/', data);
    return response.data;
  } catch (error) {
    console.warn('Backend createProject failed, using mock data');
    return fallbackProjectService.createProject(data);
  }
};

export const updateProject = async (id: string, data: ProjectUpdate): Promise<Project> => {
  try {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn(`Backend updateProject ${id} failed, using mock data`);
    return fallbackProjectService.updateProject(id, data);
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await api.delete(`/projects/${id}`);
  } catch (error) {
    console.warn(`Backend deleteProject ${id} failed, using mock data`);
    await fallbackProjectService.deleteProject(id);
  }
};
