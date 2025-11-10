import React, { useState } from 'react';
import { Menu, X, Home, Database, Network, FileHeart, Workflow, Settings, BookOpen, Activity } from 'lucide-react';

interface NavigationMenuProps {
  currentPath?: string;
}

export default function NavigationMenu({ currentPath = '/' }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home, description: 'Main overview' },
    { path: '/medical-records', label: 'Medical Records', icon: Database, description: 'Manage patient records' },
    { path: '/medical-graph', label: 'Graph View', icon: Network, description: 'Visualize relationships' },
    { path: '/workflow', label: 'Medical Workflow', icon: FileHeart, description: 'Process workflows' },
    { path: '/protocols', label: 'Protocols', icon: Activity, description: 'Protocol management' },
    { path: '/settings', label: 'Settings', icon: Settings, description: 'System configuration' }
  ];

  const handleNavigate = (path: string) => {
    window.location.href = path;
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 left-0 h-full w-80 bg-slate-900 shadow-2xl z-40 transform transition-transform">
            <div className="p-6 pt-20">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">SEED Platform</h2>
                <p className="text-slate-400 text-sm">Personal Medical Record System</p>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="text-xs text-slate-500">
                  <p className="mb-1">FHIR R4 Compliant</p>
                  <p>Version 1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
