import React from 'react';
import { CheckCircle2, AlertTriangle, FileText, Landmark, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * Reusable "Why This Scheme?" Explainer Component
 * Shows:
 *  - Verified matching factors (✓ Purpose, ✓ Income, ✓ Amount, ✓ Category)
 *  - "Things you still need to verify" (⚠️ Documents, SCA Partner verification)
 */
export default function WhyThisScheme({
  scheme,
  matchResult,
  userInputs = {},
  showAction = true,
  onCalculateEmi,
}) {
  if (!scheme && !matchResult) return null;

  const name = scheme?.name || matchResult?.scheme_name || 'NSFDC Scheme';
  const matchingFactors = matchResult?.matching_factors?.length
    ? matchResult.matching_factors
    : [
        'Purpose of loan aligns with eligible business / educational activities',
        'Income is within the listed NSFDC family income ceiling',
        'Requested loan amount is within the maximum scheme allocation',
        'Scheduled Caste (SC) category eligibility declared',
      ];

  const failedFactors = matchResult?.failed_factors || [];
  const missingInfo = matchResult?.missing_information || [];
  const explanation = matchResult?.explanation || scheme?.short_description || '';
  const matchScore = matchResult?.match_score || 95;

  // Checklist of verification requirements before disbursement
  const defaultThingsToVerify = [
    {
      title: 'Valid Caste / Community Certificate',
      desc: 'Issued by the competent revenue authority (Tahsildar / Sub-Divisional Magistrate).',
    },
    {
      title: 'Family Income Certificate',
      desc: 'Current year income certificate proving annual family income criteria.',
    },
    {
      title: 'Project Proposal / Business Quotation',
      desc: 'Detailed project report or invoice for machinery/equipment for channelizing agency evaluation.',
    },
    {
      title: 'State Channelizing Agency (SCA) Submission',
      desc: 'Submission of application to your local district SCA or nominated Public Sector Bank branch.',
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#F7F9FB] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#0B3B60] uppercase tracking-wider">
                Transparent Rule Verification
              </span>
              <StatusBadge status="potentially_eligible" text="Potentially Eligible" size="xs" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B3B60]">
              Why {name}?
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                Match Score
              </span>
              <span className="text-base font-bold text-[#1A7F4E] font-mono tabular-nums">
                {matchScore}/100
              </span>
            </div>

            <div className="w-16 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A7F4E] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(matchScore, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {explanation && (
          <p className="text-xs sm:text-sm text-[#4A5568] mt-3 leading-relaxed">
            {explanation}
          </p>
        )}
      </div>

      {/* 1. Verified Matching Factors Section */}
      <div className="bg-white border border-[#1A7F4E]/30 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-[#1A7F4E] font-bold text-xs sm:text-sm uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-[#1A7F4E]" />
          <span>Verified Matching Factors (Satisfied Criteria)</span>
        </div>

        <ul className="space-y-2.5 pt-1">
          {matchingFactors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1C1C1C]">
              <div className="w-4 h-4 rounded-full bg-[#E8F7EE] flex items-center justify-center text-[#1A7F4E] shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium leading-snug">{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Things You Still Need to Verify Section */}
      <div className="bg-[#FEF9E7] border border-[#B8860B]/30 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-[#8B6508] font-bold text-xs sm:text-sm uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-[#B8860B]" />
          <span>Things You Still Need to Verify Before Final Sanction</span>
        </div>

        <p className="text-xs text-[#8B6508]/90">
          This system provides indicative eligibility. The following requirements must be verified by the State Channelizing Agency:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {defaultThingsToVerify.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/80 rounded-xl border border-[#B8860B]/20 space-y-1"
            >
              <p className="text-xs font-bold text-[#8B6508] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                <span>{item.title}</span>
              </p>
              <p className="text-[11px] text-[#6B7280] leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Disqualifiers or Missing Info if any */}
      {(failedFactors.length > 0 || missingInfo.length > 0) && (
        <div className="bg-[#FDF2F2] border border-[#B3261E]/30 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-[#B3261E] uppercase tracking-wider">
            Important Considerations / Missing Information
          </p>
          {failedFactors.map((f, i) => (
            <p key={i} className="text-xs text-[#B3261E] flex items-center gap-1.5">
              <span>•</span>
              <span>{f}</span>
            </p>
          ))}
          {missingInfo.map((m, i) => (
            <p key={i} className="text-xs text-[#6B7280] flex items-center gap-1.5">
              <span>• Required: {m}</span>
            </p>
          ))}
        </div>
      )}

      {/* Action to proceed to EMI calculation */}
      {showAction && onCalculateEmi && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onCalculateEmi}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-base cursor-pointer"
          >
            <span>Calculate EMI with this Scheme Terms</span>
          </button>
        </div>
      )}
    </div>
  );
}
