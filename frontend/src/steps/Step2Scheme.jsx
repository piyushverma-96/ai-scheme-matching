import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  Calculator,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import SchemeCard from '../components/SchemeCard';
import WhyThisScheme from '../components/WhyThisScheme';

const formatINR = (num) =>
  num != null ? `₹${Number(num).toLocaleString('en-IN')}` : '—';

export default function Step2Scheme() {
  const { t } = useTranslation();
  const {
    recommendResult,
    matchedSchemes,
    formData,
    setStep,
    resetAll,
    openSchemeDetail,
    openEmiCalculatorWithScheme,
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'why'

  if (!recommendResult) return null;

  const { eligible, results, best_match: bestMatch, explanation } = recommendResult;
  const matchedSchemesList = (results || []).filter((r) => r.matched || r.eligible || r.partially_eligible);
  const eligibleSchemes = (results || []).filter((r) => r.eligible);
  const partiallyEligibleSchemes = (results || []).filter((r) => r.partially_eligible);
  const candidateList = matchedSchemesList.length > 0 ? matchedSchemesList : (results || []);
  const primaryScheme = bestMatch || candidateList[0];

  // Ineligible / Criteria not satisfied view (only when no eligible OR partially eligible schemes exist)
  if (!eligible && matchedSchemesList.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#B3261E] uppercase tracking-wider">
              Evaluation Result
            </span>
            <StatusBadge status="ineligible" text="Criteria Not Met" size="xs" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0B3B60] font-bold tracking-tight">
            No Matching Scheme for Current Parameters
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568] mt-1">
            Based on the deterministic rules, your input exceeds the family income ceiling or loan limit for these specific schemes.
          </p>
        </div>


        <div className="border-l-4 border-[#B8860B] bg-[#FEF9E7] rounded-r-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#8B6508]">
                Rule Engine Breakdown
              </p>
              <p className="text-xs sm:text-sm text-[#8B6508]/90 mt-1 leading-relaxed">
                {explanation ||
                  'NSFDC schemes are reserved for Scheduled Caste beneficiaries within specific project scale and income limits.'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-[#B8860B]/20 text-xs text-[#8B6508]">
            <strong>Suggestions: </strong>
            <span>
              Try reducing the requested loan amount or check other state-level SC/ST development corporation programs at{' '}
              <a
                href="https://nsfdc.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-[#0B3B60]"
              >
                nsfdc.nic.in
              </a>
              .
            </span>
          </div>
        </div>

        <Button variant="secondary" size="lg" onClick={resetAll} icon={RotateCcw}>
          Modify Parameters & Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${eligibleSchemes.length > 0 ? 'text-[#1A7F4E]' : partiallyEligibleSchemes.length > 0 ? 'text-[#D97706]' : 'text-[#B3261E]'}`}>
              Step 2 · Scheme Recommendations
            </span>
            <StatusBadge
              status={
                eligibleSchemes.length > 0
                  ? 'potentially_eligible'
                  : partiallyEligibleSchemes.length > 0
                  ? 'partially_eligible'
                  : 'ineligible'
              }
              text={
                eligibleSchemes.length > 0
                  ? 'Potentially Eligible'
                  : partiallyEligibleSchemes.length > 0
                  ? 'Partially Eligible'
                  : 'Criteria Not Met'
              }
              size="xs"
            />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0B3B60] font-bold tracking-tight">
            Recommended Government Schemes
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568]">
            We found <strong className="text-[#0B3B60]">{candidateList.length} verified scheme(s)</strong>{' '}
            {eligibleSchemes.length > 0
              ? 'matching your profile criteria.'
              : 'with partial match (pending additional profile details).'}
          </p>

        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EAF1F6] rounded-xl border border-[#CBD5E1] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-base cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0B3B60] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#0B3B60]'
            }`}
          >
            All Recommended Schemes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('why')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-base cursor-pointer ${
              activeTab === 'why'
                ? 'bg-[#0B3B60] text-white shadow-xs'
                : 'text-[#4A5568] hover:text-[#0B3B60]'
            }`}
          >
            Why This Scheme?
          </button>
        </div>
      </div>

      {/* 2. Top Recommended Schemes Grid */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {candidateList.map((match, idx) => (
              <SchemeCard
                key={match.scheme_id || idx}
                matchResult={match}
                isFeatured={idx === 0}
                onViewDetails={() => openSchemeDetail(match)}
                onCalculateEmi={() => openEmiCalculatorWithScheme(match)}
              />
            ))}
          </div>

          {/* Featured Deep Dive: Why Top Matched Scheme */}
          {primaryScheme && (
            <WhyThisScheme
              matchResult={primaryScheme}
              userInputs={formData}
              onCalculateEmi={() => openEmiCalculatorWithScheme(primaryScheme)}
            />
          )}
        </div>
      )}

      {/* 3. Tab B: Full "Why This Scheme?" Explainer View */}
      {activeTab === 'why' && primaryScheme && (
        <WhyThisScheme
          matchResult={primaryScheme}
          userInputs={formData}
          onCalculateEmi={() => openEmiCalculatorWithScheme(primaryScheme)}
        />
      )}

      {/* Next Step Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-xs font-semibold text-[#6B7280] hover:text-[#0B3B60] transition-base cursor-pointer"
        >
          ← Modify Requirements
        </button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            if (primaryScheme) {
              openEmiCalculatorWithScheme(primaryScheme, false);
            }
            setStep(3);
          }}
          icon={ArrowRight}
        >
          Proceed to EMI Calculator →
        </Button>
      </div>
    </div>
  );
}
