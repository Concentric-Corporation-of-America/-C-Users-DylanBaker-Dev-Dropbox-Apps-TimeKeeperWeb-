import React from 'react';
import ReportView from '../components/reports/ReportView';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <ReportView />
    </div>
  );
};

export default ReportsPage;
