import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ReviewItem {
  label: string;
  value: string;
  status?: 'valid' | 'missing' | 'warning';
}

interface ReviewSummaryCardProps {
  title?: string;
  items: ReviewItem[];
  className?: string;
}

export function ReviewSummaryCard({
  title = 'Review Summary',
  items,
  className = '',
}: ReviewSummaryCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'missing':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/30 ${className}`}
    >
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5 sm:px-6 sm:py-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex min-w-0 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-700 dark:text-white/85">{item.label}</div>
              <div className="mt-1 break-words text-sm text-slate-500 dark:text-white/65">
                {item.value || 'Not provided'}
              </div>
            </div>
            <div
              className={`shrink-0 self-start rounded-full border px-2.5 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${getStatusColor(item.status)}`}
            >
              {item.status === 'valid' && <CheckCircle2 className="mr-1 inline-block size-3" />}
              {item.status === 'valid' ? 'Valid' : item.status === 'missing' ? 'Missing' : item.status === 'warning' ? 'Review' : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}