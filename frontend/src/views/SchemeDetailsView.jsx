import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Landmark,
  ShieldCheck,
  FileText,
  Gift,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SCHEMES_DATA } from '../data/mockData';

export default function SchemeDetailsView({ schemeId }) {
  const { navigateTo, startWizard, selectedSchemeForDetail } = useApp();
  const [activeTab, setActiveTab] = useState('eligibility'); // 'overview' | 'eligibility' | 'documents' | 'benefits'

  const scheme =
    selectedSchemeForDetail ||
    SCHEMES_DATA.find((s) => s.id === schemeId) ||
    SCHEMES_DATA[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer min-h-[44px] px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Scheme Main Header Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
                {scheme.name}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {scheme.fullName}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] bg-[#E8F8F2] px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
            {scheme.badge || `${scheme.match_percentage}% Match`}
          </span>
        </div>

        {/* Metric Specifications Grid */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-[#64748B]">Loan Amount</span>
            <span className="font-bold text-[#1E293B] font-mono">
              {scheme.loan_amount_display}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-[#64748B]">Interest Rate</span>
            <span className="font-bold text-[#1E293B] font-mono">
              {scheme.interest_rate_display}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-[#64748B]">Repayment Period</span>
            <span className="font-bold text-[#1E293B]">
              {scheme.repayment_period}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Moratorium Period</span>
            <span className="font-bold text-[#1E293B]">
              {scheme.moratorium_period}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8F0] gap-3 sm:gap-6 text-xs sm:text-sm overflow-x-auto pb-0.5 max-w-full">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'eligibility', label: 'Eligibility' },
            { id: 'documents', label: 'Documents' },
            { id: 'benefits', label: 'Benefits' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold transition-colors relative cursor-pointer shrink-0 min-h-[40px] flex items-center ${
                activeTab === tab.id
                  ? 'text-[#0B3B60]'
                  : 'text-[#64748B] hover:text-[#0B3B60]'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B3B60] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          {activeTab === 'eligibility' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {scheme.eligibility_criteria?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#E8F8F2] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-[#334155] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-3 text-xs sm:text-sm text-[#334155] leading-relaxed animate-in fade-in duration-150">
              <p>{scheme.description}</p>
              <div className="p-3.5 bg-[#EFF6FF] rounded-2xl border border-[#DBEAFE] space-y-1.5">
                <span className="font-bold text-[#0B3B60] block">Why this scheme matches your profile:</span>
                <ul className="space-y-1">
                  {scheme.why_matched?.map((reason, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[#1E40AF]">
                      <span>•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {scheme.required_documents?.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#F1F5F9] text-[#0B3B60] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span className="text-[#334155] leading-relaxed">{doc}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {scheme.benefits?.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#334155] leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={() => startWizard(1)}
          className="w-full py-4 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>Check Eligibility</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
