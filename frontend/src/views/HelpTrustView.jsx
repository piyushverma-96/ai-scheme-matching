import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HelpTrustView() {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Help & Trust Center</span>
        </button>
      </div>

      {/* Official Trust Disclaimer Card */}
      <div className="bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-3xl p-5 sm:p-6 space-y-2.5">
        <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Official Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-[#92400E] leading-relaxed">
          ArthSetu provides guidance based on publicly available government scheme guidelines. Final loan sanctioning and subsidy disbursement are made exclusively by authorized State Channelizing Agencies and partner banks following physical document verification.
        </p>
      </div>

      {/* 1. How ArthSetu Works */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0B3B60]">
            How ArthSetu Works
          </h3>
        </div>

        <ol className="space-y-3 text-xs sm:text-sm text-[#334155]">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#0B3B60] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span><strong>Share your requirement:</strong> Tell us your funding requirement (Business or Education) and basic family income.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#0B3B60] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span><strong>Deterministic Matching:</strong> Our rule engine evaluates criteria without hallucinations to recommend viable concessional loan schemes.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#0B3B60] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span><strong>Connect with Local Partner:</strong> Locate authorized State SC Finance Corporations and partner bank branches in your district.</span>
          </li>
        </ol>
      </div>

      {/* 2. Data Privacy & Security */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] text-[#10B981] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0B3B60]">
            Data Privacy & Security
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          We do not store sensitive identity passwords or Aadhaar biometric data. Your self-declared information is processed strictly for local scheme matching and tracking.
        </p>
      </div>
    </div>
  );
}
