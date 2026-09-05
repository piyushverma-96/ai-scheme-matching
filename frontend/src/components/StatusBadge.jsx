import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, Sparkles, Clock, Info } from 'lucide-react';

/**
 * Reusable Status & Verdict Badges
 * Strict Rule: NEVER display "Loan Approved" — always "Potentially Eligible" or "Needs Verification"
 */
export default function StatusBadge({ status, text, size = 'sm', className = '' }) {
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  switch (status) {
    case 'eligible':
    case 'potentially_eligible':
    case 'Potentially Eligible':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-[#E8F7EE] text-[#1A7F4E] border border-[#1A7F4E]/30 shadow-2xs ${sizeClasses} ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1A7F4E] shrink-0" />
          <span>{text || 'Potentially Eligible'}</span>
        </span>
      );

    case 'partially_eligible':
    case 'Partially Eligible':
    case 'partial':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#D97706]/30 shadow-2xs ${sizeClasses} ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>{text || 'Partially Eligible'}</span>
        </span>
      );


    case 'ineligible':
    case 'not_eligible':
    case 'Does Not Match Current Criteria':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-[#FDF2F2] text-[#B3261E] border border-[#B3261E]/20 shadow-2xs ${sizeClasses} ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#B3261E] shrink-0" />
          <span>{text || 'Criteria Not Met'}</span>
        </span>
      );

    case 'verified':
    case 'nsfdc_verified':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-[#EAF1F6] text-[#0B3B60] border border-[#0B3B60]/20 shadow-2xs ${sizeClasses} ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#0B3B60] shrink-0" />
          <span>{text || 'NSFDC Verified'}</span>
        </span>
      );

    case 'best_match':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-[#FDF5E7] text-[#C77D02] border border-[#C77D02]/30 shadow-2xs ${sizeClasses} ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C77D02] shrink-0" />
          <span>{text || 'Best Match'}</span>
        </span>
      );

    case 'needs_verification':
    case 'warning':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-[#FEF9E7] text-[#B8860B] border border-[#B8860B]/30 shadow-2xs ${sizeClasses} ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
          <span>{text || 'Verify Criteria'}</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses} ${className}`}
        >
          <Info className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span>{text || 'Information'}</span>
        </span>
      );
  }
}
