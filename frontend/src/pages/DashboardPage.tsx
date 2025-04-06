import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useTimer } from '../context/TimerContext';
import { useProjects } from '../context/ProjectContext';
import { Clock, Calendar, Briefcase, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { recentEntries } = useTimer();
  const { projects } = useProjects();

  const todayEntries = recentEntries.filter(entry => {
    const entryDate = new Date(entry.start_time);
    const today = new Date();
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  });

  const todayTotal = todayEntries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);

  const formatHoursMinutes = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHoursMinutes(todayTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {todayEntries.length} time entries today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHoursMinutes(
              recentEntries.reduce((total, entry) => total + (entry.duration || 0), 0)
            )}</div>
            <p className="text-xs text-muted-foreground">
              {recentEntries.length} time entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentEntries.length > 0 
                ? formatDistanceToNow(new Date(recentEntries[0].start_time), { addSuffix: true })
                : 'No activity'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last time entry
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentEntries.slice(0, 5).map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium">{entry.description}</h3>
                    <p className="text-sm text-gray-500">
                      {getProjectName(entry.project_id)}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatHoursMinutes(entry.duration || 0)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(entry.start_time), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
