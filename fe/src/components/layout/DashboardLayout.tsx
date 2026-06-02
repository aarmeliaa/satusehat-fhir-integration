'use client';

import React, { useState, ReactNode } from 'react';
import { Users, Stethoscope, MapPin, Calendar, LogOut } from 'lucide-react';
import { DashboardModule } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  onLogout: () => void;
}

const modules: DashboardModule[] = [
  { id: 'patient', label: 'Pasien', icon: <Users size={20} /> },
  { id: 'practitioner', label: 'Praktisi', icon: <Stethoscope size={20} /> },
  { id: 'location', label: 'Lokasi', icon: <MapPin size={20} /> },
  { id: 'encounter', label: 'Kunjungan', icon: <Calendar size={20} /> },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeModule,
  onModuleChange,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 shadow-lg`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">SATUSEHAT</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeModule === module.id
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
              title={module.label}
            >
              {module.icon}
              {sidebarOpen && <span>{module.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-700 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-md p-6">{children}</div>
        </div>
      </main>
    </div>
  );
};
