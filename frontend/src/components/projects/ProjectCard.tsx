import React from 'react';
import { Project } from '../../types/project.types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { useProjects } from '../../context/ProjectContext';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { deleteProject } = useProjects();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2" style={{ 
        borderTop: `4px solid ${project.color || '#3b82f6'}` 
      }}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {project.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/projects/${project.id}/edit`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {project.description ? (
          <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No description</p>
        )}
      </CardContent>
      <CardFooter className="border-t bg-gray-50 py-2 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
        </div>
        <Link 
          to={`/projects/${project.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
