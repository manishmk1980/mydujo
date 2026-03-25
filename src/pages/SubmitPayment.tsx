import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { feesService, type FeeRequestDTO, type PaymentMethod } from '../services/feesService';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

function formatINRFromPaise(paise: number) {
  const rupees = paise / 100;
  return rupees.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

const METHODS: Array<{ value: PaymentMethod; label: string; hint: string; enabled: boolean }> = [
  { value: 'UPI', label: 'UPI', hint: 'Enter UTR / Transaction ID', enabled: true },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', hint: 'Disabled for now', enabled: false },
  { value: 'CHEQUE', label: 'Cheque', hint: 'Disabled for now', enabled: false },
  { value: 'CASH', label: 'Cash', hint: 'Disabled for now', enabled: false },
  { value: 'OTHER', label: 'Other', hint: 'Disabled for now', enabled: false },
];

function referenceRequired(method: PaymentMethod) {
  return method === 'UPI' || method === 'BANK_TRANSFER' || method === 'CHEQUE';
}

export default function SubmitPayment() {
  const { feeRequestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [feeRequest, setFeeRequest] = React.useState<FeeRequestDTO | null>(null);

  const [method, setMethod] = React.useState<PaymentMethod>('UPI');
  const [reference, setReference] = React.useState('');
  const [paidAt, setPaidAt] = React.useState<string>('');
  const [notes, setNotes] = React.useState('');
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [qrUnlocked, setQrUnlocked] = React.useState(false);
  const [unlockPassword, setUnlockPassword] = React.useState('');
  const [unlocking, setUnlocking] = React.useState(false);
  const [unlockError, setUnlockError] = React.useState<string | null>(null);
  const qrImageSrc = `${import.meta.env.BASE_URL}upi-qr-bob.png`;

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await feesService.getMyFeeRequests();
        if (!alive) return;
        const found = rows.find((r) => r.id === feeRequestId) ?? null;
        setFeeRequest(found);
        setError(found ? null : 'Fee request not found (or not accessible)');
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load fee request');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [feeRequestId]);

  const status = feeRequest ? (feeRequest.computed_status ?? feeRequest.status) : null;
  const isOpenForSubmission = status === 'ISSUED' || status === 'OVERDUE';

  const verifyAndUnlockQr = async () => {
    const email = (user?.email || '').trim().toLowerCase();
    const password = unlockPassword.trim();
    if (!email || !password) {
      setUnlockError('Enter your current password to unlock QR code');
      return;
    }
    try {
      setUnlocking(true);
      setUnlockError(null);
      const res = await fetch(`${API_BASE}/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Invalid password');
      }
      setQrUnlocked(true);
      setUnlockPassword('');
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : 'Unable to unlock QR');
    } finally {
      setUnlocking(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeRequest) return;
    if (!isOpenForSubmission) {
      setError('This fee request is not open for payment submission.');
      return;
    }
    if (method !== 'UPI') {
      setError('Only UPI payment is enabled right now.');
      return;
    }

    if (referenceRequired(method) && !reference.trim()) {
      setError(`Reference is required for ${method}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let proofUrl: string | null = null;
      if (proofFile) {
        const ext = proofFile.name.includes('.') ? proofFile.name.split('.').pop() : '';
        const safeExt = ext ? String(ext).toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
        const fileName = `${crypto.randomUUID()}.${safeExt}`;
        const uploadPath = `${feeRequest.id}/${fileName}`;
        const uploaded = await storageService.uploadPaymentProof(proofFile, uploadPath);
        proofUrl = uploaded.url;
      }

      await feesService.submitPayment({
        feeRequestId: feeRequest.id,
        method,
        amountPaise: feeRequest.amount_paise,
        paidAt: paidAt ? new Date(paidAt).toISOString() : null,
        reference: reference.trim() || null,
        proofUrl,
        notesFromStudent: notes.trim() || null,
      });

      navigate('/payments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const methodHint = METHODS.find((m) => m.value === method)?.hint ?? '';

  return (
    <PageContainer>
      <PageHeader
        title="Submit Payment"
        description="Submit a manual payment for admin verification."
        actions={
          <Link
            to="/fees"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Back to My Fees
          </Link>
        }
      />

      {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {feeRequest ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-slate-500">Fee request</div>
              <div className="text-lg font-bold text-slate-900">{feeRequest.title}</div>
              <div className="text-sm text-slate-700">
                Amount: <span className="font-semibold">{formatINRFromPaise(feeRequest.amount_paise)}</span> · Due:{' '}
                <span className="font-semibold">{feeRequest.due_date}</span>
              </div>
            </div>
          </div>

          {!isOpenForSubmission ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              This fee request is currently <span className="font-semibold">{status}</span>. Payment details can only be submitted for ISSUED or OVERDUE fees.
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">SCAN this QR to make payment</h3>
                  <p className="mt-1 text-xs text-slate-600">Only UPI QR payment is enabled currently. Other payment modes are disabled.</p>
                </div>

                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
                  <img
                    src={qrImageSrc}
                    alt="UPI QR code"
                    className={`w-full rounded-md transition-all ${qrUnlocked ? 'blur-0' : 'blur-md opacity-60'}`}
                  />
                  {!qrUnlocked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/40 p-3 text-center">
                      <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Unlock QR code</div>
                    </div>
                  ) : null}
                </div>

                {!qrUnlocked ? (
                  <div className="space-y-2">
                    <label className="block">
                      <div className="mb-1 text-xs font-semibold text-slate-700">Enter your login password</div>
                      <input
                        type="password"
                        value={unlockPassword}
                        onChange={(ev) => setUnlockPassword(ev.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Current account password"
                      />
                    </label>
                    {unlockError ? <div className="text-xs text-red-600">{unlockError}</div> : null}
                    <button
                      type="button"
                      onClick={verifyAndUnlockQr}
                      disabled={unlocking}
                      className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {unlocking ? 'Verifying…' : 'Show QR code'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    QR unlocked. Complete payment, then submit payment details in the Payment Info Section.
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Payment Info Section</h3>
                <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-semibold text-slate-900 mb-1">Payment method</div>
                <select
                  value={method}
                  onChange={(ev) => setMethod(ev.target.value as PaymentMethod)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value} disabled={!m.enabled}>
                      {m.label}{m.enabled ? '' : ' (Disabled)'}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-slate-500">{methodHint}</div>
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  Reference {referenceRequired(method) ? <span className="text-red-600">*</span> : null}
                </div>
                <input
                  value={reference}
                  onChange={(ev) => setReference(ev.target.value)}
                  placeholder="UTR / Txn ID / Cheque no."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-slate-900 mb-1">Paid at (optional)</div>
                <input
                  type="datetime-local"
                  value={paidAt}
                  onChange={(ev) => setPaidAt(ev.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-slate-900 mb-1">Proof (optional)</div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(ev) => setProofFile(ev.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <div className="mt-1 text-xs text-slate-500">Accepted: JPG/PNG/WebP/PDF (max 8MB)</div>
              </label>
                </div>

                <label className="block">
                  <div className="text-sm font-semibold text-slate-900 mb-1">Notes (optional)</div>
                  <textarea
                    value={notes}
                    onChange={(ev) => setNotes(ev.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Anything the admin should know (e.g. paid from parent UPI, bank name, etc.)"
                  />
                </label>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link to="/fees" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !isOpenForSubmission}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </PageContainer>
  );
}

