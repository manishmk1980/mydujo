import React, { useMemo, useState } from 'react';
import {
  Edit, ExternalLink, Key, Loader2, MapPin, MessageSquare, PauseCircle,
  ShieldCheck, Star, Trash2, UserCog, X, XCircle,
} from 'lucide-react';
import { AdminBadge } from '../ui/AdminBadge';
import { useAdminConfirm } from '../ui/AdminConfirmProvider';
import type { DisciplineOption } from '../../../services/metaService';
import { instructorService, type Instructor } from '../../../services/instructorService';
import type { TrainingCenter } from '../../../services/trainingCenterService';
import {
  approvalBadgeVariant,
  formatApprovalStatus,
  maskIdNumber,
  parseInstructorBioSections,
} from '../../../utils/instructorVerification';
import { cn } from '../../../lib/utils';

type InstructorExt = Instructor & { _count?: { students: number; classes: number; centers?: number } };

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-[var(--admin-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ApplicationVerificationSection({ bio, submittedAt }: { bio?: string | null; submittedAt?: string | null }) {
  const { verification } = useMemo(() => parseInstructorBioSections(bio), [bio]);
  if (!verification) return null;

  return (
    <SectionCard
      title="Application Verification"
      description="Private onboarding details for admin review only. Never shown on the public website."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile label="ID type" value={verification.idType || '—'} />
        <InfoTile label="ID number" value={maskIdNumber(verification.idNumber)} />
        <InfoTile label="Declaration accepted" value={verification.declarationAcceptedAt ? new Date(verification.declarationAcceptedAt).toLocaleString() : '—'} />
        <InfoTile label="Application submitted" value={submittedAt ? new Date(submittedAt).toLocaleString() : '—'} />
        {verification.yearsExperience ? <InfoTile label="Experience" value={verification.yearsExperience} /> : null}
      </div>
      {verification.idDocumentUrl ? (
        <a
          href={verification.idDocumentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100"
        >
          <ExternalLink className="size-4" /> View submitted document
        </a>
      ) : null}
      <p className="mt-3 text-[11px] text-slate-500">TODO(schema): Move onboarding verification details out of Instructor.bio into dedicated application/verification fields.</p>
    </SectionCard>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PublicProfileReviewPanel({
  instructor,
  canEdit,
  onSaved,
}: {
  instructor: InstructorExt;
  canEdit: boolean;
  onSaved: (updated: InstructorExt) => void;
}) {
  const confirm = useAdminConfirm();
  const profile = instructor.publicProfile;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isFeaturedPublic, setIsFeaturedPublic] = useState(Boolean(profile?.isFeaturedPublic));
  const [publicDisplayOrder, setPublicDisplayOrder] = useState(profile?.publicDisplayOrder == null ? '' : String(profile.publicDisplayOrder));
  const [changesNote, setChangesNote] = useState('');

  const completion = profile?.completion ?? { percentage: 0, completed: 0, total: 6, missing: ['Public profile not started'], isReadyForReview: false };
  const statusLabel = profile?.status?.replaceAll('_', ' ') || 'INCOMPLETE';
  const canPublish = completion.isReadyForReview && (profile?.publicReviewStatus === 'READY_FOR_REVIEW' || profile?.status === 'PUBLISHED');
  const isPublished = Boolean(profile?.publicProfileEnabled);

  const savePublication = async (publish: boolean) => {
    if (publish) {
      const ok = await confirm({
        title: 'Publish public profile?',
        description: 'This profile will appear on the public website using only instructor-owned public fields. Continue?',
        confirmLabel: 'Publish public profile',
      });
      if (!ok) return;
    } else if (isPublished) {
      const ok = await confirm({
        title: 'Unpublish public profile?',
        description: 'This profile will be removed from the public website. Continue?',
        confirmLabel: 'Unpublish',
        variant: 'warning',
      });
      if (!ok) return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const updated = await instructorService.updatePublicProfile(instructor.id, {
        publicProfileEnabled: publish,
        publicDisplayOrder: publicDisplayOrder === '' ? null : Number(publicDisplayOrder),
        isFeaturedPublic,
      });
      onSaved({ ...instructor, publicProfile: updated as InstructorExt['publicProfile'] });
      setMessage(publish ? 'Public profile published.' : 'Public profile unpublished.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update public profile.');
    } finally {
      setSaving(false);
    }
  };

  const requestChanges = async () => {
    if (!changesNote.trim()) {
      setMessage('Add a clear note for the instructor first.');
      return;
    }
    setSaving(true);
    try {
      const updated = await instructorService.updatePublicProfile(instructor.id, {
        publicProfileEnabled: false,
        publicDisplayOrder: publicDisplayOrder === '' ? null : Number(publicDisplayOrder),
        isFeaturedPublic,
        requestChanges: true,
        changesRequestedNote: changesNote.trim(),
      });
      onSaved({ ...instructor, publicProfile: updated as InstructorExt['publicProfile'] });
      setChangesNote('');
      setMessage('Requested public profile changes from instructor.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not request changes.');
    } finally {
      setSaving(false);
    }
  };

  const requestCompletion = async () => {
    setSaving(true);
    try {
      await instructorService.updateApplicationStatus(instructor.id, 'REQUEST_INFO', {
        requestedInfoMessage: 'Please complete your public profile in the instructor dashboard and submit it for review.',
      });
      setMessage('Asked instructor to complete public profile.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Public Profile Review"
      description="Instructor-owned public profile content is reviewed here. Super Admin controls publication only after the instructor completes required profile details and confirms consent."
    >
      <div className="flex flex-wrap items-center gap-2">
        <AdminBadge variant={profile?.status === 'PUBLISHED' ? 'success' : profile?.status === 'READY_FOR_REVIEW' ? 'info' : 'neutral'} size="sm">
          Public profile: {statusLabel}
        </AdminBadge>
        {isFeaturedPublic && profile?.publicProfileEnabled ? <AdminBadge variant="warning" size="sm">Featured</AdminBadge> : null}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs font-bold text-slate-600">
            <span>Completion {completion.percentage}%</span>
            <span>{completion.completed}/{completion.total}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-orange-600" style={{ width: `${completion.percentage}%` }} />
          </div>
        </div>
        {completion.missing.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <strong>Missing:</strong> {completion.missing.join(', ')}
          </div>
        )}
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-2">
          <div><p className="text-[10px] font-bold uppercase text-slate-400">Display name</p><p className="font-semibold text-slate-900">{profile?.publicDisplayName || instructor.fullName}</p></div>
          <div><p className="text-[10px] font-bold uppercase text-slate-400">Public slug</p><p className="break-all font-semibold text-slate-900">{profile?.publicSlug || 'Generated on first save'}</p></div>
          <div><p className="text-[10px] font-bold uppercase text-slate-400">Photo</p><p className="font-semibold text-slate-900">{profile?.publicPhotoUrl ? 'Uploaded' : 'Missing'}</p></div>
          <div><p className="text-[10px] font-bold uppercase text-slate-400">Location / style</p><p className="font-semibold text-slate-900">{[profile?.city, profile?.state].filter(Boolean).join(', ') || 'Location missing'} · {profile?.publicDiscipline || 'Style missing'}</p></div>
          <div className="sm:col-span-2"><p className="text-[10px] font-bold uppercase text-slate-400">Public bio preview</p><p className="line-clamp-4 text-slate-700">{profile?.publicBio || 'No public bio yet.'}</p></div>
        </div>
      </div>

      {canEdit && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-2 text-sm font-bold text-slate-800">
              <input type="checkbox" checked={isFeaturedPublic} onChange={(e) => setIsFeaturedPublic(e.target.checked)} className="size-4 accent-orange-600" disabled={!isPublished} />
              <Star className="size-4 text-amber-500" /> Featured instructor
            </label>
            <Field label="Display order"><input type="number" min="0" max="1000000" className={inputCls} value={publicDisplayOrder} onChange={(e) => setPublicDisplayOrder(e.target.value)} disabled={!isPublished} /></Field>
          </div>
          <Field label="Request profile changes"><textarea maxLength={1000} className={cn(inputCls, 'min-h-20')} placeholder="Tell the instructor exactly what needs attention" value={changesNote} onChange={(e) => setChangesNote(e.target.value)} /></Field>
        </div>
      )}

      {message && <p className={cn('text-sm font-semibold', /published|Asked|Requested/i.test(message) ? 'text-emerald-700' : 'text-red-700')}>{message}</p>}

      {canEdit && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {!completion.isReadyForReview && (
            <button type="button" disabled={saving} onClick={() => void requestCompletion()} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-extrabold text-amber-900 disabled:opacity-50">
              Request instructor to complete profile
            </button>
          )}
          <button type="button" disabled={saving || !canPublish || isPublished} onClick={() => void savePublication(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {saving && <Loader2 className="size-4 animate-spin" />} Publish public profile
          </button>
          <button type="button" disabled={saving || !changesNote.trim()} onClick={() => void requestChanges()} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-extrabold text-amber-800 disabled:opacity-50">
            Request changes
          </button>
          {isPublished && (
            <button type="button" disabled={saving} onClick={() => void savePublication(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-extrabold text-slate-700 disabled:opacity-50">
              Unpublish
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}

export function InstructorDetailModal({
  instructor,
  onClose,
  onEdit,
  onAssign,
  onSuspend,
  onResetPassword,
  onDelete,
  onPublicSaved,
  onApplicationUpdated,
  canPublish,
  trainingCenters,
  disciplines,
}: {
  instructor: InstructorExt;
  onClose: () => void;
  onEdit: () => void;
  onAssign: () => void;
  onSuspend: () => void;
  onResetPassword: () => void;
  onDelete: () => void;
  onPublicSaved: (updated: InstructorExt) => void;
  onApplicationUpdated: (updated: InstructorExt) => void;
  canPublish: boolean;
  trainingCenters: TrainingCenter[];
  disciplines: DisciplineOption[];
}) {
  const confirm = useAdminConfirm();
  const [requestNoteOpen, setRequestNoteOpen] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const centerName = trainingCenters.find((c) => c.id === instructor.trainingCenterId)?.name || instructor.trainingCenterName || '—';
  const disciplineLabel = disciplines.find((d) => d.value === instructor.preferredDiscipline)?.label || instructor.preferredDiscipline || '—';
  const { cleanBio, adminReview } = useMemo(() => parseInstructorBioSections(instructor.bio), [instructor.bio]);
  const approvalStatus = instructor.approvalStatus || 'APPROVED';

  const approveAccount = async () => {
    const ok = await confirm({
      title: 'Approve instructor account?',
      description: 'This enables instructor login. Public profile publishing remains a separate step.',
      confirmLabel: 'Approve account',
    });
    if (!ok) return;
    setActionBusy(true);
    try {
      const updated = await instructorService.updateApplicationStatus(instructor.id, 'APPROVED');
      onApplicationUpdated({ ...instructor, ...updated, approvalStatus: 'APPROVED', isActive: true, canLogin: true });
    } finally {
      setActionBusy(false);
    }
  };

  const requestMoreInfo = async (note: string) => {
    setActionBusy(true);
    try {
      const updated = await instructorService.updateApplicationStatus(instructor.id, 'REQUEST_INFO', { requestedInfoMessage: note });
      onApplicationUpdated({ ...instructor, ...updated, approvalStatus: 'REQUEST_INFO' });
      setRequestNoteOpen(false);
      setRequestNote('');
    } finally {
      setActionBusy(false);
    }
  };

  const rejectApplication = async () => {
    const ok = await confirm({
      title: 'Reject application?',
      description: 'The instructor will not be able to log in until reviewed again.',
      confirmLabel: 'Reject application',
      variant: 'danger',
    });
    if (!ok) return;
    setActionBusy(true);
    try {
      const updated = await instructorService.updateApplicationStatus(instructor.id, 'REJECTED');
      onApplicationUpdated({ ...instructor, ...updated, approvalStatus: 'REJECTED', isActive: false, canLogin: false });
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-2 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        className="flex max-h-[100dvh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl sm:max-h-[92vh] sm:rounded-3xl"
        style={{ width: 'min(96vw, 1040px)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructor-detail-title"
      >
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {instructor.profilePhotoUrl ? (
                <img src={instructor.profilePhotoUrl} alt="" className="size-12 shrink-0 rounded-full border border-slate-200 object-cover" />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><UserCog className="size-5" /></div>
              )}
              <div className="min-w-0">
                <h2 id="instructor-detail-title" className="truncate text-lg font-bold text-slate-900">{instructor.fullName}</h2>
                <p className="truncate text-sm text-slate-500">{instructor.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminBadge variant={instructor.isActive ? 'success' : 'warning'} size="sm">{instructor.isActive ? 'Active' : 'Inactive'}</AdminBadge>
                  <AdminBadge variant={approvalBadgeVariant(approvalStatus)} size="sm">Application: {formatApprovalStatus(approvalStatus)}</AdminBadge>
                </div>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 sm:px-6 sm:pb-32">
          <div className="space-y-4">
            <SectionCard title="Contact & location">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoTile label="Phone" value={instructor.phone || '—'} />
                <InfoTile label="Location" value={[instructor.city, instructor.state].filter(Boolean).join(', ') || '—'} />
                <InfoTile label="Center" value={centerName} />
                <InfoTile label="Discipline" value={disciplineLabel} />
                <InfoTile label="Students" value={String(instructor._count?.students ?? '—')} />
                <InfoTile label="Classes" value={String(instructor._count?.classes ?? '—')} />
              </div>
            </SectionCard>

            <ApplicationVerificationSection bio={instructor.bio} submittedAt={instructor.createdAt} />

            {adminReview && (
              <SectionCard title="Admin review note" description="Visible to the instructor in their dashboard. Not shown publicly.">
                <p className="whitespace-pre-wrap text-sm text-slate-700">{adminReview}</p>
              </SectionCard>
            )}

            {cleanBio && (
              <SectionCard title="Internal notes" description="Non-public instructor notes only. Verification data is shown separately above.">
                <p className="whitespace-pre-wrap text-sm text-slate-700">{cleanBio}</p>
              </SectionCard>
            )}

            <SectionCard title="Instructor Account" description="Account approval and login access are separate from public profile publishing. Existing passwords are never readable or displayed.">
              <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoTile label="Login username" value={instructor.email} />
                <InfoTile label="Account status" value={instructor.isActive ? 'Active' : approvalStatus === 'REJECTED' ? 'Rejected' : approvalStatus === 'PENDING_REVIEW' ? 'Pending' : 'Suspended'} />
                <InfoTile label="Login access" value={instructor.canLogin ? 'Enabled' : 'Disabled'} />
                <InfoTile label="Last login" value={instructor.lastLoginAt ? new Date(instructor.lastLoginAt).toLocaleString() : 'Never'} />
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminBadge variant={approvalBadgeVariant(approvalStatus)} size="sm">{formatApprovalStatus(approvalStatus)}</AdminBadge>
                {instructor.canLogin ? <AdminBadge variant="success" size="sm">Login enabled</AdminBadge> : <AdminBadge variant="neutral" size="sm">Login disabled</AdminBadge>}
              </div>
              {instructor.assignedCenters?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {instructor.assignedCenters.map((center) => (
                    <span key={center.id} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">{center.name}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No center assignments yet.</p>
              )}
            </SectionCard>

            <PublicProfileReviewPanel instructor={instructor} canEdit={canPublish} onSaved={onPublicSaved} />
          </div>
        </div>

        <footer className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="space-y-3">
            {canPublish && <>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Account review</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <ActionButton icon={ShieldCheck} label="Approve account" onClick={() => void approveAccount()} disabled={actionBusy || approvalStatus === 'APPROVED'} tone="primary" />
                <ActionButton icon={MessageSquare} label="Request info" onClick={() => setRequestNoteOpen(true)} disabled={actionBusy} tone="info" />
                <ActionButton icon={XCircle} label="Reject" onClick={() => void rejectApplication()} disabled={actionBusy} tone="danger" />
                <ActionButton icon={PauseCircle} label={instructor.isActive ? 'Suspend access' : 'Restore access'} onClick={onSuspend} disabled={actionBusy} tone="warning" />
              </div>
            </>}
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Operations</p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <ActionButton icon={Edit} label="Edit" onClick={onEdit} tone="neutral" />
              {canPublish && <ActionButton icon={MapPin} label="Assign centers" onClick={onAssign} tone="neutral" />}
              {canPublish && <ActionButton icon={Key} label="Reset password" onClick={onResetPassword} tone="neutral" />}
              {canPublish && <ActionButton icon={Trash2} label="Delete" onClick={onDelete} tone="danger" />}
            </div>
          </div>
        </footer>
      </div>

      {requestNoteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" onClick={() => setRequestNoteOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Request more information</h3>
            <p className="mt-1 text-sm text-slate-500">This note is shown to the instructor in their dashboard only.</p>
            <textarea rows={4} value={requestNote} onChange={(e) => setRequestNote(e.target.value)} className={cn(inputCls, 'mt-4 min-h-24')} placeholder="Explain what the instructor needs to provide or update." />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setRequestNoteOpen(false)} className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>
              <button type="button" disabled={!requestNote.trim() || actionBusy} onClick={() => void requestMoreInfo(requestNote.trim())} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {actionBusy && <Loader2 className="size-4 animate-spin" />} Send request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone: 'primary' | 'info' | 'danger' | 'warning' | 'neutral';
}) {
  const tones = {
    primary: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    info: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100',
    danger: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
    neutral: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn('inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto', tones[tone])}
    >
      <Icon className="size-3.5 shrink-0" /> {label}
    </button>
  );
}
