import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STEP_KEYS = ['details', 'scheme', 'emi', 'partners', 'guide'];

export default function StepIndicator() {
  const { t } = useTranslation();
  const { step } = useApp();

  const currentStepKey = STEP_KEYS[step - 1] || 'details';
  const progressPct = ((step - 1) / (STEP_KEYS.length - 1)) * 100;

  return (
    <nav aria-label="Progress" className="w-full mb-6 sm:mb-8">
      {/* Mobile compact stepper (< 640px / < 480px) */}
      <div className="block sm:hidden bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[#0B3B60]">
            Step {step} of 5: <span className="text-[#1C1C1C] font-bold">{t(`steps.${currentStepKey}`)}</span>
          </span>
          <span className="text-[#0F8B8D] font-mono text-[11px]">
            {Math.round((step / 5) * 100)}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0F8B8D] to-[#C77D02] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={5}
          />
        </div>
      </div>

      {/* Desktop / tablet full 5-circle stepper (>= 640px) */}
      <ol className="hidden sm:flex items-center gap-0">
        {STEP_KEYS.map((key, idx) => {
          const stepNum = idx + 1;
          const isDone = step > stepNum;
          const isCurrent = step === stepNum;

          return (
            <React.Fragment key={key}>
              <li className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-base
                    ${isDone ? 'bg-[#0F8B8D] text-white shadow-xs' : ''}
                    ${isCurrent ? 'bg-[#C77D02] text-white ring-4 ring-[#C77D02]/20 shadow-xs' : ''}
                    ${!isDone && !isCurrent ? 'border-2 border-gray-300 bg-white text-gray-400' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-white stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold text-center leading-tight max-w-[70px]
                    ${isCurrent ? 'text-[#C77D02]' : isDone ? 'text-[#0F8B8D]' : 'text-gray-500'}
                  `}
                >
                  {t(`steps.${key}`)}
                </span>
              </li>
              {idx < STEP_KEYS.length - 1 && (
                <div
                  className={`step-connector mx-2 mt-[-22px] ${isDone ? 'done' : ''}`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
