import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../context/SidebarContext';
import { AppShell } from '../components/layout/AppShell';
import { SuperAdminSidebar } from '../components/admin/SuperAdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { AdminConfirmProvider } from '../components/admin/ui/AdminConfirmProvider';

/** Super admin panel layout. All /admin/* routes use this shell. */
export function SuperAdminLayout() {
  return (
    <AdminConfirmProvider>
      <SidebarProvider persist>
        <AppShell sidebar={<SuperAdminSidebar />} title="Admin" className="admin-shell admin-page-bg" suppressMobileHeader>
          <div className="flex min-w-0 flex-col gap-6">
            <AdminTopbar />
            <Outlet />
          </div>
        </AppShell>
      </SidebarProvider>
    </AdminConfirmProvider>
  );
}
