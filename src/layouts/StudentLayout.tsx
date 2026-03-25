import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../context/SidebarContext';
import { AppShell } from '../components/layout/AppShell';
import { StudentSidebar } from '../components/layout/StudentSidebar';

/** Student admin panel layout. All student routes use this shell. */
export function StudentLayout() {
  return (
    <SidebarProvider persist>
      <AppShell sidebar={<StudentSidebar />} title="Dashboard">
        <Outlet />
      </AppShell>
    </SidebarProvider>
  );
}
