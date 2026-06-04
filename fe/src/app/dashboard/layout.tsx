'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Stethoscope, MapPin, Calendar, LogOut, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/dashboard/patient',
    label: 'Pasien',
    icon: Users,
    description: 'Cari data pasien via NIK',
  },
  {
    href: '/dashboard/practitioner',
    label: 'Praktisi',
    icon: Stethoscope,
    description: 'Cari data tenaga kesehatan',
  },
  {
    href: '/dashboard/location',
    label: 'Lokasi',
    icon: MapPin,
    description: 'Daftarkan ruangan / poli',
  },
  {
    href: '/dashboard/encounter',
    label: 'Kunjungan',
    icon: Calendar,
    description: 'Buat kunjungan medis',
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Guard: redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={`relative flex-shrink-0 flex flex-col bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-600/50">
          <div className="flex-shrink-0 w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-base font-bold leading-tight">SATUSEHAT</p>
              <p className="text-[10px] text-blue-300 font-medium tracking-wide">BFF Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-md font-semibold'
                    : 'text-blue-100 hover:bg-blue-600/60 hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-blue-200 group-hover:text-white'}`}
                />
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-sm leading-tight">{label}</p>
                    {!isActive && (
                      <p className="text-[10px] text-blue-300 group-hover:text-blue-100 truncate leading-tight mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-blue-700 border border-blue-500 rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors z-10"
          title={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={12} className="text-white" />
          ) : (
            <ChevronLeft size={12} className="text-white" />
          )}
        </button>

        {/* Logout */}
        <div className="px-2 py-3 border-t border-blue-600/50">
          <button
            onClick={handleLogout}
            title="Keluar"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-blue-200 hover:bg-red-500/30 hover:text-white transition-colors group"
          >
            <LogOut size={20} className="flex-shrink-0 group-hover:text-red-300" />
            {!collapsed && <span className="text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div>
            {/* Breadcrumb */}
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {NAV_ITEMS.find((n) => n.href === pathname)?.description ?? 'Dashboard'}
            </p>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {NAV_ITEMS.find((n) => n.href === pathname)?.label ?? 'SATUSEHAT'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Staging
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
