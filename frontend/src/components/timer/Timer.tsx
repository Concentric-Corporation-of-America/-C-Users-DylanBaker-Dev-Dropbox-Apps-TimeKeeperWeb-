import React, { useState, useEffect } from 'react';
import { useTimer } from '../../context/TimerContext';
import { useProjects } from '../../context/ProjectContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tag } from 'lucide-react';
import TimerControls from './TimerControls';
import TimerHistory from './TimerHistory';

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

const Timer: React.FC = () => {
  const { currentTimer, startTimer, stopTimer, updateTimer, recentEntries } = useTimer();
  const { projects } = useProjects();
  const [elapsed, setElapsed] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  useEffect(() => {
    let interval: number | undefined;
    
    if (currentTimer.isRunning && currentTimer.startTime) {
      interval = window.setInterval(() => {
        const now = new Date();
        const started = new Date(currentTimer.startTime!);
        const elapsedMs = now.getTime() - started.getTime();
        setElapsed(Math.floor(elapsedMs / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTimer.isRunning, currentTimer.startTime]);

  useEffect(() => {
    if (currentTimer) {
      setDescription(currentTimer.description || '');
      setSelectedProject(currentTimer.projectId || null);
      setTags(currentTimer.tags || []);
    }
  }, [currentTimer]);

  const handleStartTimer = async () => {
    if (!description.trim()) return;
    await startTimer(selectedProject, description, tags);
  };

  const handleStopTimer = async () => {
    await stopTimer();
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (currentTimer.isRunning) {
      updateTimer({ description: value });
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId === "none" ? null : projectId);
    if (currentTimer.isRunning) {
      updateTimer({ projectId: projectId === "none" ? undefined : projectId });
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (!tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      setTags(newTags);
      if (currentTimer.isRunning) {
        updateTimer({ tags: newTags });
      }
    }
    
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    if (currentTimer.isRunning) {
      updateTimer({ tags: newTags });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            {formatDuration(elapsed)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="What are you working on?"
                className="w-full text-lg"
                disabled={currentTimer.isRunning}
              />
            </div>
            
            <div>
              <Select 
                value={selectedProject || "none"} 
                onValueChange={handleProjectChange}
                disabled={currentTimer.isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (press Enter)"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={handleAddTag}
                  type="button"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <TimerControls
              isRunning={currentTimer.isRunning}
              onStart={handleStartTimer}
              onStop={handleStopTimer}
            />
          </div>
        </CardContent>
      </Card>
      
      <TimerHistory entries={recentEntries} />
    </div>
  );
};

export default Timer;
