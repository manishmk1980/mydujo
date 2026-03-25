import React from 'react';
import { CheckCircle2, CircleHelp, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
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

function getDecisionTheme(status: ReviewDecision) {
  if (status === 'VERIFIED') return 'bg-emerald-600 hover:bg-emerald-700';
  if (status === 'NEEDS_INFO') return 'bg-amber-600 hover:bg-amber-700';
  return 'bg-red-600 hover:bg-red-700';
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
      <PageHeader title="Payment Review Queue" description="Review student payment submissions and verify/reject/ask for info." />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">SUBMITTED payments</div>
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
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {loading ? <div className="p-4 text-sm text-slate-600">Loading…</div> : null}
        {!loading && items.length === 0 ? <div className="p-4 text-sm text-slate-600">No submissions awaiting review.</div> : null}

        {!loading && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
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
              <tbody className="divide-y divide-slate-100">
                {items.map((s) => (
                  <tr key={s.id} className="align-top">
                    <td className="px-4 py-3 text-slate-900">
                      <div className="font-semibold break-all">{s.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{feeById.get(s.fee_request_id)?.title ?? s.fee_request_id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{studentNameById.get(s.student_id) ?? s.student_id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold">{s.method}</div>
                      <div className="text-xs text-slate-500 break-all">{s.reference ? `Ref: ${s.reference}` : 'No reference'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[280px]">
                      <div className="break-words whitespace-pre-wrap">{s.notes_from_student || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {(() => {
                        const attachmentUrl = resolveAttachmentUrl(s.proof_url, { feeRequestId: s.fee_request_id });
                        return attachmentUrl ? (
                          <button
                            type="button"
                            className="text-primary font-semibold hover:underline"
                            onClick={() => setPreviewUrl(attachmentUrl)}
                          >
                            View Attachment
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">No proof</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
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
      </div>

      {activeSubmission && activeDecision ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="text-base font-bold text-slate-900">Validate & Confirm Payment</div>
            <div className="mt-2 text-sm text-slate-600">
              You are about to <span className="font-semibold">{getDecisionLabel(activeDecision).toLowerCase()}</span> this payment submission.
              Please review details and add a comment to avoid accidental changes.
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div><span className="font-semibold">Submission:</span> {activeSubmission.id}</div>
              <div><span className="font-semibold">Fee Request:</span> Admin</div>
              <div><span className="font-semibold">Student:</span> {studentNameById.get(activeSubmission.student_id) ?? activeSubmission.student_id}</div>
              <div><span className="font-semibold">Method:</span> {activeSubmission.method}</div>
            </div>

            <label className="mt-4 block">
              <div className="mb-1 text-sm font-semibold text-slate-900">Admin comment <span className="text-red-600">*</span></div>
              <textarea
                value={adminComment}
                onChange={(ev) => setAdminComment(ev.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Add reason/details for this decision..."
              />
            </label>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReview}
                disabled={submitting || !adminComment.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 ${getDecisionTheme(activeDecision)}`}
              >
                {submitting ? 'Saving…' : (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm {getDecisionLabel(activeDecision)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {previewUrl ? <AttachmentPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} title="Payment Attachment" /> : null}
    </PageContainer>
  );
}

