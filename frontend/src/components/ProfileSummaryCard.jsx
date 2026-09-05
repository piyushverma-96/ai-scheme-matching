import React from 'react';
import {
  Banknote,
  Briefcase,
  Wallet,
  MapPin,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfileSummaryCard({ onUpdateProfile, onStartChat }) {
  const { navigateTo, setAiAssistantOpen, profile, journeyFormData } = useApp();

  const handleUpdate = () => {
    if (onUpdateProfile) onUpdateProfile();
    else navigateTo('profile');
  };

  const handleChat = () => {
    if (onStartChat) onStartChat();
    else setAiAssistantOpen(true);
  };

  const incomeFormatted = profile?.annual_family_income
    ? `₹${Number(profile.annual_family_income).toLocaleString('en-IN')}`
    : journeyFormData?.familyIncome || '₹2,50,000';

  const purpose = profile?.purpose || journeyFormData?.purpose || 'Business Expansion';
  const loanRequired = journeyFormData?.amountFormatted || '₹3,00,000';
  const location = [profile?.city, profile?.district, profile?.state]
    .filter(Boolean)
    .join(', ') || [journeyFormData?.district, journeyFormData?.state].filter(Boolean).join(', ') || 'Madhya Pradesh';

  return (
    <div className="space-y-4">
      {/* 1. Profile Summary Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-[#0B3B60] mb-4">
          Your Profile Summary
        </h3>

        <div className="space-y-3.5">
          {/* Annual Income */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] text-[#10B981] flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] text-[#64748B] block font-medium">Annual Income</span>
              <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
                {incomeFormatted}
              </span>
            </div>
          </div>

          {/* Purpose */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] text-[#64748B] block font-medium">Purpose</span>
              <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
                {purpose}
              </span>
            </div>
          </div>

          {/* Loan Required */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#059669] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] text-[#64748B] block font-medium">Loan Required</span>
              <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
                {loanRequired}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] text-[#64748B] block font-medium">Location</span>
              <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
                {location}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-3 border-t border-[#F1F5F9] text-right">
          <button
            onClick={handleUpdate}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <span>Update Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Need Help? Sub-Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#0B3B60]">Need Help?</h4>
          <p className="text-[11px] text-[#64748B] mt-0.5">Chat with our AI Assistant</p>
          <button
            onClick={handleChat}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors mt-2 cursor-pointer"
          >
            <span>Start Chat</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
          <Headphones className="w-6 h-6 stroke-[1.8]" />
        </div>
      </div>
    </div>
  );
}
