import React, { useEffect, useState } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Shield,
    Award,
    Lock,
    Calendar,
    Users,
    Medal,
    Loader2
} from 'lucide-react';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { instructorService, Instructor, DashboardStats } from '../../services/instructorService';

/**
 * Instructor-admin profile page. Displays identity details and teaching
 * related summaries for the logged-in instructor.
 */
export default function InstructorProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Instructor | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileData, statsData] = await Promise.all([
                    instructorService.getMyProfile(),
                    instructorService.getDashboardStats()
                ]);
                setProfile(profileData);
                setStats(statsData);
            } catch (err) {
                console.error('Failed to fetch profile/stats:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            const { error } = await authService.resetPasswordForEmail(user.email);
            if (error) throw error;
            alert('Password reset link sent to your registered email.');
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'Failed to send reset link');
        }
    };

    const teachingStats = [
        { label: 'Assigned Students', value: stats?.studentsCount ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Classes Taught', value: stats?.classesCount ?? '—', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Grading Reviews', value: stats?.pendingGrading ?? '—', icon: Medal, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    if (loading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="size-8 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading profile...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Instructor Profile"
                description="View your instructor identity, account details, and teaching engagement summary."
            />

            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden mb-8 text-center md:text-left">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="size-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-100">
                            <AspectRatio ratio={1 / 1}>
                                <img
                                    src={profile?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'Instructor')}&background=94a3b8&color=fff`}
                                    alt="Instructor"
                                    className="w-full h-full object-cover"
                                />
                            </AspectRatio>
                        </div>
                        <div className="absolute -bottom-2 -right-2 size-10 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                            <Shield className="size-5" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-900">{profile?.fullName || user?.name || 'Instructor'}</h2>
                        <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 mt-1 uppercase tracking-tighter">
                            <Award className="size-4 text-primary" />
                            Certified Instructor
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <Mail className="size-4 text-slate-400" />
                                {profile?.email || user?.email || '—'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <Phone className="size-4 text-slate-400" />
                                {profile?.phone || '—'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <MapPin className="size-4 text-slate-400" />
                                {profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : 'Location Managed by Dojo'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <section className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md h-full">
                        <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                            <Award className="text-primary size-5" />
                            Teaching Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {teachingStats.map((stat) => (
                                <div key={stat.label} className={`${stat.bg} p-6 rounded-2xl border border-slate-100/50 text-center`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium italic">
                                {profile?.bio || 'Professional instructor record since 2024. Your bio and teaching details are managed via the super admin panel.'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6" />
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Lock className="text-primary size-5" />
                            Security
                        </h3>
                        <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                            Need to change your password? We can send a secure reset link to your registered email address.
                        </p>
                        <button
                            type="button"
                            onClick={handlePasswordReset}
                            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Lock className="size-4" />
                            Reset Password
                        </button>
                    </div>
                </section>
            </div>
        </PageContainer>
    );
}
