import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Tab1 } from './tabs/Tab1';
import { Tab2 } from './tabs/Tab2';
import { Tab3 } from './tabs/Tab3';
import { Tab4 } from './tabs/Tab4';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tab1');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tab1':
        return <Tab1 />;
      case 'tab2':
        return <Tab2 />;
      case 'tab3':
        return <Tab3 />;
      case 'tab4':
        return <Tab4 />;
      default:
        return <Tab1 />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Top Navigation Bar - Blue */}
      <header className="h-16 bg-blue-600 border-b border-blue-700 shadow-lg flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center shadow-md transition-transform hover:scale-105">
            <img src="dtu-logo.webp" alt="DTU-logo" />
          </div>
          <div>
            <h1 className="font-semibold text-white">Time Table Management</h1>
            <p className="text-xs text-blue-100">Delhi Technological University</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 border border-white/20">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-white text-blue-600">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-white">{user?.username || 'User'}</p>
              <p className="text-xs text-blue-100">{user?.role}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2 bg-white/10 text-white border-white/30 hover:bg-white hover:text-blue-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto bg-secondary/20">
          <div className="p-6 animate-in fade-in duration-300">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
