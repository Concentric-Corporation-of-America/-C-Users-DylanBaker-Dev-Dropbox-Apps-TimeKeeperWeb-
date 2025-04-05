import api from './api';
import { reportService as fallbackReportService } from './apiService';

export interface ReportFilters {
  reportType: 'time' | 'project' | 'tag';
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month' | 'project';
  projectId?: string;
}

export interface ReportData {
  name: string;
  hours: number;
}

export const generateReport = async (filters: ReportFilters): Promise<ReportData[]> => {
  try {
    const response = await api.get('/reports/generate', { params: filters });
    return response.data;
  } catch (error) {
    console.warn('Backend generateReport failed, using mock data');
    return fallbackReportService.generateReport(filters);
  }
};

export const exportReport = async (filters: ReportFilters, format: 'csv' | 'pdf'): Promise<Blob> => {
  try {
    const response = await api.get(`/reports/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.warn(`Backend exportReport as ${format} failed, using mock data`);
    return fallbackReportService.exportReport(filters, format);
  }
};

export const getProjectSummary = async (projectId: string): Promise<any> => {
  try {
    const response = await api.get(`/reports/project/${projectId}/summary`);
    return response.data;
  } catch (error) {
    console.warn(`Backend getProjectSummary for ${projectId} failed, using mock data`);
    return fallbackReportService.getProjectSummary(projectId);
  }
};

export const getUserSummary = async (): Promise<any> => {
  try {
    const response = await api.get('/reports/user/summary');
    return response.data;
  } catch (error) {
    console.warn('Backend getUserSummary failed, using mock data');
    return fallbackReportService.getUserSummary();
  }
};
