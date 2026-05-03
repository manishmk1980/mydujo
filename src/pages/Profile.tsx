import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { authService } from '../services/authService';
import { studentService, type DBStudent } from '../services/studentService';
import {
  Award,
  Calendar,
  CreditCard,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Trophy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { useFlashToast } from '../components/ui/FlashToast';

/**
 * Student-admin profile page. Displays only the logged-in student's profile
 * and related summary information. Core identity data is managed by the dojo.
 */
export default function Profile() {
  const toast = useFlashToast();
  const { user, student } = useAuth();
  const { attendance: attendanceRecords } = useAttendance();

  const [profile, setProfile] = useState<DBStudent | null>(null);

  const approvedCount = attendanceRecords.filter(
    (record) => record.status === 'approved'
  ).length;
  const totalCount = attendanceRecords.length;
  const attendanceRate =
    totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  const displayName = student?.full_name || user?.name || 'Student';
  const emailAddress = profile?.email || user?.email || '—';
  const phoneNumber = profile?.phone || '—';
  const locationLabel =
    [profile?.city, profile?.state].filter(Boolean).join(', ') || '—';
  const profilePhotoUrl =
    profile?.profile_photo_url ||
    'https://ui-avatars.com/api/?name=Student&background=94a3b8&color=fff';

  const consistencyLabel =
    totalCount > 0
      ? attendanceRate >= 80
        ? 'Excellent'
        : attendanceRate >= 50
          ? 'Good'
          : 'Keep going'
      : '—';

  useEffect(() => {
    let isCancelled = false;

    if (!user?.id) {
      setProfile(null);
      return;
    }

    studentService
      .getStudentByAuthId(user.id)
      .then((studentProfile) => {
        if (!isCancelled) {
          setProfile(studentProfile ?? null);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setProfile(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      return;
    }

    try {
      const { error } = await authService.resetPasswordForEmail(user.email);

      if (error) {
        throw error;
      }

      toast.success('Password reset link sent to your email.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset link');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        description="View your identity and profile details managed by your dojo."
      />

      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="size-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-100">
              <AspectRatio ratio={1 / 1}>
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>

            <div className="absolute -bottom-2 -right-2 size-10 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
              <Award className="size-5" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900">{displayName}</h2>

            <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
              <Shield className="size-4 text-primary" />
              {profile ? 'Member' : 'Student'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Mail className="size-4 text-slate-400" />
                {emailAddress}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Phone className="size-4 text-slate-400" />
                {phoneNumber}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <MapPin className="size-4 text-slate-400" />
                {locationLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Trophy className="text-primary size-5" />
              Belt Progression
            </h3>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <Info className="size-8 text-slate-400 shrink-0" />
              <p className="text-sm text-slate-600">
                Belt and rank information will be updated by your instructor or
                super admin.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="text-primary size-5" />
                Attendance Summary
              </h3>

              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                All time
              </span>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                  Total Classes
                </p>
                <p className="text-2xl font-black text-blue-900">{totalCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">
                  Present
                </p>
                <p className="text-2xl font-black text-green-900">
                  {approvedCount}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">
                  Rate
                </p>
                <p className="text-2xl font-black text-orange-900">
                  {totalCount > 0 ? `${attendanceRate}%` : '—'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">
                  Training Consistency
                </span>
                <span className="text-slate-900 font-bold">
                  {consistencyLabel}
                </span>
              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${attendanceRate}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard className="text-primary size-5" />
              Payment
            </h3>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <Info className="size-8 text-slate-400 shrink-0" />
              <p className="text-sm text-slate-600">
                Payment details are managed by your dojo. View your full statement
                in Payment History.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock className="text-primary size-5" />
              Security
            </h3>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600 mb-4 font-medium">
                Need to change your password? We can send a secure reset link to
                your registered email.
              </p>

              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Mail className="size-4" />
                Send Password Reset Link
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}