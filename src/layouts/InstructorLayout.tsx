import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../context/SidebarContext';
import { AppShell } from '../components/layout/AppShell';
import { InstructorSidebar } from '../components/layout/InstructorSidebar';

/** Instructor admin panel layout. All /instructor/* routes use this shell. */
export function InstructorLayout() {
  return (
    <SidebarProvider persist>
      <AppShell sidebar={<InstructorSidebar />} title="Instructor">
        <Outlet />
      </AppShell>
    </SidebarProvider>
  );
}
