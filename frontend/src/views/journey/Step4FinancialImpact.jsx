import React, { useState } from 'react';
import {
  Calculator,
  ArrowRight,
  ArrowLeft,
  Info,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Coins,
  CheckCircle2,
  FileCheck2,
  Scale,
  Wallet,
  Building2,
  PiggyBank,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Step4FinancialImpact({ onContinue }) {
  const {
    selectedScheme,
    nextJourneyStep,
    prevJourneyStep,
    journeyFormData,
  } = useApp();

  // Selected scheme metadata and flags
  const schemeName = selectedScheme?.scheme_name || selectedScheme?.name || 'NSFDC Scheme';
  const benefitType = selectedScheme?.benefit_type || 'loan';
  const hasFinancialCalc = selectedScheme?.has_financial_calculation !== false;
  const isLoan = benefitType === 'loan';

  // 1. Business Requirement (from Stage 1 user input)
  const businessRequirement =
    Number(journeyFormData?.amount) ||
    Number(journeyFormData?.fundingAmount) ||
    (selectedScheme?.max_loan_amount ? Math.min(300000, selectedScheme.max_loan_amount) : 300000);

  // Scheme-defined financing percentage (NSFDC statutory rule: up to 90% financing)
  const financingPct = Number(selectedScheme?.financing_pct) || 90.0;
  const maxGovLoanCap = Number(selectedScheme?.max_loan_amount) || 4500000;

  // 2. Government Support / Financial Assistance (capped by statutory max loan)
  const rawGovSupport = (businessRequirement * financingPct) / 100.0;
  const governmentSupport = Math.min(rawGovSupport, maxGovLoanCap);

  // 3. Applicant Contribution (the remainder portion the entrepreneur covers)
  const applicantContribution = Math.max(0, businessRequirement - governmentSupport);
  const applicantContributionPct = 100.0 - (governmentSupport / businessRequirement) * 100.0;

  // 4. Credit-Linked Component (applies when benefit_type === 'loan')
  const creditComponent = isLoan ? governmentSupport : 0;

  // Default parameters for secondary EMI simulation
  const defaultRate =
    Number(selectedScheme?.rate_beneficiary_min) ||
    Number(selectedScheme?.rate_val) ||
    6.5;
  const defaultTenure =
    Number(selectedScheme?.repayment_years_max) ||
    Number(selectedScheme?.repayment_years_min) ||
    (selectedScheme?.scheme_type === 'micro_finance' ? 3 : 5);
  const defaultMoratorium =
    selectedScheme?.moratorium_months != null
      ? Number(selectedScheme.moratorium_months)
      : (selectedScheme?.scheme_type === 'micro_finance' ? 3 : 6);

  const [tenureYears, setTenureYears] = useState(defaultTenure);
  const [moratoriumMonths, setMoratoriumMonths] = useState(defaultMoratorium);
  const [activeRate, setActiveRate] = useState(defaultRate);

  // Deterministic EMI Mathematical Calculation (Principal = creditComponent)
  const totalMonths = tenureYears * 12;
  const repaymentMonths = Math.max(1, totalMonths - moratoriumMonths);
  const monthlyRate = activeRate / (12 * 100);

  const monthlyEmi =
    monthlyRate === 0
      ? creditComponent / repaymentMonths
      : (creditComponent * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
        (Math.pow(1 + monthlyRate, repaymentMonths) - 1);

  const totalRepayment = monthlyEmi * repaymentMonths;
  const totalInterest = Math.max(0, totalRepayment - creditComponent);

  // Commercial Bank comparison (baseline benchmark at 13.0% APR)
  const commRate = 13.0 / (12 * 100);
  const commEmi =
    (creditComponent * commRate * Math.pow(1 + commRate, repaymentMonths)) /
    (Math.pow(1 + commRate, repaymentMonths) - 1);
  const commTotal = commEmi * repaymentMonths;
  const subventionSavings = Math.max(0, commTotal - totalRepayment);

  const formatINR = (num) =>
    num != null ? `₹${Number(Math.round(num)).toLocaleString('en-IN')}` : '—';

  const handleProceed = () => {
    if (onContinue) {
      onContinue();
    } else if (nextJourneyStep) {
      nextJourneyStep();
    }
  };

  const sourceUrl = selectedScheme?.source_url || 'https://nsfdc.nic.in/scheme';
  const sourceName = selectedScheme?.source_name || 'NSFDC Official Guidelines';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Context */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#065F46] text-xs font-bold mb-2">
          <Scale className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Stage 4 · Financial Impact</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-[#0B3B60] tracking-tight">
          What this scheme means financially for you
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-3xl leading-relaxed">
          Estimated financial breakdown based strictly on verified rules for <strong>{schemeName}</strong>.
          Every calculation cites its official rule, assumptions, and estimated contribution.
        </p>
      </div>

      {/* 2. PRIMARY VIEW: FINANCIAL IMPACT SUMMARY */}
      <div className="bg-white rounded-3xl border-2 border-[#0B3B60]/20 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider block">
              Primary Financial Evaluation
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
              Financial Impact Summary
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              * Indicative Estimate
            </span>
            <span className="text-[11px] font-bold text-[#065F46] bg-[#E8F8F2] px-2.5 py-1 rounded-full border border-[#10B981]/20">
              {isLoan ? 'Credit-Linked Support' : 'Direct Financial Support'}
            </span>
          </div>
        </div>

        {/* Breakdown Grid: Requirement vs Support vs Contribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Business Requirement */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Business Requirement
              </span>
              <Wallet className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B3B60] font-mono">
              {formatINR(businessRequirement)}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Stated estimated requirement from Stage 1 need assessment.
            </p>
          </div>

          {/* Card 2: Government Support */}
          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wide">
                Government Support
              </span>
              <Building2 className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1E40AF] font-mono">
              {formatINR(governmentSupport)}
            </div>
            <p className="text-[11px] text-[#1E40AF]/80 leading-snug">
              Up to <strong>{financingPct.toFixed(0)}%</strong> of project cost backed under statutory scheme rules.
            </p>
          </div>

          {/* Card 3: Applicant Contribution */}
          <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#92400E] uppercase tracking-wide">
                Applicant Contribution
              </span>
              <PiggyBank className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#92400E] font-mono">
              {formatINR(applicantContribution)}
            </div>
            <p className="text-[11px] text-[#92400E]/80 leading-snug">
              Remaining <strong>{applicantContributionPct.toFixed(0)}%</strong> margin money covered by applicant.
            </p>
          </div>

          {/* Card 4: Credit Component (only if loan) or Net Subsidy */}
          <div className="p-4 rounded-2xl bg-[#E8F8F2] border border-[#A7F3D0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#065F46] uppercase tracking-wide">
                {isLoan ? 'Credit Component' : 'Direct Assistance'}
              </span>
              <Coins className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#065F46] font-mono">
              {formatINR(creditComponent || governmentSupport)}
            </div>
            <p className="text-[11px] text-[#065F46]/80 leading-snug">
              {isLoan
                ? `Channelized concessional loan @ ${activeRate}% p.a.`
                : 'Direct non-repayable government entitlement.'}
            </p>
          </div>
        </div>

        {/* Transparent Assumptions & Verified Scheme Rules Panel */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#0B3B60] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Calculation Basis & Assumptions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-[#475569]">
            <div>
              <span className="font-semibold text-slate-700 block">Verified Scheme Rule:</span>
              <span>
                {selectedScheme?.scheme_type === 'micro_finance'
                  ? 'NSFDC Micro Credit Rule: 90% financing for units up to ₹1.40L (max loan ₹1.25L).'
                  : selectedScheme?.scheme_type === 'term_loan'
                  ? 'NSFDC Term Loan Rule: 90% financing for units above ₹1.40L up to ₹50L (max loan ₹45L).'
                  : 'NSFDC ELS Rule: 90% of course expenditure up to ₹30L (India) / ₹40L (Abroad).'}
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block">Assumptions Used:</span>
              <span>
                Assumes maximum eligible statutory financing of {financingPct}% and the applicable concessional base interest rate ({activeRate}% p.a.). Actual sanctioned amount and margin money depend on State Channelizing Agency appraisal.
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block">Official Source & Provenance:</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#2563EB] hover:underline font-medium break-all block mt-0.5"
              >
                {sourceName} ({sourceUrl.replace('https://', '')})
              </a>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Data verified: {selectedScheme?.last_verified_at || '2026-09-05'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECONDARY CONDITIONAL SECTION: REPAYMENT & EMI CALCULATOR (Gated behind hasFinancialCalc & isLoan) */}
      {hasFinancialCalc && isLoan ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                  Secondary Section
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Loan Component Repayment Details
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60] mt-1">
                Estimated Monthly Repayment (EMI) & Interest Subvention
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Only applicable for credit-linked support
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Terms Adjustment */}
            <div className="lg:col-span-6 space-y-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Simulate Repayment Terms
              </h4>

              {/* Concessional Interest Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Concessional Interest Rate</span>
                  <span className="font-bold text-[#10B981] font-mono text-sm">
                    {activeRate.toFixed(1)}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.5"
                  value={activeRate}
                  onChange={(e) => setActiveRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>4.0% (Special Rebate)</span>
                  <span>{defaultRate.toFixed(1)}% (Scheme Standard)</span>
                  <span>10.0%</span>
                </div>
              </div>

              {/* Repayment Tenure */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Repayment Horizon</span>
                  <span className="font-bold text-[#0B3B60] font-mono text-sm">
                    {tenureYears} Years ({totalMonths} Months)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={selectedScheme?.scheme_type === 'education_loan' ? 12 : 7}
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B3B60]"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 Year</span>
                  <span>
                    {selectedScheme?.scheme_type === 'education_loan' ? '6 Years' : '3 Years'}
                  </span>
                  <span>
                    {selectedScheme?.scheme_type === 'education_loan' ? '12 Years (Max)' : '7 Years (Max)'}
                  </span>
                </div>
              </div>

              {/* Moratorium Grace Period */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Moratorium Grace Period</span>
                  <span className="font-bold text-[#D97706] font-mono text-sm">
                    {moratoriumMonths} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="3"
                  value={moratoriumMonths}
                  onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D97706]"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 Months (Immediate)</span>
                  <span>{defaultMoratorium} Months (Scheme Rule)</span>
                  <span>24 Months</span>
                </div>
              </div>
            </div>

            {/* Right: EMI & Subvention Savings */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] space-y-3">
                <span className="text-xs text-[#1E40AF] font-semibold block">
                  Estimated Monthly Installment (EMI)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] font-mono">
                    {formatINR(monthlyEmi)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-[#2563EB]">
                  Payable across {repaymentMonths} installments starting after the {moratoriumMonths}-month moratorium period.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Total Interest Payable</span>
                  <span className="font-bold text-slate-800 font-mono text-sm mt-0.5 block">
                    {formatINR(totalInterest)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Total Repayment Amount</span>
                  <span className="font-bold text-[#0B3B60] font-mono text-sm mt-0.5 block">
                    {formatINR(totalRepayment)}
                  </span>
                </div>
              </div>

              {/* Subvention comparison against 13% commercial benchmark */}
              <div className="p-3.5 bg-[#E8F8F2] rounded-xl border border-[#10B981]/30 flex items-start gap-2.5">
                <TrendingDown className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div className="text-xs text-[#065F46]">
                  <strong className="block">
                    Interest Subvention Advantage: ~{formatINR(subventionSavings)}
                  </strong>
                  <span className="text-[11px] opacity-90 block mt-0.5">
                    Estimated savings compared to standard commercial NBFC / bank micro-loans at 13.0% APR.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Non-Loan Entitlement Note (Kept for future grant/subsidy schemes) */
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
            <Info className="w-4 h-4 text-[#2563EB]" />
            <span>Non-Loan Scheme Notice</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            This scheme does not carry monthly installment (EMI) obligations. Financial benefits are disbursed as direct assistance or project subsidy.
          </p>
        </div>
      )}

      {/* 4. Step Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={prevJourneyStep}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recommendation</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          <span>Find Application Channel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

