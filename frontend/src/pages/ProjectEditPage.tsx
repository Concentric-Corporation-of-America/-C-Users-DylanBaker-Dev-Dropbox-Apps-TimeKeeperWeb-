import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import ProjectForm from '../components/projects/ProjectForm';

const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  
  const project = id ? projects.find(p => p.id === id) : undefined;

  if (!project) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-gray-500">
          The project you're trying to edit doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <ProjectForm 
        project={project} 
        onSuccess={() => navigate(`/projects/${id}`)}
      />
    </div>
  );
};

export default ProjectEditPage;
