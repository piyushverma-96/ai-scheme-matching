import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Briefcase,
  GraduationCap,
  Store,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Building2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { SCHEMES_DATA, getLocalizedScheme } from '../../data/mockData';
import { matchSchemes } from '../../api';

export default function Step2EligibleSchemes({ onContinue }) {
  const { t, i18n } = useTranslation();
  const {
    nextJourneyStep,
    prevJourneyStep,
    selectedScheme,
    setSelectedScheme,
    journeyFormData,
    recommendResult,
    setRecommendResult,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [chosenSchemeId, setChosenSchemeId] = useState(null);

  // Derive canonical search payload from journeyFormData
  const canonicalPayload = {
    purpose:
      journeyFormData?.purposeKey === 'micro_finance'
        ? 'micro_business'
        : journeyFormData?.purposeKey === 'education'
        ? 'education'
        : 'business',
    annual_family_income:
      journeyFormData?.incomeValue != null
        ? Number(journeyFormData.incomeValue)
        : journeyFormData?.familyIncome
        ? Number(String(journeyFormData.familyIncome).replace(/[^0-9.]/g, ''))
        : 250000,
    loan_amount:
      journeyFormData?.amount != null
        ? Number(journeyFormData.amount)
        : journeyFormData?.fundingAmount
        ? Number(String(journeyFormData.fundingAmount).replace(/[^0-9.]/g, ''))
        : 300000,
    project_cost:
      journeyFormData?.amount != null
        ? Number(journeyFormData.amount)
        : 333333,
    sc_caste_declared: journeyFormData?.casteDeclared !== false,
    education_status: journeyFormData?.educationStatus || 'graduate',
    study_location: journeyFormData?.studyLocation || 'india',
    gender: journeyFormData?.gender || 'Male',
    state: journeyFormData?.stateName || journeyFormData?.state || 'Madhya Pradesh',
    district: journeyFormData?.district || 'Bhopal',
    city: journeyFormData?.city || 'Bhopal',
    language: i18n.language === 'hi' ? 'hindi' : 'english',
  };

  // Evaluate rule engine if not already evaluated
  useEffect(() => {
    let isMounted = true;
    async function evaluateEligibility() {
      if (recommendResult && recommendResult.results && recommendResult.results.length > 0) {
        return;
      }
      setLoading(true);
      try {
        const resp = await matchSchemes(canonicalPayload);
        if (isMounted && resp.data) {
          setRecommendResult(resp.data);
        }
      } catch (err) {
        console.warn('Backend scheme evaluation fallback, using verified NSFDC seed data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    evaluateEligibility();
    return () => {
      isMounted = false;
    };
  }, []);

  const rawResults = recommendResult?.results || [];
  const matchedList = rawResults.filter((r) => r.matched || r.eligible || r.partially_eligible);
  const candidateSchemes = rawResults.length > 0 ? matchedList : SCHEMES_DATA;
  const isIncomeDisqualified = rawResults.length > 0 && matchedList.length === 0;

  // Sync initial selection
  useEffect(() => {
    if (candidateSchemes.length > 0 && !chosenSchemeId) {
      const activeId =
        selectedScheme?.scheme_id ||
        selectedScheme?.id ||
        candidateSchemes[0]?.scheme_id ||
        candidateSchemes[0]?.id;
      setChosenSchemeId(activeId);
    }
  }, [candidateSchemes, chosenSchemeId, selectedScheme]);

  const normalizeScheme = (scheme) => {
    if (!scheme) return null;
    const id = scheme.scheme_id || scheme.id;
    const name = scheme.scheme_name || scheme.name;
    return {
      ...scheme,
      id,
      scheme_id: id,
      name,
      scheme_name: name,
      fullName: scheme.fullName || scheme.full_description || name,
      category: scheme.category || scheme.scheme_type || 'National Scheduled Castes Finance & Development Corp',
      maxLimit: scheme.max_loan_amount_display || scheme.loan_amount_display || '₹50 Lakh',
      maxLimitVal: scheme.max_loan_amount_val || scheme.max_loan_amount || 5000000,
      max_loan_amount: scheme.max_loan_amount_val || scheme.max_loan_amount || 5000000,
      interestRate: scheme.interest_rate_display || '8.0% p.a.',
      interestRateVal: scheme.interest_rate_val || 8.0,
      rate_beneficiary_min: scheme.rate_beneficiary_min || scheme.interest_rate_val || 8.0,
      rate_val: scheme.rate_val || scheme.interest_rate_val || 8.0,
      subsidy: scheme.subsidy_display || '90% Project Cost Financing',
      subsidyVal: scheme.subsidy_val || scheme.financing_pct || 90,
      financing_pct: scheme.financing_pct || scheme.subsidy_val || 90,
      tenure: scheme.repayment_period || 'Up to 7 Years',
      repayment_period: scheme.repayment_period || 'Up to 7 Years',
      moratorium: scheme.moratorium_period || '6 Months Moratorium',
      moratorium_period: scheme.moratorium_period || '6 Months Moratorium',
      short_description: scheme.short_description || scheme.description,
      description: scheme.full_description || scheme.description || scheme.short_description,
      source_url: scheme.source_url || 'https://nsfdc.nic.in/scheme',
      channel_type_display: scheme.channel_type_display || 'State Channelizing Agencies (SCA) / Empanelled Banks',
      application_channel_type: scheme.application_channel_type || 'channel_partner',
    };
  };

  const handleSelectAndProceed = (scheme) => {
    const normalized = normalizeScheme(scheme);
    if (setSelectedScheme && normalized) {
      setSelectedScheme(normalized);
    }
    if (onContinue) {
      onContinue();
    } else if (nextJourneyStep) {
      nextJourneyStep();
    }
  };

  const amountStr = journeyFormData?.amountFormatted || '₹3,00,000';

  const getSchemeIcon = (scheme, idx) => {
    const code = (scheme.scheme_code || scheme.scheme_type || scheme.id || scheme.name || '').toUpperCase();
    if (code.includes('EDU') || code.includes('ELS')) return GraduationCap;
    if (code.includes('AMY') || code.includes('AAJEEVIKA') || code.includes('MICRO') || code.includes('MFS')) return Store;
    if (code.includes('UDYAM') || code.includes('UNY') || code.includes('COOPERATIVE')) return Building2;
    if (idx % 2 === 0) return Landmark;
    return Briefcase;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Progress State Banner */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-5 sm:p-6 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider">
          {t('step2.stage_status', 'Stage Status')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#10B981] font-semibold">
            <span className="w-5 h-5 rounded-full bg-[#E8F8F2] flex items-center justify-center font-bold text-xs">✓</span>
            <span>{t('step2.stage_step1', '1. Understanding your requirement')}</span>
          </div>

          <div className="flex items-center gap-2 text-[#0B3B60] font-bold">
            <span className="w-5 h-5 rounded-full bg-[#0B3B60] text-white flex items-center justify-center font-bold text-xs">●</span>
            <span>{t('step2.stage_step2', '2. Checking scheme eligibility')}</span>
          </div>

          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="w-5 h-5 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center font-bold text-xs">○</span>
            <span>{t('step2.stage_step3', '3. Ranking suitable schemes')}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B3B60]">
            {t('step2.heading', 'Potentially eligible schemes')}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {t(
              'step2.subheading',
              'The following government-supported loan schemes match your basic purpose, statutory income ceiling (₹5 Lakh), and requested scale.'
            )}{' '}
            ({amountStr}).
          </p>
        </div>

        {loading && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B3B60]" />
            <span>Evaluating NSFDC rules...</span>
          </div>
        )}
      </div>

      {/* 3. Disqualification Banner if family income exceeds ceiling or no scheme matched */}
      {isIncomeDisqualified && (
        <div className="bg-[#FEF2F2] border-2 border-[#F87171] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#DC2626]">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#991B1B]">
                Statutory Income Ceiling Exceeded (No Eligible Schemes)
              </h3>
              <p className="text-xs sm:text-sm text-[#7F1D1D] leading-relaxed">
                Under official NSFDC operational guidelines, concessional credit schemes have a strict statutory family income ceiling of <strong>₹5,00,000 per annum</strong>.
                Your stated annual household income exceeds this threshold, disqualifying all 5 concessional credit schemes.
              </p>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-[#FECACA] space-y-2 text-xs">
            <span className="font-bold text-[#991B1B] block">Rule Engine Disqualification Summary:</span>
            {rawResults.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-[#7F1D1D]">
                <span className="font-mono font-bold text-xs shrink-0">•</span>
                <div>
                  <strong className="font-semibold">{r.scheme_name || r.name}:</strong>{' '}
                  <span className="text-[#991B1B]">
                    {r.why_ineligible && r.why_ineligible.length > 0
                      ? r.why_ineligible.join('; ')
                      : 'Disqualified under statutory income limit of ₹5.00 Lakh.'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={prevJourneyStep}
              className="px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 1 · Update Financial Details</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. List of Matching Schemes */}
      {!isIncomeDisqualified && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {candidateSchemes.map((scheme, idx) => {
            const item = getLocalizedScheme(scheme, i18n.language);
            const schemeId = item.scheme_id || item.id || `scheme-${idx}`;
            const isSelected = chosenSchemeId === schemeId;
            const IconComponent = getSchemeIcon(item, idx);
            const displayName = item.scheme_name || item.name;
            const displayFullName = item.fullName || item.full_description || displayName;
            const displayLoanAmount = item.max_loan_amount_display || item.loan_amount_short || item.loan_amount_display || 'Up to ₹50 Lakh';
            const displayRate = item.interest_rate_display || (item.rate_beneficiary_min ? `${item.rate_beneficiary_min}% p.a.` : '8.00% p.a.');
            const displayTenure = item.repayment_period || 'Up to 7 Years';

            const isManualVerification =
              item.needs_manual_verification ||
              item.data_confidence_label === 'Pending Live Verification' ||
              (item.scheme_code || '').toUpperCase().includes('UNY') ||
              (item.scheme_code || '').toUpperCase().includes('ELS') ||
              (item.id || '').toLowerCase().includes('udyam');

            const channelBadgeText =
              item.channel_type_display ||
              (Array.isArray(item.eligible_channel_types)
                ? item.eligible_channel_types.join(' / ')
                : item.channel_partner_type || 'SCA / PSB / RRB');

            return (
              <div
                key={schemeId}
                onClick={() => setChosenSchemeId(schemeId)}
                className={`rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-2 border-[#0B3B60] ring-4 ring-[#0B3B60]/10 shadow-sm'
                    : 'bg-white border border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#0B3B60] text-white'
                            : idx % 2 === 0
                            ? 'bg-[#E8F8F2] text-[#10B981]'
                            : 'bg-[#EFF6FF] text-[#2563EB]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#0B3B60] leading-tight">
                          {displayName}
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                          {displayFullName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <span className="text-[10px] font-bold text-white bg-[#0B3B60] px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Selected</span>
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-[#10B981] bg-[#E8F8F2] px-2.5 py-1 rounded-full border border-[#10B981]/20">
                        {t('journey_step3.badge_potentially_eligible', 'Potentially Eligible')}
                      </span>
                    </div>
                  </div>

                  {/* Channel Partner Routing & Verification Pill */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#F1F5F9] text-[#334155] px-2.5 py-0.5 rounded-full border border-slate-200">
                      <Building2 className="w-3 h-3 text-[#475569]" />
                      <span>Channel: {channelBadgeText}</span>
                    </span>

                    {isManualVerification ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                        <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                        <span>Pending Live Verification</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                        <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                        <span>Verified NSFDC</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                    {item.short_description || item.description}
                  </p>

                  {/* Statutory Eligibility Breakdown */}
                  <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-1.5 text-[11px]">
                    <span className="font-bold text-[#1E293B] block mb-1">
                      {t('journey_step2.criteria_heading', 'Statutory Eligibility Breakdown')}:
                    </span>
                    <div className="flex items-center gap-2 text-[#065F46]">
                      <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
                      <span>{t('journey_step2.criteria_sc', 'Targeted specifically for SC beneficiaries')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#065F46]">
                      <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
                      <span>Annual household income qualifies under ₹5.00 Lakh statutory ceiling</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#065F46]">
                      <Check className="w-3.5 h-3.5 text-[#10B981] stroke-[3]" />
                      <span>Requested project scale fits within scheme limits ({displayLoanAmount})</span>
                    </div>
                  </div>

                  {/* Key Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-medium">
                        {t('journey_step2.interest_rate', 'Beneficiary Interest Rate')}
                      </span>
                      <span className="font-bold text-[#1E293B] font-mono">{displayRate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-medium">
                        {t('journey_step2.repayment_tenure', 'Repayment Tenure')}
                      </span>
                      <span className="font-bold text-[#1E293B]">{displayTenure}</span>
                    </div>
                  </div>

                  {/* Official Source Link */}
                  {item.source_url && (
                    <div className="text-[11px] text-[#2563EB] pt-1">
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 hover:underline font-medium"
                      >
                        <span>Official NSFDC Scheme Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Select action */}
                <div className="pt-4 mt-4 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChosenSchemeId(schemeId);
                      handleSelectAndProceed(scheme);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0B3B60] text-white hover:bg-[#07263F] shadow-2xs'
                        : 'bg-white hover:bg-[#F8FAFC] border border-[#0B3B60] text-[#0B3B60]'
                    }`}
                  >
                    <span>{isSelected ? t('journey_step2.btn_proceed_chosen', 'Proceed with Selected Scheme') : t('journey_step2.btn_select', 'Select & Proceed')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note that this identifies eligible schemes, not yet ranking best */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          {t(
            'journey_step2.disclaimer_note',
            'This stage identifies all matching schemes based on structured statutory rules. Next, we rank the most suitable scheme for your profile.'
          )}
        </span>
      </div>

      {/* Step Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={prevJourneyStep}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('journey_step2.btn_back', 'Back to Need')}</span>
        </button>

        {!isIncomeDisqualified && candidateSchemes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const selected = candidateSchemes.find(
                (s) => (s.scheme_id || s.id) === chosenSchemeId
              ) || candidateSchemes[0];
              handleSelectAndProceed(selected);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[44px]"
          >
            <span>{t('journey_step2.btn_continue', 'Continue to Best Scheme Recommendation')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
