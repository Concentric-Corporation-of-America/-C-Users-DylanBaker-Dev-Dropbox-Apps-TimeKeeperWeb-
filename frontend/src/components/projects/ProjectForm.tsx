import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { Project, ProjectCreate, ProjectUpdate } from '../../types/project.types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  project, 
  onSuccess,
  onCancel
}) => {
  const { createProject, updateProject } = useProjects();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProjectCreate | ProjectUpdate>({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color || '#3b82f6'
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Project name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (project) {
        await updateProject(project.id, formData as ProjectUpdate);
      } else {
        await createProject(formData as ProjectCreate);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/projects');
      }
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project ? 'Edit Project' : 'Create New Project'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                name="color"
                type="color"
                value={formData.color || '#3b82f6'}
                onChange={handleChange}
                className="w-12 h-10 p-1"
              />
              <Input
                name="color"
                value={formData.color || '#3b82f6'}
                onChange={handleChange}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel || (() => navigate('/projects'))}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectForm;
