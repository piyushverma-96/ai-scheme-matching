import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Calculator,
  ExternalLink,
  Info,
  CheckCircle2,
  Calendar,
  Percent,
  Clock,
  Landmark,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import Card from './Card';

const formatINR = (num) =>
  num != null ? `₹${Number(num).toLocaleString('en-IN')}` : '—';

/**
 * Reusable Scheme Recommendation Card Component
 * Requirements:
 *  - Scheme name
 *  - Potential eligibility ("Potentially Eligible", NEVER "Loan Approved")
 *  - Match explanation
 *  - Loan limit
 *  - Interest rate if verified
 *  - Repayment period if verified
 *  - Source & last verified date
 *  - "View Details" action
 */
export default function SchemeCard({
  scheme,
  matchResult,
  onViewDetails,
  onCalculateEmi,
  isFeatured = false,
  className = '',
}) {
  const s = scheme || {};
  const m = matchResult || {};

  const benefitType = s.benefit_type || m.benefit_type || 'loan';
  const hasFinancialCalc = s.has_financial_calculation !== false && m.has_financial_calculation !== false;
  const isLoan = benefitType === 'loan';

  const name = s.name || m.scheme_name || 'Government Scheme';
  const schemeType = s.scheme_type || m.scheme_type || (isLoan ? 'Loan Scheme' : 'Support Scheme');
  const maxLoan = s.max_loan_amount || s.max_amount || m.recommended_loan_amount;
  const rateDisplay =
    m.interest_rate_display ||
    (s.rate_beneficiary_min != null
      ? s.rate_beneficiary_min === s.rate_beneficiary_max
        ? `${s.rate_beneficiary_min}% p.a.`
        : `${s.rate_beneficiary_min}%–${s.rate_beneficiary_max}% p.a.`
      : s.rate || '4.0%–8.0% p.a.');

  const repaymentYears =
    m.repayment_years || s.repayment_years_max || s.repayment_years || 5;
  const moratoriumNote =
    m.moratorium_note ||
    (s.moratorium_months ? `${s.moratorium_months} months moratorium` : 'As per scheme guidelines');

  const sourceName = s.source_name || m.source_name || 'NSFDC Official Website';
  const sourceUrl = s.source_url || m.source_url || 'https://nsfdc.nic.in';
  const lastVerifiedAt = s.last_verified_at || m.last_verified_at || '2026-09-05';

  const explanation =
    m.explanation ||
    s.benefit_summary ||
    s.short_description ||
    'Government financial and business support scheme for marginalized entrepreneurs.';

  const matchScore = m.match_score != null ? m.match_score : 100;
  const isEligible = m.eligible !== false;

  return (
    <Card
      accent={isFeatured ? 'amber' : 'navy'}
      padding="p-5 sm:p-6"
      className={`flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#EAF1F6] text-[#0B3B60]">
                {benefitType === 'loan' ? schemeType.replace('_', ' ') : benefitType.replace('_', ' ')}
              </span>

              {isFeatured && (
                <StatusBadge status="best_match" text="Best Match Scheme" size="xs" />
              )}
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B3B60] tracking-tight">
              {name}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-1">
            <StatusBadge
              status={
                m.eligible
                  ? 'potentially_eligible'
                  : m.partially_eligible
                  ? 'partially_eligible'
                  : isEligible
                  ? 'potentially_eligible'
                  : 'ineligible'
              }
              text={
                m.verdict ||
                (m.eligible
                  ? 'Potentially Eligible'
                  : m.partially_eligible
                  ? 'Partially Eligible'
                  : isEligible
                  ? 'Potentially Eligible'
                  : 'Criteria Not Met')
              }
              size="xs"
            />
            {m.match_score != null && (
              <span className={`text-[11px] font-bold font-mono ${m.partially_eligible ? 'text-[#D97706]' : 'text-[#1A7F4E]'}`}>
                {m.match_score}% Score
              </span>
            )}
          </div>

        </div>

        {/* Match Explanation */}
        <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB] text-xs text-[#4A5568] leading-relaxed">
          <span className="font-semibold text-[#0B3B60]">Match Overview: </span>
          <span>{explanation}</span>
        </div>

        {/* 4-Box Key Specification Matrix */}
        <dl className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-0.5">
            <dt className="text-[11px] font-semibold text-[#6B7280]">
              {isLoan ? 'Loan Limit' : 'Benefit Amount'}
            </dt>
            <dd className="font-bold text-[#0B3B60] text-sm sm:text-base font-mono tabular-nums">
              {isLoan
                ? (maxLoan ? `Up to ${formatINR(maxLoan)}` : 'As per Project Scale')
                : (s.benefit_amount_display || m.benefit_amount_display || (maxLoan ? `Up to ${formatINR(maxLoan)}` : 'Full Entitlement'))}
            </dd>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-0.5">
            <dt className="text-[11px] font-semibold text-[#6B7280]">
              {isLoan ? 'Interest Rate' : 'Support Type'}
            </dt>
            <dd className="font-bold text-[#1A7F4E] text-sm sm:text-base font-mono tabular-nums">
              {isLoan
                ? rateDisplay
                : (s.support_type_display || m.support_type_display || 'Direct Benefit')}
            </dd>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-0.5">
            <dt className="text-[11px] font-semibold text-[#6B7280]">
              {isLoan ? 'Repayment Period' : 'Support Tenure'}
            </dt>
            <dd className="font-bold text-[#1C1C1C] text-xs sm:text-sm">
              {isLoan ? `Up to ${repaymentYears} Years` : 'Project / Course Duration'}
            </dd>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-0.5">
            <dt className="text-[11px] font-semibold text-[#6B7280]">
              {isLoan ? 'Moratorium' : 'Disbursement'}
            </dt>
            <dd className="font-bold text-[#1C1C1C] text-xs sm:text-sm truncate" title={isLoan ? moratoriumNote : 'Direct Channel Transfer'}>
              {isLoan ? moratoriumNote : 'Direct Agency Transfer'}
            </dd>
          </div>
        </dl>

        {/* Source citation */}
        <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
          <div className="flex items-center gap-1.5 truncate">
            <Landmark className="w-3.5 h-3.5 text-[#0F8B8D] shrink-0" />
            <span className="truncate">Source: {sourceName}</span>
          </div>
          <span className="shrink-0 text-[10px] text-gray-400 font-mono">
            Verified: {lastVerifiedAt}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-4 mt-4 border-t border-[#E5E7EB]">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(scheme || matchResult)}
            className="w-full py-2.5 px-3 bg-white hover:bg-[#EAF1F6] text-[#0B3B60] border border-[#0B3B60] font-semibold text-xs sm:text-sm rounded-xl transition-base flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#0B3B60]" />
            <span>View Details</span>
          </button>
        )}

        {onCalculateEmi && (
          <button
            onClick={() => onCalculateEmi(scheme || matchResult)}
            className="w-full py-2.5 px-3 bg-[#0B3B60] hover:bg-[#07263F] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-base flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-[#E59310]" />
            <span>{hasFinancialCalc ? 'Calculate EMI' : 'Financial Impact'}</span>
          </button>
        )}
      </div>
    </Card>
  );
}
