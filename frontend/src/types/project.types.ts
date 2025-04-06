export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  color?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  color?: string;
  is_archived?: boolean;
}

export interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createProject: (project: ProjectCreate) => Promise<Project>;
  updateProject: (id: string, project: ProjectUpdate) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  refreshProjects: () => Promise<void>;
}
