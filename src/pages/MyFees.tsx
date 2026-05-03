import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, History, ReceiptText } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { feesService, type FeeRequestDTO, type PaymentSubmissionDTO } from '../services/feesService';

function formatINRFromPaise(paise: number) {
  const rupees = paise / 100;
  return rupees.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function canSubmit(r: FeeRequestDTO, payment?: PaymentSubmissionDTO) {
  const status = r.computed_status ?? r.status;
  const openForPayment = status === 'ISSUED' || status === 'OVERDUE';
  if (!openForPayment) return false;
  if (!payment) return true;
  return payment.status === 'REJECTED' || payment.status === 'CANCELLED';
}

function getStudentFacingStatus(request: FeeRequestDTO, payment?: PaymentSubmissionDTO) {
  const requestStatus = request.computed_status ?? request.status;
  if (payment?.status === 'SUBMITTED' || payment?.status === 'NEEDS_INFO') return 'IN_PROGRESS';
  if (requestStatus === 'PAID' || payment?.status === 'VERIFIED') return 'PAYMENT_SUCCESSFUL';
  return requestStatus;
}

function getPaymentLogStatusClass(status: string) {
  if (status === 'VERIFIED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'SUBMITTED') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'NEEDS_INFO') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'CANCELLED') return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export default function MyFees() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [requests, setRequests] = React.useState<FeeRequestDTO[]>([]);
  const [payments, setPayments] = React.useState<PaymentSubmissionDTO[]>([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [feeRows, paymentRows] = await Promise.all([
          feesService.getMyFeeRequests(),
          feesService.getMySubmissions(),
        ]);
        if (!alive) return;
        setRequests(feeRows);
        setPayments(paymentRows);
        setError(null);
        window.dispatchEvent(new CustomEvent('fee-requests-updated'));
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load fees');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Fee Information"
        description="View fee requests from your dojo and submit manual payments for review."
        actions={
          <Link
            to="/payments"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            View Payment History
          </Link>
        }
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="text-sm text-slate-600">Loading…</div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No fee requests yet"
          description="Your dojo will issue fee requests here when payments are due."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const latestPayment = payments
              .filter((p) => p.fee_request_id === r.id)
              .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];
            const status = getStudentFacingStatus(r, latestPayment);
            return (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-slate-900 truncate">{r.title}</h3>
                      <StatusBadge status={status.toLowerCase()} label={status} showIcon={false} />
                    </div>
                    {r.description ? <p className="mt-1 text-sm text-slate-600">{r.description}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-700">
                      <span className="font-semibold">{formatINRFromPaise(r.amount_paise)}</span>
                      <span className="text-slate-500">Due: {r.due_date}</span>
                      {latestPayment && status === 'IN_PROGRESS' ? (
                        <span className="text-amber-700">Payment submitted, waiting for admin approval</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {canSubmit(r, latestPayment) ? (
                      <Link
                        to={`/fees/${r.id}/submit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        <CreditCard className="size-4" />
                        Pay Fee
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-500">No action required</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <History className="size-4 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">Payment History</h3>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={History}
              title="No payment records yet"
              description="Your payment submissions will appear here after you pay any issued fee."
            />
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 10).map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-700">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getPaymentLogStatusClass(p.status)}`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>{' '}
                      · {p.method}
                      {p.reference ? <> · Ref: {p.reference}</> : null}
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                    </div>
                  </div>
                  {p.review_notes ? <p className="mt-1 text-sm text-slate-600">Admin note: {p.review_notes}</p> : null}
                </div>
              ))}
              <div className="pt-1">
                <Link to="/payments" className="text-sm font-semibold text-primary hover:underline">
                  Open full payment history
                </Link>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </PageContainer>
  );
}

