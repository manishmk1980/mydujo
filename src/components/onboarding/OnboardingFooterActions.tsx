import React from 'react';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface OnboardingFooterActionsProps {
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  showNext?: boolean;
  showBack?: boolean;
  showSubmit?: boolean;
  isSubmitting?: boolean;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  isSubmitDisabled?: boolean;
  className?: string;
}

export function OnboardingFooterActions({
  onNext,
  onBack,
  onSubmit,
  nextLabel = 'Next',
  backLabel = 'Previous',
  submitLabel = 'Submit',
  showNext = true,
  showBack = true,
  showSubmit = false,
  isSubmitting = false,
  isNextDisabled = false,
  isBackDisabled = false,
  isSubmitDisabled = false,
  className = '',
}: OnboardingFooterActionsProps) {
  return (
    <div
      className={`flex w-full min-w-0 flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${className}`}
    >
      <div className="flex w-full min-w-0 sm:w-auto sm:shrink-0">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isBackDisabled}
            className="inline-flex min-h-[44px] w-full min-w-0 items-center justify-center rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            <ArrowLeft className="mr-2 inline-block size-4 shrink-0" />
            <span className="truncate">{backLabel}</span>
          </button>
        )}
      </div>
      <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
        {showNext && onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-xl px-5 py-3 text-center text-sm font-bold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 sm:max-w-md sm:px-6 mdpl-onboarding-accent-bg"
          >
            <span className="text-balance">{nextLabel}</span>
            <ArrowRight className="size-4 shrink-0" />
          </button>
        )}
        {showSubmit && onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled || isSubmitting}
            className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 whitespace-normal rounded-xl px-5 py-3 text-center text-sm font-bold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:max-w-md mdpl-onboarding-accent-bg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" />
                <span className="truncate">Processing…</span>
              </>
            ) : (
              <>
                <span className="text-balance">{submitLabel}</span>
                <ArrowRight className="size-4 shrink-0" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}