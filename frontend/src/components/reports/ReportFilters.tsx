import React from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface ReportFiltersProps {
  reportType: string;
  setReportType: (value: string) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
  groupBy: string;
  setGroupBy: (value: string) => void;
  onGenerateReport: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  setReportType,
  dateRange,
  setDateRange,
  groupBy,
  setGroupBy,
  onGenerateReport,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time Report</SelectItem>
              <SelectItem value="project">Project Report</SelectItem>
              <SelectItem value="tag">Tag Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, 'PPP') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date: Date | undefined) => date && setDateRange({ ...dateRange, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, 'PPP') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date: Date | undefined) => date && setDateRange({ ...dateRange, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Group By</label>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select grouping" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button onClick={onGenerateReport}>Generate Report</Button>
    </div>
  );
};

export default ReportFilters;
