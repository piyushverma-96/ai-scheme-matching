import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  Edit2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function EligibilityResultView() {
  const { navigateTo, startWizard, profile, journeyFormData } = useApp();

  const incomeFormatted = profile?.annual_family_income
    ? `₹${Number(profile.annual_family_income).toLocaleString('en-IN')}`
    : journeyFormData?.familyIncome || '₹2,50,000';

  const loanRequired = journeyFormData?.amountFormatted || '₹3,00,000';
  const purpose = profile?.purpose || journeyFormData?.purpose || 'Business Expansion';
  const location = [profile?.city, profile?.district, profile?.state]
    .filter(Boolean)
    .join(', ') || [journeyFormData?.district, journeyFormData?.state].filter(Boolean).join(', ') || 'Madhya Pradesh';

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Check Eligibility</span>
        </button>
      </div>

      {/* 1. Green Success Status Card */}
      <div className="bg-[#E8F8F2] border border-[#10B981]/30 rounded-3xl p-5 sm:p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#065F46]">
            You are potentially eligible!
          </h2>
          <p className="text-xs sm:text-sm text-[#047857] mt-0.5">
            Based on the verified NSFDC criteria provided
          </p>
        </div>
      </div>

      {/* 2. Your Details Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <h3 className="text-sm font-bold text-[#0B3B60]">Your Details</h3>
          <button
            onClick={() => startWizard(1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
          >
            <span>Edit</span>
          </button>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Annual Income</span>
            <span className="font-bold text-[#1E293B] font-mono">
              {incomeFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Loan Required</span>
            <span className="font-bold text-[#1E293B] font-mono">
              {loanRequired}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Purpose</span>
            <span className="font-bold text-[#1E293B]">
              {purpose}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Location</span>
            <span className="font-bold text-[#1E293B]">
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Eligibility Summary Checklist Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-3.5">
        <h3 className="text-sm font-bold text-[#0B3B60] pb-2 border-b border-[#F1F5F9]">
          Eligibility Summary
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          {[
            { label: 'Income Criteria (≤ ₹3.00 Lakh)', status: 'Matched' },
            { label: 'Loan Amount Criteria (Concessional Ceiling)', status: 'Matched' },
            { label: 'Target Category (Scheduled Caste)', status: 'Matched' },
            { label: 'State Channelizing Agency Coverage', status: 'Matched' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E8F8F2] text-[#10B981] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[#334155] font-medium">{item.label}</span>
              </div>

              <span className="text-xs font-bold text-[#10B981]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Primary Action CTA Button */}
      <div className="pt-2">
        <button
          onClick={() => navigateTo('schemes')}
          className="w-full py-4 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>View Recommended Schemes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
