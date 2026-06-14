import React from 'react';
import { Link } from 'react-router-dom';
import { ReceiptText } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { FeeRequestDTO } from '../../../services/feesService';
import { AdminWidgetCard } from './AdminWidgetCard';

export type DisplayFeeStatus = 'paid' | 'pending' | 'overdue' | 'partial' | 'other';

function mapFeeRequestToDisplay(fr: FeeRequestDTO): { label: string; tone: DisplayFeeStatus } {
  const s = (fr.computed_status ?? fr.status) as string | undefined;
  switch (s) {
    case 'PAID':
      return { label: 'Paid', tone: 'paid' };
    case 'OVERDUE':
      return { label: 'Overdue', tone: 'overdue' };
    case 'ISSUED':
      return { label: 'Pending', tone: 'pending' };
    case 'DRAFT':
      return { label: 'Partial', tone: 'partial' };
    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'other' };
    default:
      return { label: (s ?? '—').replace(/_/g, ' '), tone: 'other' };
  }
}

const toneClass: Record<DisplayFeeStatus, string> = {
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200/80',
  pending: 'bg-amber-100 text-amber-900 border-amber-200/80',
  overdue: 'bg-red-100 text-red-800 border-red-200/80',
  partial: 'bg-sky-100 text-sky-900 border-sky-200/80',
  other: 'bg-slate-100 text-slate-700 border-slate-200/80',
};

interface AdminStudentFeeStatusCardProps {
  feeRequests: FeeRequestDTO[];
  loading?: boolean;
  error?: string | null;
  maxRows?: number;
}

export function AdminStudentFeeStatusCard({
  feeRequests,
  loading,
  error,
  maxRows = 6,
}: AdminStudentFeeStatusCardProps) {
  const rows = React.useMemo(() => {
    const sorted = [...feeRequests].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
    return sorted.slice(0, maxRows);
  }, [feeRequests, maxRows]);

  return (
    <AdminWidgetCard
      title="Student Fee Status"
      subtitle="Latest fee requests across students"
      className="rounded-3xl"
      action={
        <Link
          to="/admin/fees"
          className="text-xs font-bold text-[var(--admin-primary)] hover:opacity-90 font-['Space_Grotesk',sans-serif]"
        >
          View all
        </Link>
      }
    >
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : loading ? (
        <p className="text-sm text-slate-500">Loading fee records…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
          <ReceiptText className="size-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No fee requests yet</p>
          <p className="text-xs text-slate-500 mt-1">Create requests from Students or Fee Requests to see status here.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((fr) => {
            const { label, tone } = mapFeeRequestToDisplay(fr);
            const name = fr.student_full_name?.trim() || fr.student_name?.trim() || 'NA';
            const detail = fr.title?.trim() && fr.title !== name ? fr.title : 'Fee request';
            return (
              <li
                key={fr.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 px-3 py-3"
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-[#0b101b] to-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate font-['Space_Grotesk',sans-serif]">
                    {name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{detail}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 border',
                    toneClass[tone]
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </AdminWidgetCard>
  );
}
