import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { 
  Clock, 
  BarChart2, 
  Briefcase, 
  Settings, 
  LogOut, 
  User 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                TimeKeeperWeb
              </Link>
            </div>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/timer"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <Clock className="mr-1 h-4 w-4" />
                  Timer
                </Link>
                <Link
                  to="/projects"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <Briefcase className="mr-1 h-4 w-4" />
                  Projects
                </Link>
                <Link
                  to="/reports"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <BarChart2 className="mr-1 h-4 w-4" />
                  Reports
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/settings"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user?.email}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user?.photo_url ? (
                        <img
                          src={user.photo_url}
                          alt={user.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={logout}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
