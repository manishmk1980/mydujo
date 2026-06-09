import React from 'react';
import { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-10 text-center text-slate-500 sm:px-12 sm:py-14 md:px-16 md:py-16">
        <Icon className="size-12 mx-auto mb-4 text-slate-300 sm:size-16" />
        <p className="font-medium text-slate-900 break-words">{title}</p>
        {description ? <p className="text-sm mt-1 text-slate-500 break-words">{description}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
