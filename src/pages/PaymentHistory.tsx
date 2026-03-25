import React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { AttachmentPreviewModal } from '../components/ui/AttachmentPreviewModal';
import { feesService, type PaymentSubmissionDTO } from '../services/feesService';
import { resolveAttachmentUrl } from '../utils/attachments';

/**
 * Student-admin payment history page. Only real payment records for the
 * logged-in student should appear here. No placeholder totals or fake summaries.
 */
export default function PaymentHistory() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payments, setPayments] = React.useState<PaymentSubmissionDTO[]>([]);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await feesService.getMySubmissions();
        if (!alive) return;
        setPayments(rows);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load payments');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const hasPayments = payments.length > 0;

  return (
    <PageContainer>
      <PageHeader
        title="Payment History"
        description="View your fee payments and transaction records managed by your dojo."
        actions={
          <Link
            to="/fees"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            View Fees
          </Link>
        }
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}

      {!loading && hasPayments ? (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-slate-500">Status</div>
                  <div className="text-base font-bold text-slate-900">{p.status}</div>
                  <div className="mt-1 text-sm text-slate-700">
                    Method: <span className="font-semibold">{p.method}</span>
                    {p.reference ? (
                      <>
                        {' '}
                        · Ref: <span className="font-semibold">{p.reference}</span>
                      </>
                    ) : null}
                  </div>
                  {p.review_notes ? (
                    <div className="mt-2 text-sm text-slate-700">
                      Admin notes: <span className="font-medium">{p.review_notes}</span>
                    </div>
                  ) : null}
                  {resolveAttachmentUrl(p.proof_url, { feeRequestId: p.fee_request_id }) ? (
                    <div className="mt-2 text-sm">
                      Payment Proof:{' '}
                      <button
                        type="button"
                        className="text-primary font-semibold hover:underline"
                        onClick={() => setPreviewUrl(resolveAttachmentUrl(p.proof_url, { feeRequestId: p.fee_request_id }))}
                      >
                        View Attachment
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="text-sm text-slate-700">
                  <div className="text-slate-500">Submitted</div>
                  <div className="font-semibold">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <EmptyState
          icon={History}
          title="No payment records yet"
          description="Your payment history will appear here once your dojo records fees and payments for your account."
          action={
            <Link
              to="/fees"
              className="inline-block px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
            >
              View Fees
            </Link>
          }
        />
      ) : null}
      {previewUrl ? <AttachmentPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} title="Payment Attachment" /> : null}
    </PageContainer>
  );
}