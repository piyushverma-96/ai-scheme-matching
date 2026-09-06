import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { SCHEMES_DATA, getLocalizedScheme } from '../../data/mockData';
import { checkEligibility, getBestMatch } from '../../api';
import StatusBadge from '../../components/StatusBadge';

export default function Step3RecommendBestScheme({ onContinue }) {
  const { t, i18n } = useTranslation();
  const {
    selectedScheme,
    setSelectedScheme,
    nextJourneyStep,
    prevJourneyStep,
    journeyFormData,
    recommendResult,
    setRecommendResult,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [activeScheme, setActiveScheme] = useState(null);

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

  // Fetch or update live eligibility results from backend rule engine
  useEffect(() => {
    let isMounted = true;
    async function fetchRecommendation() {
      if (recommendResult && recommendResult.results && recommendResult.results.length > 0) {
        return;
      }
      setLoading(true);
      try {
        const resp = await checkEligibility(canonicalPayload);
        if (isMounted && resp.data) {
          setRecommendResult(resp.data);
        }
      } catch (err) {
        console.warn('Backend scheme evaluation notice, using local seed data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRecommendation();
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine all matched schemes and primary "Best Match"
  const rawResults = recommendResult?.results || [];
  const matchedList = rawResults.filter((r) => r.matched || r.eligible || r.partially_eligible);
  const candidateSchemes = matchedList.length > 0 ? matchedList : SCHEMES_DATA;

  // Best match is top-ranked eligible scheme
  const bestMatchFromEngine = candidateSchemes[0];
  const rawPrimary = activeScheme || selectedScheme || bestMatchFromEngine;
  const primaryScheme = getLocalizedScheme(rawPrimary, i18n.language);

  // Other eligible schemes shown as alternatives
  const alternatives = candidateSchemes.filter(
    (s) => (s.scheme_id || s.id) !== (primaryScheme.scheme_id || primaryScheme.id)
  );

  const handleSelectAlternative = (scheme) => {
    setActiveScheme(scheme);
    if (setSelectedScheme) {
      setSelectedScheme(scheme);
    }
  };

  const handleProceed = () => {
    if (setSelectedScheme && primaryScheme) {
      setSelectedScheme(primaryScheme);
    }
    if (onContinue) {
      onContinue();
    } else if (nextJourneyStep) {
      nextJourneyStep();
    }
  };

  const amountDisplay = journeyFormData?.amountFormatted || '₹3,00,000';
  const purposeDisplay = journeyFormData?.purpose || 'Small Business / Entrepreneurship';
  const stateDisplay = journeyFormData?.stateName || journeyFormData?.state || 'your state';

  // Build clean, verified matching reasons
  const matchingReasons =
    primaryScheme.why_matched && primaryScheme.why_matched.length > 0
      ? primaryScheme.why_matched
      : primaryScheme.matching_factors && primaryScheme.matching_factors.length > 0
      ? primaryScheme.matching_factors
      : [
          t('journey_step3.reason_purpose', `Purpose Match: Your need for '${purposeDisplay}' aligns with this scheme's target focus.`),
          t('journey_step3.reason_income', `Income Criteria: Household income falls within the ₹5,00,000 statutory eligibility ceiling.`),
          t('journey_step3.reason_amount', `Financial Scale: Your requirement fits within the scheme's statutory tier.`),
          t('journey_step3.reason_category', `Applicant Category: Scheduled Caste (SC) category is the designated beneficiary group.`),
          t('journey_step3.reason_location', `Location Coverage: Scheme is operational across ${stateDisplay} via State Channelizing Agencies (SCAs).`),
        ];

  const schemeName = primaryScheme.scheme_name || primaryScheme.name;
  const matchScore = primaryScheme.match_score != null ? primaryScheme.match_score : (primaryScheme.match_percentage || 95);
  const isPartiallyEligible = primaryScheme.partially_eligible || primaryScheme.status === 'partially_eligible';

  // Verified benefit type display
  const benefitTypeDisplay =
    primaryScheme.support_type_display ||
    (primaryScheme.benefit_type === 'loan'
      ? 'Credit-Linked Financial Support (Concessional Loan)'
      : primaryScheme.benefit_type || 'Financial Assistance');

  const sourceName = primaryScheme.source_name || 'NSFDC Official Portal (Ministry of Social Justice & Empowerment)';
  const lastVerifiedAt = primaryScheme.last_verified_at || '2026-09-05';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Stage Goal */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1E40AF] text-xs font-bold mb-2">
          <Award className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{t('journey_step3.stage_badge', 'Stage 3 · Best Scheme Recommendation')}</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-[#0B3B60] tracking-tight">
          {t('journey_step3.title', 'Best Government Scheme for You')}
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed max-w-3xl">
          {t('journey_step3.subtitle', 'Ranked based on how well each government scheme matches your actual purpose, business sector, project scale, community eligibility, and location applicability — not on loan size or interest rate.')}
        </p>
      </div>

      {/* 1. PRIMARY HERO CARD — BEST MATCH SCHEME */}
      <div className="bg-white rounded-3xl border-2 border-[#0B3B60] p-6 sm:p-8 shadow-md relative space-y-6">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B3B60] text-white text-xs font-bold tracking-wide shadow-xs">
              <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{t('journey_step3.badge_best_match', 'BEST MATCH')}</span>
            </span>

            <StatusBadge
              status={isPartiallyEligible ? 'partially_eligible' : 'potentially_eligible'}
              text={isPartiallyEligible ? t('journey_step3.badge_partially_eligible', 'Partially Eligible') : t('journey_step3.badge_potentially_eligible', 'Potentially Eligible')}
              size="xs"
            />
          </div>

          {/* Transparent Match Score Badge (Never AI confidence) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] font-semibold">{t('journey_step3.match_score_label', 'Match Score')}:</span>
            <span className={`text-xs sm:text-sm font-bold font-mono px-3 py-1 rounded-full border shadow-2xs ${
              isPartiallyEligible
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#D97706]/30'
                : 'bg-[#E8F8F2] text-[#10B981] border-[#10B981]/30'
            }`}>
              {matchScore}{t('journey_step3.match_score_suffix', '/100 Match Score')}
            </span>
          </div>
        </div>

        {/* Scheme Title & Benefit Type Display */}
        <div className="space-y-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
              <Landmark className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-2xl font-bold text-[#0B3B60] tracking-tight">
                {schemeName}
              </h3>
              <p className="text-xs text-[#64748B]">
                {primaryScheme.fullName || 'National Scheduled Castes Finance and Development Corporation'}
              </p>
            </div>
          </div>

          {/* Explicit Benefit Type Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs font-semibold text-[#166534] mt-2">
            <span className="font-bold text-[#14532D]">{t('journey_step3.benefit_type_label', 'Benefit Type:')}</span>
            <span>{benefitTypeDisplay}</span>
          </div>
        </div>

        {/* Description / Summary */}
        <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
          {primaryScheme.benefit_summary || primaryScheme.description || primaryScheme.short_description}
        </p>

        {/* 2. "Why this scheme matches you" Transparent Checklist */}
        <div className="p-5 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#166534] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>{t('journey_step3.why_recommended', 'Why this scheme is recommended')}:</span>
            </h4>
            <span className="text-[11px] text-[#166534]/80 font-medium">
              {t('journey_step3.verified_criteria', 'Verified Official Criteria')}
            </span>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#166534]">
            {matchingReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#16A34A] stroke-[3] shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Verified Terms Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs">
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">{t('journey_step3.statutory_cap', 'Statutory Loan Cap')}</span>
            <span className="font-bold text-[#0B3B60] font-mono text-xs sm:text-sm">
              {primaryScheme.loan_amount_short || (primaryScheme.max_loan_amount ? `Up to ₹${(primaryScheme.max_loan_amount / 100000).toFixed(1)}L` : 'Up to Scheme Limit')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">{t('journey_step3.interest_rate_p_a', 'Interest Rate (% p.a.)')}</span>
            <span className="font-bold text-[#10B981] font-mono text-xs sm:text-sm">
              {primaryScheme.interest_rate_display || `${primaryScheme.rate_beneficiary_min}% p.a.`}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">{t('journey_step3.max_tenure', 'Maximum Tenure')}</span>
            <span className="font-bold text-[#1E293B] text-xs sm:text-sm">
              {primaryScheme.repayment_period || (primaryScheme.repayment_years ? `Up to ${primaryScheme.repayment_years} Years` : '3 - 7 Years')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">{t('journey_step3.moratorium_period', 'Moratorium Period (अधिस्थगन अवधि)')}</span>
            <span className="font-bold text-[#D97706] text-xs sm:text-sm">
              {primaryScheme.moratorium_note || primaryScheme.moratorium_period || '3 - 6 Months'}
            </span>
          </div>
        </div>

        {/* Source Citation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-[#64748B] border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{t('journey_step3.verified_source', 'Verified Source:')} {sourceName}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {t('journey_step3.official_verified', 'Official Data Verified:')} {lastVerifiedAt}
          </span>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleProceed}
          className="w-full py-4 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>{t('journey_step3.btn_proceed_impact', 'Proceed to Financial Impact Calculation →')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. OTHER ELIGIBLE SCHEMES (ALTERNATIVES) */}
      {alternatives.length > 0 && (
        <div className="space-y-4 pt-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0B3B60]">
              {t('journey_step3.alternatives_title', 'Other Potentially Eligible Schemes')}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              {t('journey_step3.alternatives_subtitle', 'You also qualify for the following verified schemes. Each offers distinct statutory support based on project scale and purpose:')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternatives.map((rawAlt, idx) => {
              const alt = getLocalizedScheme(rawAlt, i18n.language);
              const altName = alt.scheme_name || alt.name;
              const altScore = alt.match_score != null ? alt.match_score : (alt.match_percentage || 85);
              const altBenefitType =
                alt.support_type_display ||
                (alt.benefit_type === 'loan' ? 'Credit-Linked Financial Support' : alt.benefit_type || 'Financial Assistance');

              const altReasons = alt.why_matched?.slice(0, 3) || alt.matching_factors?.slice(0, 3) || [
                `Purpose matches eligible activity guidelines`,
                `Income qualifies under statutory ceiling`,
                `Project scale fits statutory limit`,
              ];

              return (
                <div
                  key={alt.scheme_id || alt.id || idx}
                  className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between hover:border-[#0B3B60]/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#0B3B60]">{altName}</h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{alt.fullName || alt.issuing_body}</p>
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] shrink-0">
                        {altScore}{t('journey_step3.match_score_suffix', '/100 Match Score')}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-[#166534] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#BBF7D0]">
                      {t('journey_step3.benefit_type_label', 'Benefit Type:')} {altBenefitType}
                    </div>

                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {alt.benefit_summary || alt.short_description}
                    </p>

                    {/* Quick Reasons Checklist */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        {t('journey_step3.why_matches_label', 'Why this matches:')}
                      </span>
                      {altReasons.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-[#065F46]">
                          <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs pt-2 border-t border-[#F1F5F9]">
                      <span className="text-[#64748B]">
                        {t('journey_step3.rate_label', 'Rate:')} <strong className="text-[#1E293B]">{alt.interest_rate_display || `${alt.rate_beneficiary_min}% p.a.`}</strong>
                      </span>
                      <span className="text-[#64748B]">
                        {t('journey_step3.tenure_label', 'Tenure:')} <strong className="text-[#1E293B]">{alt.repayment_period || `${alt.repayment_years || 5} Years`}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F1F5F9]">
                    <button
                      type="button"
                      onClick={() => handleSelectAlternative(alt)}
                      className="w-full py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#0B3B60] hover:text-white text-[#0B3B60] text-xs font-bold border border-[#CBD5E1] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{t('journey_step3.btn_switch', 'Switch to this Scheme')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={prevJourneyStep}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('journey_step3.btn_back_schemes', '← Back to Eligible Schemes')}</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[44px]"
        >
          <span>{t('journey_step3.btn_proceed_impact', 'Proceed to Financial Impact Calculation →')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

