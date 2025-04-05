import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { Project, ProjectCreate, ProjectUpdate, ProjectContextType } from '../types/project.types';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshProjects();
    } else {
      setProjects([]);
    }
  }, [isAuthenticated, token]);

  const refreshProjects = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProjects(response.data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.detail || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (project: ProjectCreate): Promise<Project> => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/projects/`, project, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const newProject = response.data;
      setProjects(prev => [...prev, newProject]);
      
      return newProject;
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.detail || 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id: string, project: ProjectUpdate): Promise<Project> => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.put(`${API_URL}/projects/${id}`, project, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const updatedProject = response.data;
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      
      return updatedProject;
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.detail || 'Failed to update project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.response?.data?.detail || 'Failed to delete project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProject = (id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        error,
        createProject,
        updateProject,
        deleteProject,
        getProject,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
