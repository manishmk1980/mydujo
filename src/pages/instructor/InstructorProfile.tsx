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
    Loader2,
    Globe2,
    Upload,
    CheckCircle2,
    Send
} from 'lucide-react';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useFlashToast } from '../../components/ui/FlashToast';
import { instructorService, Instructor, DashboardStats, type InstructorPublicProfile } from '../../services/instructorService';
import { storageService } from '../../services/storageService';
import { API_BASE } from '../../config';

/**
 * Instructor-admin profile page. Displays identity details and teaching
 * related summaries for the logged-in instructor.
 */
export default function InstructorProfile() {
    const toast = useFlashToast();
    const { user } = useAuth();
    const [profile, setProfile] = useState<Instructor | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [publicProfile, setPublicProfile] = useState<InstructorPublicProfile | null>(null);
    const [publicForm, setPublicForm] = useState({
        publicDisplayName: '',
        publicBio: '',
        publicPhotoUrl: '',
        publicDiscipline: '',
        publicConsentConfirmed: false,
    });
    const [savingPublic, setSavingPublic] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [profileData, statsData] = await Promise.all([
                    instructorService.getMyProfile(),
                    instructorService.getDashboardStats()
                ]);
                setProfile(profileData);
                setStats(statsData);
                const ownedProfile = profileData?.publicProfile || await instructorService.getMyPublicProfile();
                setPublicProfile(ownedProfile);
                setPublicForm({
                    publicDisplayName: ownedProfile.publicDisplayName || profileData?.fullName || '',
                    publicBio: ownedProfile.publicBio || '',
                    publicPhotoUrl: ownedProfile.publicPhotoUrl || '',
                    publicDiscipline: ownedProfile.publicDiscipline || profileData?.preferredDiscipline || '',
                    publicConsentConfirmed: ownedProfile.publicConsentConfirmed,
                });
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
            toast.success('Password reset link sent to your registered email.');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to send reset link');
        }
    };

    const savePublicProfile = async () => {
        setSavingPublic(true);
        try {
            const updated = await instructorService.saveMyPublicProfile({
                ...publicForm,
                publicPhotoUrl: publicForm.publicPhotoUrl || null,
            });
            setPublicProfile(updated);
            toast.success('Public profile saved. Your private account details were not changed.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save public profile');
        } finally {
            setSavingPublic(false);
        }
    };

    const submitPublicProfile = async () => {
        setSavingPublic(true);
        try {
            const updated = await instructorService.submitMyPublicProfileForReview();
            setPublicProfile(updated);
            toast.success('Public profile submitted for Super Admin review.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to submit profile');
        } finally {
            setSavingPublic(false);
        }
    };

    const uploadPublicPhoto = async (file: File | null) => {
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const { url } = await storageService.uploadInstructorPublicPhoto(file);
            setPublicForm((value) => ({ ...value, publicPhotoUrl: url }));
            toast.success('Photo uploaded. Save your profile to keep this change.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Photo upload failed');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const teachingStats = [
        { label: 'Assigned Students', value: stats?.studentsCount ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Classes Taught', value: stats?.classesCount ?? '—', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Grading Reviews', value: stats?.pendingGrading ?? '—', icon: Medal, color: 'text-green-600', bg: 'bg-green-50' },
    ];
    const publicPhotoPreview = publicForm.publicPhotoUrl.startsWith('/uploads/')
        ? `${API_BASE}${publicForm.publicPhotoUrl}`
        : publicForm.publicPhotoUrl;

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

            <section className="mb-8 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h3 className="flex items-center gap-2 text-xl font-black text-slate-900"><Globe2 className="size-5 text-orange-600" /> Complete Your Public Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Complete this step by step. You own the profile content; Super Admin reviews and decides when it appears publicly.</p>
                    </div>
                    <span className="self-start rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-800">{publicProfile?.status?.replaceAll('_', ' ') || 'Draft'}</span>
                </div>

                {profile?.applicationReviewNote && (
                    <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                        <strong>MDPL review note:</strong> {profile.applicationReviewNote}
                    </div>
                )}

                {publicProfile?.publicChangesRequestedNote && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <strong>Changes requested:</strong> {publicProfile.publicChangesRequestedNote}
                    </div>
                )}

                <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
                        <span>Profile completion ({publicProfile?.completion.completed ?? 0}/{publicProfile?.completion.total ?? 6})</span>
                        <span>{publicProfile?.completion.percentage ?? 0}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-orange-600 transition-all" style={{ width: `${publicProfile?.completion.percentage ?? 0}%` }} />
                    </div>
                    {publicProfile && publicProfile.completion.missing.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {publicProfile.completion.missing.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{item}</span>)}
                        </div>
                    )}
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                    <label className="space-y-1.5">
                        <span className="text-sm font-extrabold text-slate-700">Public display name</span>
                        <input maxLength={255} value={publicForm.publicDisplayName} onChange={(e) => setPublicForm((value) => ({ ...value, publicDisplayName: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" />
                    </label>
                    <label className="space-y-1.5">
                        <span className="text-sm font-extrabold text-slate-700">Discipline / style</span>
                        <input maxLength={128} value={publicForm.publicDiscipline} onChange={(e) => setPublicForm((value) => ({ ...value, publicDiscipline: e.target.value }))} placeholder="e.g. Shotokan Karate" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" />
                    </label>
                    <label className="space-y-1.5 md:col-span-2">
                        <span className="text-sm font-extrabold text-slate-700">Professional introduction</span>
                        <textarea maxLength={1000} value={publicForm.publicBio} onChange={(e) => setPublicForm((value) => ({ ...value, publicBio: e.target.value }))} placeholder="Tell students about your teaching approach and experience." className="min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" />
                        <span className="block text-right text-xs text-slate-400">{publicForm.publicBio.length}/1000</span>
                    </label>
                    <div className="md:col-span-2">
                        <p className="mb-2 text-sm font-extrabold text-slate-700">Public profile photo</p>
                        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-slate-300 p-4">
                            {publicForm.publicPhotoUrl ? <img src={publicPhotoPreview} alt="Public profile preview" className="size-20 rounded-xl object-cover" /> : <div className="flex size-20 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Upload className="size-6" /></div>}
                            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                                {uploadingPhoto ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload JPG, PNG, or WebP
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void uploadPublicPhoto(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    </div>
                    <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                        <input type="checkbox" checked={publicForm.publicConsentConfirmed} onChange={(e) => setPublicForm((value) => ({ ...value, publicConsentConfirmed: e.target.checked }))} className="mt-1 size-4 accent-orange-600" />
                        <span className="text-sm font-semibold leading-6 text-slate-700">I agree that the approved public profile information may be shown on the MDPL website.</span>
                    </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" disabled={savingPublic || uploadingPhoto} onClick={() => void savePublicProfile()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">
                        {savingPublic ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Save profile
                    </button>
                    <button type="button" disabled={savingPublic || !publicProfile?.completion.isReadyForReview || publicProfile.status === 'READY_FOR_REVIEW' || publicProfile.status === 'PUBLISHED'} onClick={() => void submitPublicProfile()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                        <Send className="size-4" /> Submit for public review
                    </button>
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
                                Your public introduction appears on the MDPL website only after you complete your public profile and Super Admin publishes it.
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
