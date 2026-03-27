import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Users, Settings, Lock } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: string[];
}

const tabsConfig: TabConfig[] = [
  {
    id: 'tab1',
    label: 'Course Management',
    icon: <FileText className="w-5 h-5" />,
    allowedRoles: ['Time Table Incharge', 'Admin'],
  },
  {
    id: 'tab2',
    label: 'Faculty Database',
    icon: <Users className="w-5 h-5" />,
    allowedRoles: ['Admin', 'Time Table Incharge', 'Faculty'],
  },
  {
    id: 'tab3',
    label: 'Reports',
    icon: <LayoutDashboard className="w-5 h-5" />,
    allowedRoles: ['Admin', 'Time Table Incharge'],
  },
  {
    id: 'tab4',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    allowedRoles: ['Admin'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const hasAccess = (allowedRoles: string[]) => {
    return user?.role && allowedRoles.includes(user.role);
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="font-semibold text-lg text-sidebar-foreground">Navigation</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {tabsConfig.map((tab) => {
          const isAccessible = hasAccess(tab.allowedRoles);
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => isAccessible && setActiveTab(tab.id)}
              disabled={!isAccessible}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : isAccessible
                    ? 'hover:bg-sidebar-accent text-sidebar-foreground hover:shadow-sm'
                    : 'opacity-40 cursor-not-allowed text-muted-foreground'
                }
              `}
            >
              {tab.icon}
              <span className="flex-1 text-left">{tab.label}</span>
              {!isAccessible && <Lock className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="px-4 py-2 text-sm text-muted-foreground">
          <p>Logged in as</p>
          <p className="font-medium text-sidebar-foreground">{user?.role}</p>
        </div>
      </div>
    </aside>
  );
};
