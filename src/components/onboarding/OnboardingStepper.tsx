import React from 'react';
import { motion } from 'motion/react';

interface Step {
  label: string;
  description?: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  showLabels?: boolean;
  showProgressBar?: boolean;
}

export function OnboardingStepper({
  steps,
  currentStep,
  completedSteps = [],
  showLabels = true,
  showProgressBar = true,
}: OnboardingStepperProps) {
  const pct = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100;

  return (
    <div className="w-full min-w-0">
      {showProgressBar && (
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 sm:mb-5">
          <motion.div
            className="h-full rounded-full mdpl-onboarding-accent-bg"
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Step row — each step is flex-1, items centered vertically */}
      <div className="flex w-full items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={stepNumber} className="relative flex flex-1 flex-col items-center">
              {/* Connector line: absolute, from this circle edge to next circle edge */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-3.5 h-0.5 sm:top-4 ${
                    isCompleted ? 'mdpl-onboarding-accent-bg' : 'bg-slate-200 dark:bg-white/15'
                  }`}
                  // left = 50% + half-circle-width; right = mirror on next step
                  style={{ left: 'calc(50% + 14px)', right: 'calc(-50% + 14px)' }}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold sm:size-8 sm:text-xs ${
                  isCompleted
                    ? 'border-[color:var(--mdpl-accent)] text-white mdpl-onboarding-accent-bg'
                    : isCurrent
                    ? 'border-[color:var(--mdpl-accent)] bg-white text-[color:var(--mdpl-accent)] dark:bg-slate-900'
                    : 'border-slate-200 bg-slate-100 text-slate-400 dark:border-white/15 dark:bg-white/10'
                }`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>

              {/* Labels */}
              {showLabels && (
                <div className="mt-1.5 w-full px-0.5 text-center sm:mt-2">
                  <div
                    className={`truncate text-[8px] font-bold uppercase leading-tight tracking-wide sm:text-[10px] sm:tracking-wider ${
                      isCompleted || isCurrent
                        ? 'text-[color:var(--mdpl-accent)]'
                        : 'text-slate-400 dark:text-white/40'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="mt-0.5 hidden text-[9px] leading-tight text-slate-400 sm:block dark:text-white/40">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
