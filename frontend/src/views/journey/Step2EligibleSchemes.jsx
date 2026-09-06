import React from 'react';
import {
  Landmark,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SCHEMES_DATA } from '../../data/mockData';

export default function Step2EligibleSchemes({ onContinue }) {
  const { nextJourneyStep, prevJourneyStep, setSelectedScheme, journeyFormData } = useApp();

  const handleSelectAndProceed = (scheme) => {
    if (setSelectedScheme) {
      setSelectedScheme(scheme);
    }
    if (onContinue) {
      onContinue();
    } else if (nextJourneyStep) {
      nextJourneyStep();
    }
  };

  const amountStr = journeyFormData?.amountFormatted || '₹3,00,000';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Progress State Banner */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider">
          Stage Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#10B981] font-semibold">
            <span className="w-5 h-5 rounded-full bg-[#E8F8F2] flex items-center justify-center font-bold text-xs">✓</span>
            <span>1. Understanding your requirement</span>
          </div>

          <div className="flex items-center gap-2 text-[#0B3B60] font-bold">
            <span className="w-5 h-5 rounded-full bg-[#0B3B60] text-white flex items-center justify-center font-bold text-xs">●</span>
            <span>2. Checking scheme eligibility</span>
          </div>

          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="w-5 h-5 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center font-bold text-xs">○</span>
            <span>3. Ranking suitable schemes</span>
          </div>
        </div>
      </div>

      {/* 2. Main Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0B3B60]">
          Potentially eligible schemes
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          The following government-supported loan schemes match your basic purpose, income ceiling, and requested amount ({amountStr}).
        </p>
      </div>

      {/* 3. List of Matching Schemes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {SCHEMES_DATA.map((scheme, idx) => (
          <div
            key={scheme.id}
            className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      idx % 2 === 0
                        ? 'bg-[#E8F8F2] text-[#10B981]'
                        : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}
                  >
                    {idx % 2 === 0 ? (
                      <Landmark className="w-5 h-5 stroke-[2]" />
                    ) : (
                      <Briefcase className="w-5 h-5 stroke-[2]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#0B3B60] leading-tight">
                      {scheme.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                      {scheme.fullName}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#10B981] bg-[#E8F8F2] px-2.5 py-1 rounded-full shrink-0 border border-[#10B981]/20">
                  Potentially Eligible
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                {scheme.short_description}
              </p>

              {/* Verified Criteria Checkmarks */}
              <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-1.5 text-[11px]">
                <span className="font-bold text-[#1E293B] block mb-1">
                  Why this scheme may fit:
                </span>
                <div className="flex items-center gap-2 text-[#065F46]">
                  <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
                  <span>Purpose matches listed eligible activities</span>
                </div>
                <div className="flex items-center gap-2 text-[#065F46]">
                  <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
                  <span>Income within listed criteria</span>
                </div>
                <div className="flex items-center gap-2 text-[#065F46]">
                  <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
                  <span>Requested amount within listed limit ({scheme.loan_amount_short})</span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">Interest Rate</span>
                  <span className="font-bold text-[#1E293B] font-mono">{scheme.interest_rate_display}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">Max Tenure</span>
                  <span className="font-bold text-[#1E293B]">{scheme.repayment_period}</span>
                </div>
              </div>
            </div>

            {/* Select action */}
            <div className="pt-4 mt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => handleSelectAndProceed(scheme)}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#0B3B60] text-[#0B3B60] hover:text-[#07263F] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Select & Proceed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Note that this identifies eligible schemes, not yet ranking best */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>This stage identifies all matching schemes based on structured rules. Next, we rank the most suitable scheme for your profile.</span>
      </div>

      {/* Step Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={prevJourneyStep}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Need</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectAndProceed(SCHEMES_DATA[0])}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[44px]"
        >
          <span>Continue to Best Scheme Recommendation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
