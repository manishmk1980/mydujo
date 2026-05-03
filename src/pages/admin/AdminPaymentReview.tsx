import React from 'react';
import { CircleHelp, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminTableCard } from '../../components/admin/ui/AdminTableCard';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { AdminConfirmDialog, type AdminConfirmVariant } from '../../components/admin/ui/AdminConfirmDialog';
import { AttachmentPreviewModal } from '../../components/ui/AttachmentPreviewModal';
import { feesService, type FeeRequestDTO, type PaymentSubmissionDTO } from '../../services/feesService';
import { studentService, type DBStudent } from '../../services/studentService';
import { resolveAttachmentUrl } from '../../utils/attachments';

type ReviewDecision = 'VERIFIED' | 'REJECTED' | 'NEEDS_INFO';

function getDecisionLabel(status: ReviewDecision) {
  if (status === 'VERIFIED') return 'Validate & Confirm Payment';
  if (status === 'NEEDS_INFO') return 'Need More Payment Info';
  return 'Reject Payment';
}

function getReviewConfirmVariant(status: ReviewDecision): AdminConfirmVariant {
  if (status === 'VERIFIED') return 'success';
  if (status === 'NEEDS_INFO') return 'warning';
  return 'danger';
}

function getReviewDialogTitle(status: ReviewDecision) {
  if (status === 'VERIFIED') return 'Verify payment?';
  if (status === 'NEEDS_INFO') return 'Request more information?';
  return 'Reject payment?';
}

function getReviewDialogDescription(status: ReviewDecision) {
  if (status === 'VERIFIED') {
    return 'You are about to mark this submission as verified. Add an admin comment for the audit trail before confirming.';
  }
  if (status === 'NEEDS_INFO') {
    return 'The student will be asked to provide additional payment details. Add a comment explaining what you need.';
  }
  return 'This will reject the payment submission. Add a clear comment so the student understands why.';
}

function getReviewConfirmButtonLabel(status: ReviewDecision) {
  if (status === 'VERIFIED') return 'Verify payment';
  if (status === 'NEEDS_INFO') return 'Request more info';
  return 'Reject payment';
}

export default function AdminPaymentReview() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<PaymentSubmissionDTO[]>([]);
  const [activeSubmission, setActiveSubmission] = React.useState<PaymentSubmissionDTO | null>(null);
  const [activeDecision, setActiveDecision] = React.useState<ReviewDecision | null>(null);
  const [adminComment, setAdminComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [students, setStudents] = React.useState<DBStudent[]>([]);
  const [feeRequests, setFeeRequests] = React.useState<FeeRequestDTO[]>([]);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const load = async () => {
    const [rows, studentRows, feeRows] = await Promise.all([
      feesService.listSubmissions({ status: 'SUBMITTED' }),
      studentService.getAllStudents(),
      feesService.listFeeRequests(),
    ]);
    setItems(rows);
    setStudents(studentRows);
    setFeeRequests(feeRows);
  };

  const studentNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students) map.set(s.id, s.full_name);
    return map;
  }, [students]);

  const feeById = React.useMemo(() => {
    const map = new Map<string, FeeRequestDTO>();
    for (const f of feeRequests) map.set(f.id, f);
    return map;
  }, [feeRequests]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await load();
        if (!alive) return;
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load submissions');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openConfirmation = (submission: PaymentSubmissionDTO, decision: ReviewDecision) => {
    setError(null);
    setActiveSubmission(submission);
    setActiveDecision(decision);
    setAdminComment('');
  };

  const closeConfirmation = () => {
    if (submitting) return;
    setActiveSubmission(null);
    setActiveDecision(null);
    setAdminComment('');
  };

  const confirmReview = async () => {
    if (!activeSubmission || !activeDecision) return;
    const note = adminComment.trim();
    if (!note) {
      setError('Admin comment is required before confirming this action.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await feesService.reviewSubmission(activeSubmission.id, {
        status: activeDecision,
        reviewNotes: note,
      });
      await load();
      closeConfirmation();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <AdminPageHeader
        title="Payment Review"
        subtitle="Review student payment submissions and verify, reject, or request more information."
      />

      {error ? <AdminErrorState message={error} className="mb-4" /> : null}

      <AdminTableCard
        title="Submitted payments"
        subtitle="Awaiting admin review and verification."
        action={
          <button
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                await load();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to refresh');
              } finally {
                setLoading(false);
              }
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--admin-primary)] hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      >
        {loading ? <AdminLoadingState label="Loading submissions…" className="py-10" /> : null}
        {!loading && items.length === 0 ? (
          <AdminEmptyState
            title="No submissions awaiting review"
            description="When students submit payment proof, they will appear here for verification."
          />
        ) : null}

        {!loading && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-[var(--admin-surface-soft)] text-[var(--admin-text)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Submission</th>
                  <th className="px-4 py-3 text-left font-semibold">Fee Request</th>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Method / Ref</th>
                  <th className="px-4 py-3 text-left font-semibold">Notes</th>
                  <th className="px-4 py-3 text-left font-semibold">Proof</th>
                  <th className="px-4 py-3 text-left font-semibold">Submitted At</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {items.map((s) => (
                  <tr key={s.id} className="align-top">
                    <td className="px-4 py-3 text-[var(--admin-text)]">
                      <div className="font-semibold break-all">{s.id}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                      <div>{feeById.get(s.fee_request_id)?.title ?? s.fee_request_id}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                      <div>{studentNameById.get(s.student_id) ?? s.student_id}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                      <div className="font-semibold">{s.method}</div>
                      <div className="break-all text-xs text-[var(--admin-text-muted)]">{s.reference ? `Ref: ${s.reference}` : 'No reference'}</div>
                    </td>
                    <td className="max-w-[280px] px-4 py-3 text-[var(--admin-text-muted)]">
                      <div className="break-words whitespace-pre-wrap">{s.notes_from_student || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                      {(() => {
                        const attachmentUrl = resolveAttachmentUrl(s.proof_url, { feeRequestId: s.fee_request_id });
                        return attachmentUrl ? (
                          <button
                            type="button"
                            className="text-[var(--admin-primary)] font-semibold hover:underline"
                            onClick={() => setPreviewUrl(attachmentUrl)}
                          >
                            View Attachment
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--admin-text-muted)]">No proof</span>
                        );
                      })()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--admin-text-muted)]">
                      {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 min-w-[240px]">
                        <button
                          type="button"
                          onClick={() => openConfirmation(s, 'VERIFIED')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Validate & Confirm Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => openConfirmation(s, 'NEEDS_INFO')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                        >
                          <CircleHelp className="h-3.5 w-3.5" />
                          Need More Payment Info
                        </button>
                        <button
                          type="button"
                          onClick={() => openConfirmation(s, 'REJECTED')}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminTableCard>

      {activeSubmission && activeDecision ? (
        <AdminConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) closeConfirmation();
          }}
          title={getReviewDialogTitle(activeDecision)}
          description={getReviewDialogDescription(activeDecision)}
          variant={getReviewConfirmVariant(activeDecision)}
          confirmLabel={getReviewConfirmButtonLabel(activeDecision)}
          cancelLabel="Cancel"
          loading={submitting}
          onConfirm={() => void confirmReview()}
        >
          <div className="rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] p-3 text-sm text-[var(--admin-text-muted)]">
            <div>
              <span className="font-semibold text-[var(--admin-text)]">Submission:</span> {activeSubmission.id}
            </div>
            <div>
              <span className="font-semibold text-[var(--admin-text)]">Fee request:</span>{' '}
              {feeById.get(activeSubmission.fee_request_id)?.title ?? activeSubmission.fee_request_id}
            </div>
            <div>
              <span className="font-semibold text-[var(--admin-text)]">Student:</span>{' '}
              {studentNameById.get(activeSubmission.student_id) ?? activeSubmission.student_id}
            </div>
            <div>
              <span className="font-semibold text-[var(--admin-text)]">Method:</span> {activeSubmission.method}
            </div>
          </div>
          <label className="mt-4 block">
            <div className="mb-1 text-sm font-semibold text-[var(--admin-text)]">
              Admin comment <span className="text-[var(--admin-danger)]">*</span>
            </div>
            <textarea
              value={adminComment}
              onChange={(ev) => setAdminComment(ev.target.value)}
              rows={4}
              className="admin-focus-ring w-full rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-primary-border)]"
              placeholder="Add reason/details for this decision..."
            />
          </label>
        </AdminConfirmDialog>
      ) : null}
      {previewUrl ? <AttachmentPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} title="Payment Attachment" /> : null}
    </PageContainer>
  );
}

