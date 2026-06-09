import type { ReactNode } from 'react';

type AdminWidgetCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function AdminWidgetCard({
  title,
  subtitle,
  children,
  className = '',
  action,
}: AdminWidgetCardProps) {
  return (
    <section
      className={[
        'min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5 sm:p-6',
        className,
      ].join(' ')}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-slate-950 sm:text-lg">{title}</h2>

          {subtitle ? (
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{subtitle}</p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </section>
  );
}