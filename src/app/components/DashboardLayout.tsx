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
import { Badge } from './ui/badge';

const ROLE_BADGE_MAP: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-red-100 text-red-700' },
  hod: { label: 'HOD', className: 'bg-purple-100 text-purple-700' },
  ee_incharge: { label: 'Exam Incharge', className: 'bg-orange-100 text-orange-700' },
  tt_incharge: { label: 'TT Incharge', className: 'bg-cyan-100 text-cyan-700' },
  examiner: { label: 'Examiner', className: 'bg-blue-100 text-blue-700' },
  faculty: { label: 'Faculty', className: 'bg-green-100 text-green-700' },
};

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tab1');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tab1': return <Tab1 />;
      case 'tab2': return <Tab2 />;
      case 'tab3': return <Tab3 />;
      case 'tab4': return <Tab4 />;
      default: return <Tab1 />;
    }
  };

  const primaryRole = user?.roles?.[0];
  const roleBadge = primaryRole ? ROLE_BADGE_MAP[primaryRole] : null;

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-blue-600 border-b border-blue-700 shadow-lg flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex items-center justify-center shadow-md transition-transform hover:scale-105">
            <img src="dtu-logo.webp" alt="DTU-logo" />
          </div>
          <div>
            <h1 className="font-semibold text-white">Examination Management</h1>
            <p className="text-xs text-blue-100">Delhi Technological University — BOS Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 border border-white/20">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-white text-blue-600">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-white">{user?.name || 'User'}</p>
              <div className="flex gap-1">
                {roleBadge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadge.className}`}>
                    {roleBadge.label}
                  </span>
                )}
              </div>
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

      {/* Main Content */}
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
