import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Role-based route guard for the instructor panel.
 * Only allows users with 'instructor', 'admin', or 'super_admin' roles.
 */
export function InstructorProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, instructor, isAuthenticated, isInstructor, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // Role check + Profile check for dedicated instructors
    // Admins/Super Admins get a pass on the profile requirement since they are managers.
    const hasValidAccess = isInstructor && (user?.role !== 'instructor' || !!instructor);

    if (!isAuthenticated || !hasValidAccess) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
