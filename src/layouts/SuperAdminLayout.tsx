import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../context/SidebarContext';
import { AppShell } from '../components/layout/AppShell';
import { SuperAdminSidebar } from '../components/admin/SuperAdminSidebar';

/** Super admin panel layout. All /admin/* routes use this shell. */
export function SuperAdminLayout() {
  return (
    <SidebarProvider persist>
      <AppShell sidebar={<SuperAdminSidebar />} title="Admin">
        <Outlet />
      </AppShell>
    </SidebarProvider>
  );
}
