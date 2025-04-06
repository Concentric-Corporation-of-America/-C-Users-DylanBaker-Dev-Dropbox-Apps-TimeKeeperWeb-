import React, { useState } from 'react';
import ProjectList from '../components/projects/ProjectList';
import ProjectForm from '../components/projects/ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const ProjectsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleProjectCreated = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div>
      <ProjectList onCreateProject={handleOpenCreateModal} />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            onSuccess={handleProjectCreated} 
            onCancel={handleCloseCreateModal} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
