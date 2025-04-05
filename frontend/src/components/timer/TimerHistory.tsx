import React from 'react';
import { TimeEntry } from '../../types/timer.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Briefcase, Tag } from 'lucide-react';
import { Badge } from '../ui/badge';

interface TimerHistoryProps {
  entries: TimeEntry[];
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

const TimerHistory: React.FC<TimerHistoryProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">No recent time entries</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{entry.description}</h3>
                <span className="text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(entry.start_time), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(entry.duration)}
                </div>
                
                {entry.project_id && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Project ID: {entry.project_id}
                  </div>
                )}
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerHistory;
