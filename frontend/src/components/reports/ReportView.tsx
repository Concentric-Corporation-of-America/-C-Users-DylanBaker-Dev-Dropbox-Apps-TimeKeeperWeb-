import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { BarChart2, PieChart, LineChart } from 'lucide-react';
import ReportChart from './ReportChart';
import ReportFilters from './ReportFilters';

interface TimeEntry {
  id: string;
  description: string;
  project_id?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  tags?: string[];
}

interface Project {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

const ReportView: React.FC = () => {
  const [reportType, setReportType] = useState('time');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  const [groupBy, setGroupBy] = useState('day');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const mockTimeEntries: TimeEntry[] = [
    {
      id: '1',
      description: 'Working on UI design',
      project_id: '1',
      start_time: '2023-05-01T09:00:00Z',
      end_time: '2023-05-01T12:00:00Z',
      duration: 10800, // 3 hours in seconds
      tags: ['design', 'frontend']
    },
    {
      id: '2',
      description: 'Backend development',
      project_id: '2',
      start_time: '2023-05-02T13:00:00Z',
      end_time: '2023-05-02T17:00:00Z',
      duration: 14400, // 4 hours in seconds
      tags: ['backend', 'api']
    },
    {
      id: '3',
      description: 'Meeting with client',
      project_id: '1',
      start_time: '2023-05-03T10:00:00Z',
      end_time: '2023-05-03T11:00:00Z',
      duration: 3600, // 1 hour in seconds
      tags: ['meeting', 'client']
    }
  ];

  const mockProjects: Project[] = [
    { id: '1', name: 'Website Redesign', color: '#3b82f6' },
    { id: '2', name: 'Mobile App', color: '#10b981' }
  ];

  const handleGenerateReport = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      let data: any[] = [];
      
      if (reportType === 'time') {
        data = [
          { name: 'Monday', hours: 5 },
          { name: 'Tuesday', hours: 7 },
          { name: 'Wednesday', hours: 3 },
          { name: 'Thursday', hours: 6 },
          { name: 'Friday', hours: 4 },
          { name: 'Saturday', hours: 2 },
          { name: 'Sunday', hours: 1 }
        ];
      } else if (reportType === 'project') {
        data = mockProjects.map(project => {
          const projectEntries = mockTimeEntries.filter(entry => entry.project_id === project.id);
          const totalHours = projectEntries.reduce((sum, entry) => sum + entry.duration / 3600, 0);
          
          return {
            name: project.name,
            hours: totalHours
          };
        });
      } else if (reportType === 'tag') {
        const tagMap = new Map<string, number>();
        
        mockTimeEntries.forEach(entry => {
          if (entry.tags) {
            entry.tags.forEach(tag => {
              const hours = entry.duration / 3600;
              tagMap.set(tag, (tagMap.get(tag) || 0) + hours);
            });
          }
        });
        
        data = Array.from(tagMap.entries()).map(([tag, hours]) => ({
          name: tag,
          hours
        }));
      }
      
      setReportData(data);
      setIsLoading(false);
      setHasGenerated(true);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters
            reportType={reportType}
            setReportType={setReportType}
            dateRange={dateRange}
            setDateRange={setDateRange}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            onGenerateReport={handleGenerateReport}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Report Results</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={chartType === 'bar' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setChartType('bar')}
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === 'pie' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setChartType('pie')}
            >
              <PieChart className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === 'line' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setChartType('line')}
            >
              <LineChart className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading report data...</p>
            </div>
          ) : hasGenerated ? (
            <ReportChart 
              data={reportData} 
              title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
              dataKey="hours"
              nameKey="name"
            />
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-md bg-gray-50">
              <p className="text-gray-500">Select report options and click "Generate Report" to view results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportView;
