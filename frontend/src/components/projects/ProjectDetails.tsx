import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { Project } from '../../types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Edit, ArrowLeft, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, deleteProject, isLoading } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id && projects.length > 0) {
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject || null);
    }
  }, [id, projects]);

  const handleDelete = async () => {
    if (!project) return;
    
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await deleteProject(project.id);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-gray-500 mb-4">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link to="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/projects/${project.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2" style={{ 
          borderTop: `4px solid ${project.color || '#3b82f6'}` 
        }}>
          <CardTitle className="text-2xl">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              {project.description ? (
                <p className="mt-1">{project.description}</p>
              ) : (
                <p className="mt-1 text-gray-400 italic">No description provided</p>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2">
                    {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </span>
                </div>
                {project.updated_at && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="ml-2">
                      {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Time entries for this project would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">
            No time entries for this project yet
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;
