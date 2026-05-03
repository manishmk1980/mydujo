import React, { useRef } from 'react';
import { ChevronDown, FileSpreadsheet, Upload } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useFlashToast } from '../../ui/FlashToast';
import { useIsMobile } from '../../../hooks/useMediaQuery';

type Variant = 'dropdown' | 'inline';

interface AdminImportMenuProps {
  variant?: Variant;
  className?: string;
  /** Override button styles (e.g. dark sidebar card) */
  inlineButtonClassName?: string;
  /** Narrow sidebar: icon-only actions with native tooltips */
  collapsed?: boolean;
}

/** Import Student List + Import Students Fee List — file pick only until backend import exists. */
export function AdminImportMenu({
  variant = 'dropdown',
  className,
  inlineButtonClassName,
  collapsed = false,
}: AdminImportMenuProps) {
  const toast = useFlashToast();
  const isMobile = useIsMobile();
  const studentsRef = useRef<HTMLInputElement>(null);
  const feesRef = useRef<HTMLInputElement>(null);

  const onFile = (kind: 'students' | 'fees') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    toast.success(
      `“${file.name}” selected (${kind === 'students' ? 'student list' : 'fee list'}) — server import is not wired yet.`
    );
  };

  const btnBase = cn(
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors font-['Space_Grotesk',sans-serif]",
    inlineButtonClassName ??
      'border border-slate-200/80 bg-white text-slate-800 hover:bg-slate-50'
  );

  if (variant === 'inline') {
    const iconBtn =
      'inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-colors';

    if (collapsed) {
      return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
          <input
            ref={studentsRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            aria-hidden
            onChange={onFile('students')}
          />
          <input
            ref={feesRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            aria-hidden
            onChange={onFile('fees')}
          />
          <button
            type="button"
            className={iconBtn}
            title="Import Student List"
            aria-label="Import Student List"
            onClick={() => studentsRef.current?.click()}
          >
            <FileSpreadsheet className="size-4 text-[var(--admin-primary)]" />
          </button>
          <button
            type="button"
            className={iconBtn}
            title="Import Students Fee List"
            aria-label="Import Students Fee List"
            onClick={() => feesRef.current?.click()}
          >
            <Upload className="size-4 text-[var(--admin-primary)]" />
          </button>
        </div>
      );
    }

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <input
          ref={studentsRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          aria-hidden
          onChange={onFile('students')}
        />
        <input
          ref={feesRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          aria-hidden
          onChange={onFile('fees')}
        />
        <button type="button" className={btnBase} onClick={() => studentsRef.current?.click()}>
          <FileSpreadsheet className="size-4 text-[var(--admin-primary)] shrink-0" />
          Import Student List
        </button>
        <button type="button" className={btnBase} onClick={() => feesRef.current?.click()}>
          <Upload className="size-4 text-[var(--admin-primary)] shrink-0" />
          Import Students Fee List
        </button>
      </div>
    );
  }

  return (
    <details className={cn('relative group', className)}>
      <summary
        className={cn(
          'list-none cursor-pointer inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold sm:w-auto sm:px-4',
          'text-slate-800 bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors',
          "font-['Space_Grotesk',sans-serif]",
          '[&::-webkit-details-marker]:hidden'
        )}
      >
        <span className="truncate">{isMobile ? 'Import' : 'Import Data'}</span>
        <ChevronDown className="size-4 shrink-0 text-slate-500 group-open:rotate-180 transition-transform" />
      </summary>
      <div
        className={cn(
          'absolute left-0 right-0 top-full z-40 mt-2 min-w-[14rem] rounded-2xl border border-slate-200/80 bg-white py-2 shadow-lg sm:left-auto sm:right-0 sm:min-w-[14rem]'
        )}
      >
        <input
          ref={studentsRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          aria-hidden
          onChange={onFile('students')}
        />
        <input
          ref={feesRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          aria-hidden
          onChange={onFile('fees')}
        />
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
          onClick={() => studentsRef.current?.click()}
        >
          <FileSpreadsheet className="size-4 text-[var(--admin-primary)] shrink-0" />
          Import Student List
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
          onClick={() => feesRef.current?.click()}
        >
          <Upload className="size-4 text-[var(--admin-primary)] shrink-0" />
          Import Students Fee List
        </button>
      </div>
    </details>
  );
}
