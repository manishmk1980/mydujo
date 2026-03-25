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
      <div className="p-16 text-center text-slate-500">
        <Icon className="size-16 mx-auto mb-4 text-slate-300" />
        <p className="font-medium text-slate-900">{title}</p>
        {description ? <p className="text-sm mt-1 text-slate-500">{description}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
