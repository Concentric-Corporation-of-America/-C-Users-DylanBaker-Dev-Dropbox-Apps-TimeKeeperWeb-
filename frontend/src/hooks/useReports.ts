import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface ReportData {
  name: string;
  hours: number;
}

interface ReportFilters {
  reportType: 'time' | 'project' | 'tag';
  dateRange: { from: Date; to: Date };
  groupBy: 'day' | 'week' | 'month' | 'project';
}

export const useReports = () => {
  const auth = useAuth();
  const token = auth?.token;
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (filters: ReportFilters) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      // const toDate = filters.dateRange.to.toISOString().split('T')[0];

      await new Promise(resolve => setTimeout(resolve, 1000));

      let data: ReportData[] = [];
      
      if (filters.reportType === 'time') {
        data = [
          { name: 'Monday', hours: 5 },
          { name: 'Tuesday', hours: 7 },
          { name: 'Wednesday', hours: 3 },
          { name: 'Thursday', hours: 6 },
          { name: 'Friday', hours: 4 },
          { name: 'Saturday', hours: 2 },
          { name: 'Sunday', hours: 1 }
        ];
      } else if (filters.reportType === 'project') {
        data = [
          { name: 'Website Redesign', hours: 12 },
          { name: 'Mobile App', hours: 8 },
          { name: 'API Development', hours: 5 },
          { name: 'Documentation', hours: 3 }
        ];
      } else if (filters.reportType === 'tag') {
        data = [
          { name: 'design', hours: 6 },
          { name: 'development', hours: 15 },
          { name: 'meeting', hours: 4 },
          { name: 'research', hours: 3 },
          { name: 'testing', hours: 2 }
        ];
      }

      setReportData(data);
    } catch (err) {
      setError('Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const exportReport = useCallback(async (format: 'csv' | 'pdf') => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    if (reportData.length === 0) {
      setError('No report data to export');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Report exported as ${format}`);
      
    } catch (err) {
      setError(`Failed to export report as ${format}`);
      console.error('Report export error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, reportData]);

  return {
    isLoading,
    reportData,
    error,
    generateReport,
    exportReport
  };
};
