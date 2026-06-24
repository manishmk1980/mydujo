import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Copy, Download, QrCode, Wallet } from 'lucide-react';
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

/** Official UPI VPA for this dojo (static QR matches this ID). */
const UPI_VPA = 'myduj99341102@barodampay';

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
  const [upiCopied, setUpiCopied] = React.useState(false);
  const [upiCopyError, setUpiCopyError] = React.useState<string | null>(null);
  const qrImageSrc = `${import.meta.env.BASE_URL}upi-qr-bob.png`;

  const copyUpiId = async () => {
    setUpiCopyError(null);
    try {
      await navigator.clipboard.writeText(UPI_VPA);
      setUpiCopied(true);
      window.setTimeout(() => setUpiCopied(false), 2000);
    } catch {
      setUpiCopyError('Could not copy automatically — select the UPI ID above and copy manually.');
    }
  };

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

      window.dispatchEvent(new CustomEvent('fee-requests-updated'));
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
              <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-primary/[0.12] via-white to-emerald-50/40 p-4 shadow-md ring-1 ring-primary/15 sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Start here — how paying works</p>
                  <h3 className="mt-1.5 text-base font-bold leading-snug text-slate-900 sm:text-lg">
                    Pay with the <span className="text-primary">QR code</span> or the <span className="text-primary">UPI ID</span> — pick whichever is easier
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Only UPI is accepted right now. Use one of the two ways below, then complete the form on the right.
                  </p>
                  <ol className="mt-4 space-y-2.5 border-t border-primary/20 pt-4 text-sm text-slate-800">
                    <li className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                        1
                      </span>
                      <span>
                        <strong className="text-slate-900">Send the exact fee amount</strong> shown in the grey box above (same rupees and paise). Wrong amounts delay verification.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                        2
                      </span>
                      <span>
                        Pay using <strong className="text-slate-900">Option A (QR)</strong> or <strong className="text-slate-900">Option B (UPI ID)</strong> on this page — steps are written under each.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                        3
                      </span>
                      <span>
                        When the app shows <strong className="text-slate-900">success</strong>, note the{' '}
                        <strong className="text-slate-900">UTR</strong> or <strong className="text-slate-900">transaction ID</strong>, enter it under{' '}
                        <strong className="text-slate-900">Reference</strong> on the right, and click <strong className="text-slate-900">Submit for review</strong>.
                      </span>
                    </li>
                  </ol>
                </div>

                <div className="rounded-xl border-l-4 border-emerald-600 bg-emerald-50/90 p-4 shadow-sm">
                  <div className="flex items-start gap-2">
                    <QrCode className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-emerald-950">Option A — Scan the QR code</h4>
                      <p className="mt-1 text-xs font-medium text-emerald-900/90">Best if you use Google Pay, PhonePe, Paytm, or BHIM on your phone.</p>
                      <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-emerald-950/95">
                        <li>Scroll down and <strong>unlock the QR</strong> with your login password when asked.</li>
                        <li>Open your UPI app and tap <strong>Scan QR</strong> (wording may be “Scan” or “QR”).</li>
                        <li>
                          <strong>Another phone / computer screen:</strong> point the camera at the QR on this page.{' '}
                          <strong>Same phone:</strong> use <strong>Download QR image</strong> after unlock, open the photo, and scan from the app if your bank allows.
                        </li>
                        <li>
                          Check that the <strong>amount matches</strong> the fee above, then confirm payment. Keep the app’s success screen for your UTR if needed.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border-l-4 border-blue-600 bg-blue-50/90 p-4 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Wallet className="mt-0.5 size-5 shrink-0 text-blue-700" aria-hidden />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-blue-950">Option B — Pay using the UPI ID</h4>
                      <p className="mt-1 text-xs font-medium text-blue-900/90">Use this if you prefer typing or pasting an address instead of scanning.</p>
                      <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-blue-950/95">
                        <li>
                          Copy the <strong>UPI ID</strong> below (or type it carefully — one wrong character sends money elsewhere).
                        </li>
                        <li>
                          In your app, choose <strong>Send money</strong>, <strong>Pay to UPI ID</strong>, or similar — not “Scan QR”.
                        </li>
                        <li>
                          Paste or enter the ID, enter the <strong>same amount</strong> as this fee, add a short note if you like, then pay.
                        </li>
                        <li>After success, use the <strong>UTR / transaction ID</strong> in the form on the right.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-slate-300 bg-white p-3 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-600">UPI ID (same as on the QR)</div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <input
                      readOnly
                      value={UPI_VPA}
                      aria-label="UPI payment address"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono font-semibold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary/90"
                    >
                      <Copy className="size-4 shrink-0" />
                      {upiCopied ? 'Copied!' : 'Copy UPI ID'}
                    </button>
                  </div>
                  {upiCopyError ? <p className="mt-2 text-xs font-medium text-amber-800">{upiCopyError}</p> : null}
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
                  <div className="space-y-2">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      QR unlocked. Complete payment, then submit payment details in the Payment Info Section.
                    </div>
                    <a
                      href={qrImageSrc}
                      download="mdpl-upi-qr.png"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:w-auto"
                    >
                      <Download className="size-4" />
                      Download QR image
                    </a>
                    <p className="text-[11px] text-slate-500">
                      Save the image, then open it in Photos and scan from your UPI app — useful when paying from the same phone.
                    </p>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Payment Info Section</h3>
                <div className="rounded-xl border-2 border-amber-300/80 bg-amber-50 px-3 py-3 text-sm text-amber-950 shadow-sm">
                  <strong className="font-bold">After you pay:</strong> copy the <strong>UTR</strong> or{' '}
                  <strong>transaction ID</strong> from your UPI app’s success screen and enter it in{' '}
                  <strong>Reference</strong> below. That is how we match your payment to this fee.
                </div>
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

