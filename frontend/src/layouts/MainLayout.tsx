import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto pt-20 px-4 pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
