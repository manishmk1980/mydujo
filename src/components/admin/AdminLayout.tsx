import React from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
