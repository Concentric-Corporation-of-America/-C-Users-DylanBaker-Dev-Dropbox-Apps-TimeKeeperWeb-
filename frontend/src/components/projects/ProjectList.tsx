import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Folder } from 'lucide-react';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  onCreateProject: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onCreateProject }) => {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p>Loading projects...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={onCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Folder className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first project to start tracking time
              </p>
              <Button onClick={onCreateProject}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
