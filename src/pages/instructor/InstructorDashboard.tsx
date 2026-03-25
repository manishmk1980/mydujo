import React, { useEffect, useState } from 'react';
import {
    Users,
    Calendar,
    ClipboardCheck,
    Medal,
    Clock,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { instructorService, DashboardStats } from '../../services/instructorService';

/**
 * Instructor-admin dashboard. Overview of instructor responsibilities for
 * assigned students, classes, and pending administrative tasks.
 */
export default function InstructorDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await instructorService.getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Assigned Students', value: stats?.studentsCount ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: "Today's Classes", value: stats?.classesCount ?? 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Pending Attendance', value: stats?.pendingAttendance ?? 0, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Grading Reviews', value: stats?.pendingGrading ?? 0, icon: Medal, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    if (loading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="size-8 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading dashboard...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Instructor Dashboard"
                description="Overview of your assigned student groups, today's schedule, and pending grading reviews."
            />

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium mb-8">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className={`size-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className="size-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Today's Schedule</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            <EmptyState
                                icon={Calendar}
                                title="No classes scheduled for today"
                                description="Your assigned classes will appear here. Check with your super admin if you expect a class today."
                            />
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Recent Student Activity</h3>
                            <Link to="/instructor/students" className="text-xs font-bold text-primary hover:underline">
                                View All Students
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            <EmptyState
                                icon={Clock}
                                title="No recent activity"
                                description="Recent attendance and grading updates from your students will be listed here."
                            />
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Mark Attendance', path: '/instructor/attendance', icon: ClipboardCheck },
                                { label: 'Review Grading', path: '/instructor/grading', icon: Medal },
                                { label: 'View My Students', path: '/instructor/students', icon: Users },
                            ].map((action) => (
                                <Link
                                    key={action.path}
                                    to={action.path}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all group"
                                >
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <action.icon className="size-5 text-primary" />
                                        <span className="text-sm font-bold">{action.label}</span>
                                    </div>
                                    <ArrowRight className="size-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </PageContainer>
    );
}
