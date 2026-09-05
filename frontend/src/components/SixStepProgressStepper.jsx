import React from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SIX_STAGES = [
  { id: 1, shortLabel: 'Need', title: 'Understand Need', desc: 'Requirements' },
  { id: 2, shortLabel: 'Eligibility', title: 'Identify Eligible Schemes', desc: 'Filter Criteria' },
  { id: 3, shortLabel: 'Best Match', title: 'Recommend Best Scheme', desc: 'Top Selection' },
  { id: 4, shortLabel: 'Impact', title: 'Financial Impact', desc: 'Benefits & Calculation' },
  { id: 5, shortLabel: 'Channel', title: 'Find the Right Application Channel', desc: 'Channel Agency / Bank' },
  { id: 6, shortLabel: 'Application', title: 'Guide Application', desc: 'Docs & Tracking' },
];

export default function SixStepProgressStepper({ currentStep = 1, onStepClick }) {
  const { setJourneyStep } = useApp();

  const handleStepClick = (stepNum) => {
    if (onStepClick) {
      onStepClick(stepNum);
    } else if (setJourneyStep) {
      // Allow jumping to visited steps
      setJourneyStep(stepNum);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs mb-6">
      {/* Mobile Compact Progress Bar (< 640px) */}
      <div className="block sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#0B3B60]">
            Step {currentStep} of 6: <span className="text-[#1E293B]">{SIX_STAGES[currentStep - 1]?.title}</span>
          </span>
          <span className="font-mono text-[11px] font-bold text-[#10B981]">
            {Math.round((currentStep / 6) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0B3B60] to-[#10B981] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop & Tablet Full 6-Stage Stepper (>= 640px) */}
      <nav aria-label="6-Step Product Journey" className="hidden sm:block">
        <ol className="flex items-center justify-between relative">
          {SIX_STAGES.map((stage, idx) => {
            const stepNum = stage.id;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            const isUpcoming = currentStep < stepNum;

            return (
              <React.Fragment key={stage.id}>
                <li
                  onClick={() => handleStepClick(stepNum)}
                  className={`flex flex-col items-center gap-1.5 z-10 transition-all cursor-pointer group select-none min-w-[72px]`}
                >
                  {/* Step Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-[#10B981] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#0B3B60] text-white ring-4 ring-[#0B3B60]/15 shadow-sm scale-105'
                        : 'bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1] group-hover:border-[#0B3B60]'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span>{stepNum}</span>
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="text-center">
                    <span
                      className={`text-[11px] font-bold block leading-tight ${
                        isCurrent
                          ? 'text-[#0B3B60]'
                          : isDone
                          ? 'text-[#10B981]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {stage.shortLabel}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] hidden md:block">
                      {stage.desc}
                    </span>
                  </div>
                </li>

                {/* Connecting Line between steps */}
                {idx < SIX_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-1 mt-[-24px] transition-colors duration-300 ${
                      currentStep > idx + 1 ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
