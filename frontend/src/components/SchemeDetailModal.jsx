import React from 'react';
import { X, ExternalLink, Landmark, Calendar, ShieldCheck, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import WhyThisScheme from './WhyThisScheme';

const formatINR = (num) =>
  num != null ? `₹${Number(num).toLocaleString('en-IN')}` : '—';

export default function SchemeDetailModal({
  scheme,
  matchResult,
  isOpen,
  onClose,
  onCalculateEmi,
}) {
  if (!isOpen || (!scheme && !matchResult)) return null;

  const s = scheme || {};
  const m = matchResult || {};

  const name = s.name || m.scheme_name || 'NSFDC Scheme';
  const schemeType = s.scheme_type || m.scheme_type || 'Loan Scheme';
  const maxLoan = s.max_loan_amount || s.max_amount || m.recommended_loan_amount;
  const financingPct = s.financing_pct || 90;
  const rateDisplay =
    m.interest_rate_display ||
    (s.rate_beneficiary_min != null
      ? s.rate_beneficiary_min === s.rate_beneficiary_max
        ? `${s.rate_beneficiary_min}% p.a.`
        : `${s.rate_beneficiary_min}%–${s.rate_beneficiary_max}% p.a.`
      : '4.0%–8.0% p.a.');

  const rateToSca = s.rate_to_sca != null ? `${s.rate_to_sca}% p.a.` : '2.0%–4.0% p.a.';
  const repaymentYears =
    m.repayment_years || s.repayment_years_max || s.repayment_years || 5;
  const moratoriumNote =
    m.moratorium_note ||
    (s.moratorium_months ? `${s.moratorium_months} months moratorium` : 'As per scheme terms');

  const sourceName = s.source_name || m.source_name || 'NSFDC Official Website';
  const sourceUrl = s.source_url || m.source_url || 'https://nsfdc.nic.in';
  const lastVerifiedAt = s.last_verified_at || m.last_verified_at || '2024-09-01';
  const issuingBody = s.issuing_body || 'National Scheduled Castes Finance and Development Corporation (NSFDC)';

  const fullDesc =
    s.full_description ||
    s.short_description ||
    m.explanation ||
    'Provides concessional loan assistance to individual Scheduled Caste beneficiaries for establishing profitable economic units.';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl border border-[#E5E7EB] my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0B3B60] to-[#07263F] text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                {schemeType.replace('_', ' ')}
              </span>
              <StatusBadge status="potentially_eligible" text="Potentially Eligible" size="xs" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              {name}
            </h2>
            <p className="text-xs text-blue-200">
              {issuingBody}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-base cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-[#1C1C1C]">
          {/* Official Scheme Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              Scheme Description & Scope
            </h4>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
              {fullDesc}
            </p>
          </div>

          {/* Verified Technical Terms Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase block">Max Loan Limit</span>
              <span className="text-sm sm:text-base font-bold text-[#0B3B60] font-mono tabular-nums">
                {maxLoan ? formatINR(maxLoan) : 'Scale Based'}
              </span>
            </div>

            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase block">Interest Rate</span>
              <span className="text-sm sm:text-base font-bold text-[#1A7F4E] font-mono tabular-nums">
                {rateDisplay}
              </span>
            </div>

            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase block">NSFDC Financing</span>
              <span className="text-sm sm:text-base font-bold text-[#1C1C1C]">
                {financingPct}% of Cost
              </span>
            </div>

            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB]">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase block">Max Tenure</span>
              <span className="text-sm sm:text-base font-bold text-[#1C1C1C]">
                {repaymentYears} Years
              </span>
            </div>
          </div>

          {/* Embedded "Why This Scheme?" Section */}
          <WhyThisScheme
            scheme={scheme}
            matchResult={matchResult}
            showAction={false}
          />

          {/* Official Verification Citation Link */}
          <div className="p-4 bg-[#F7F9FB] rounded-xl border border-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-[#0B3B60]">
                <Landmark className="w-4 h-4 text-[#0F8B8D]" />
                <span>Verified Source: {sourceName}</span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Last verified from official Ministry / NSFDC portal on: <span className="font-mono">{lastVerifiedAt}</span>
              </p>
            </div>

            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3B60] hover:text-[#C77D02] transition-base underline underline-offset-2"
            >
              <span>View on NSFDC Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#F7F9FB] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-[#4A5568] hover:bg-white text-xs sm:text-sm font-semibold transition-base cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              if (onCalculateEmi) onCalculateEmi(scheme || matchResult);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs sm:text-sm font-bold shadow-xs transition-base flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Calculator className="w-4 h-4 text-[#E59310]" />
            <span>Calculate EMI for this Scheme</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
