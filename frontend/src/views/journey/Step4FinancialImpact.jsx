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
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { getLocalizedScheme } from '../../data/mockData';

export default function Step4FinancialImpact({ onContinue }) {
  const { t, i18n } = useTranslation();
  const {
    selectedScheme,
    nextJourneyStep,
    prevJourneyStep,
    journeyFormData,
  } = useApp();

  // Localized scheme metadata
  const locScheme = getLocalizedScheme(selectedScheme, i18n.language);
  const schemeName = locScheme?.scheme_name || locScheme?.name || 'NSFDC Scheme';
  const benefitType = locScheme?.benefit_type || 'loan';
  const hasFinancialCalc = locScheme?.has_financial_calculation !== false;
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
          <span>{t('journey_step4.stage_badge', 'Stage 4 · Financial Impact & Repayment Assessment')}</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-[#0B3B60] tracking-tight">
          {t('journey_step4.title', 'Financial Assistance Breakdown & Monthly EMI Calculation')}
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-3xl leading-relaxed">
          {t('journey_step4.subtitle', 'Understand exact government funding, your contribution requirement, and projected monthly repayments.')}
        </p>
      </div>

      {/* 2. PRIMARY VIEW: FINANCIAL IMPACT SUMMARY */}
      <div className="bg-white rounded-3xl border-2 border-[#0B3B60]/20 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider block">
              {t('journey_step4.eval_badge', 'Primary Financial Evaluation')}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
              {t('journey_step4.impact_summary_title', 'Financial Impact Summary')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {t('journey_step4.indicative_badge', '* Indicative Estimate')}
            </span>
            <span className="text-[11px] font-bold text-[#065F46] bg-[#E8F8F2] px-2.5 py-1 rounded-full border border-[#10B981]/20">
              {isLoan ? t('journey_step4.credit_linked_support', 'Credit-Linked Support') : t('journey_step4.direct_support', 'Direct Financial Support')}
            </span>
          </div>
        </div>

        {/* Breakdown Grid: Requirement vs Support vs Contribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Business Requirement */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {t('journey_step4.pillar1_title', '1. Total Project Cost / Requirement')}
              </span>
              <Wallet className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B3B60] font-mono">
              {formatINR(businessRequirement)}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {t('journey_step4.pillar1_desc', 'Total capital required as submitted in your need assessment.')}
            </p>
          </div>

          {/* Card 2: Government Support */}
          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wide">
                {t('journey_step4.pillar2_title', '2. Government Financial Assistance (Up to 90%)')}
              </span>
              <Building2 className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1E40AF] font-mono">
              {formatINR(governmentSupport)}
            </div>
            <p className="text-[11px] text-[#1E40AF]/80 leading-snug">
              {t('journey_step4.pillar2_desc', 'Financed by apex corporation (NSFDC) at concessional terms.')}
            </p>
          </div>

          {/* Card 3: Applicant Contribution */}
          <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#92400E] uppercase tracking-wide">
                {t('journey_step4.pillar3_title', '3. Beneficiary Promoter Contribution')}
              </span>
              <PiggyBank className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#92400E] font-mono">
              {formatINR(applicantContribution)}
            </div>
            <p className="text-[11px] text-[#92400E]/80 leading-snug">
              {t('journey_step4.pillar3_desc', 'Margin money contributed by the entrepreneur (minimum 10%).')}
            </p>
          </div>

          {/* Card 4: Credit Component (only if loan) or Net Subsidy */}
          <div className="p-4 rounded-2xl bg-[#E8F8F2] border border-[#A7F3D0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#065F46] uppercase tracking-wide">
                {t('journey_step4.pillar4_title', '4. Credit-Linked Loan Principal')}
              </span>
              <Coins className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#065F46] font-mono">
              {formatINR(creditComponent || governmentSupport)}
            </div>
            <p className="text-[11px] text-[#065F46]/80 leading-snug">
              {t('journey_step4.pillar4_desc', 'Net loan amount disbursed through authorized partner channel.')}
            </p>
          </div>
        </div>

        {/* Transparent Assumptions & Verified Scheme Rules Panel */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#0B3B60] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>{t('journey_step4.assumptions_title', 'Calculation Basis & Assumptions')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-[#475569]">
            <div>
              <span className="font-semibold text-slate-700 block">{t('journey_step4.rule_label', 'Verified Scheme Rule:')}</span>
              <span>
                {selectedScheme?.scheme_type === 'micro_finance'
                  ? t('journey_step4.rule_micro', 'NSFDC Micro Credit Rule: 90% financing for units up to ₹1.40L (max loan ₹1.25L).')
                  : selectedScheme?.scheme_type === 'term_loan'
                  ? t('journey_step4.rule_term', 'NSFDC Term Loan Rule: 90% financing for units above ₹1.40L up to ₹50L (max loan ₹45L).')
                  : t('journey_step4.rule_els', 'NSFDC ELS Rule: 90% of course expenditure up to ₹30L (India) / ₹40L (Abroad).')}
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block">{t('journey_step4.assumptions_label', 'Assumptions Used:')}</span>
              <span>
                {t('journey_step4.assumptions_desc', { pct: financingPct, rate: activeRate, defaultValue: `Assumes maximum eligible statutory financing of ${financingPct}% and the applicable concessional base interest rate (${activeRate}% p.a.). Actual sanctioned amount and margin money depend on State Channelizing Agency appraisal.` })}
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block">{t('journey_step4.official_source_label', 'Official Source & Provenance:')}</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#2563EB] hover:underline font-medium break-all block mt-0.5"
              >
                {sourceName} ({sourceUrl.replace('https://', '')})
              </a>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {t('journey_step4.data_verified_label', 'Data verified:')} {selectedScheme?.last_verified_at || '2026-09-05'}
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
                  {t('journey_step4.secondary_badge', 'Secondary Section')}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {t('journey_step4.repayment_details_label', 'Loan Component Repayment Details')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60] mt-1">
                {t('journey_step4.calculator_title', 'Interactive Repayment & EMI Simulator')}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {t('journey_step4.only_credit_note', 'Only applicable for credit-linked support')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Terms Adjustment */}
            <div className="lg:col-span-6 space-y-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('journey_step4.simulate_terms_heading', 'Simulate Repayment Terms')}
              </h4>

              {/* Concessional Interest Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{t('journey_step4.rate_slider_label', 'Concessional Interest Rate (% p.a.)')}</span>
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
                  <span>4.0% ({t('journey_step4.special_rebate', 'Special Rebate')})</span>
                  <span>{defaultRate.toFixed(1)}% ({t('journey_step4.scheme_standard', 'Scheme Standard')})</span>
                  <span>10.0%</span>
                </div>
              </div>

              {/* Repayment Tenure */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{t('journey_step4.tenure_slider_label', 'Repayment Tenure (Years)')}</span>
                  <span className="font-bold text-[#0B3B60] font-mono text-sm">
                    {tenureYears} {t('journey_step4.years', 'Years')} ({totalMonths} {t('journey_step4.months', 'Months')})
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
                  <span>1 {t('journey_step4.year', 'Year')}</span>
                  <span>
                    {selectedScheme?.scheme_type === 'education_loan' ? `6 ${t('journey_step4.years', 'Years')}` : `3 ${t('journey_step4.years', 'Years')}`}
                  </span>
                  <span>
                    {selectedScheme?.scheme_type === 'education_loan' ? `12 ${t('journey_step4.years_max', 'Years (Max)')}` : `7 ${t('journey_step4.years_max', 'Years (Max)')}`}
                  </span>
                </div>
              </div>

              {/* Moratorium Grace Period */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{t('journey_step4.moratorium_slider_label', 'Moratorium Period (Months) (अधिस्थगन अवधि)')}</span>
                  <span className="font-bold text-[#D97706] font-mono text-sm">
                    {moratoriumMonths} {t('journey_step4.months', 'Months')}
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
                  <span>0 {t('journey_step4.months_immediate', 'Months (Immediate)')}</span>
                  <span>{defaultMoratorium} {t('journey_step4.months_rule', 'Months (Scheme Rule)')}</span>
                  <span>24 {t('journey_step4.months', 'Months')}</span>
                </div>
              </div>
            </div>

            {/* Right: EMI & Subvention Savings */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] space-y-3">
                <span className="text-xs text-[#1E40AF] font-semibold block">
                  {t('journey_step4.emi_output_label', 'Estimated Monthly Repayment (EMI)')}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] font-mono">
                    {formatINR(monthlyEmi)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/{t('journey_step4.per_month', 'month')}</span>
                </div>
                <p className="text-[11px] text-[#2563EB]">
                  {t('journey_step4.installments_note', { repaymentMonths, moratoriumMonths, defaultValue: `Payable across ${repaymentMonths} installments starting after the ${moratoriumMonths}-month moratorium period.` })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">{t('journey_step4.interest_output_label', 'Total Interest Payable')}</span>
                  <span className="font-bold text-slate-800 font-mono text-sm mt-0.5 block">
                    {formatINR(totalInterest)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">{t('journey_step4.repayment_output_label', 'Total Repayment (Principal + Interest)')}</span>
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
                    {t('journey_step4.subvention_savings_label', 'Total Interest Savings through NSFDC Subvention')}: ~{formatINR(subventionSavings)}
                  </strong>
                  <span className="text-[11px] opacity-90 block mt-0.5">
                    {t('journey_step4.subvention_savings_desc', 'By accessing government concessional funding, you save significantly compared to open market commercial credit.')}
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
            <span>{t('journey_step4.non_loan_notice', 'Non-Loan Scheme Notice')}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('journey_step4.non_loan_desc', 'This scheme does not carry monthly installment (EMI) obligations. Financial benefits are disbursed as direct assistance or project subsidy.')}
          </p>
        </div>
      )}

      {/* 4. Step Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={prevJourneyStep}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('journey_step4.btn_back_recommendation', '← Back to Best Match Scheme')}</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[44px]"
        >
          <span>{t('journey_step4.btn_proceed_partner', 'Proceed to Find Application Channel →')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

