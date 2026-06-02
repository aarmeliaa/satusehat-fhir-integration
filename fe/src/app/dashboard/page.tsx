'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PatientModule } from '@/components/modules/Patient';
import { PractitionerModule } from '@/components/modules/Practitioner';
import { LocationModule } from '@/components/modules/Location';
import { EncounterModule } from '@/components/modules/Encounter';

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState('patient');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'patient':
        return <PatientModule />;
      case 'practitioner':
        return <PractitionerModule />;
      case 'location':
        return <LocationModule />;
      case 'encounter':
        return <EncounterModule />;
      default:
        return <PatientModule />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      onLogout={handleLogout}
    >
      {renderModule()}
    </DashboardLayout>
  );
}
