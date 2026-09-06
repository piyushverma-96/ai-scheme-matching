import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Percent,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Building2,
  Check,
  AlertCircle
} from 'lucide-react';
import { checkEligibility, getSchemes } from '../api';

export default function EligibilityTesterView() {
  const [formData, setFormData] = useState({
    purpose: 'entrepreneurship',
    annual_family_income: 300000,
    loan_amount: 300000,
    project_cost: 333333,
    sc_caste_declared: true,
    education_status: 'not_applicable',
    study_location: 'india',
    gender: 'female',
  });

  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'loan_amount') {
        const amt = parseFloat(value) || 0;
        updated.project_cost = Math.round(amt / 0.9);
      } else if (field === 'project_cost') {
        const cost = parseFloat(value) || 0;
        updated.loan_amount = Math.round(cost * 0.9);
      }
      return updated;
    });
  };

  const runEligibilityCheck = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        purpose: formData.purpose,
        annual_family_income: parseFloat(formData.annual_family_income) || 0,
        loan_amount: parseFloat(formData.loan_amount) || undefined,
        project_cost: parseFloat(formData.project_cost) || undefined,
        sc_caste_declared: Boolean(formData.sc_caste_declared),
        education_status: formData.education_status,
        study_location: formData.purpose === 'education' ? formData.study_location : undefined,
        gender: formData.gender,
      };
      const response = await checkEligibility(payload);
      setResultsData(response.data);
    } catch (err) {
      console.error('Eligibility check error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to evaluate eligibility');
    } finally {
      setLoading(false);
    }
  };

  // Run initial test evaluation on mount
  useEffect(() => {
    runEligibilityCheck();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF1F6] text-[#0B3B60] text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step 2 · Deterministic Eligibility Rule Engine</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0B3B60]">
              Scheme Discovery & Eligibility Evaluation
            </h1>
            <p className="text-sm text-[#4A5568] mt-1">
              Deterministic verification using verified official NSFDC rules (nsfdc.nic.in). No LLM hallucinations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Official NSFDC Data Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Input + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: User Details Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
            <h2 className="text-base font-serif font-bold text-[#0B3B60] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0B3B60] text-white flex items-center justify-center text-xs">1</span>
              <span>Applicant Profile Input</span>
            </h2>

            <form onSubmit={runEligibilityCheck} className="space-y-4">
              {/* Purpose Selection */}
              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">
                  Loan / Scheme Purpose
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                >
                  <option value="entrepreneurship">Entrepreneurship / Startup</option>
                  <option value="business">Small Business / Enterprise</option>
                  <option value="micro_business">Micro Business Activity</option>
                  <option value="education">Education Loan (Professional / Technical)</option>
                  <option value="agriculture">Agriculture & Allied</option>
                  <option value="services">Services & Transport</option>
                  <option value="trade">Trade / Shopkeeping</option>
                  <option value="handicraft">Handicraft & Artisans</option>
                </select>
              </div>

              {/* Annual Family Income */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Annual Family Income (₹)
                  </label>
                  <span className="text-[11px] text-[#6B7280]">Ceiling: ₹3,00,000</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.annual_family_income}
                  onChange={(e) => handleInputChange('annual_family_income', e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                  placeholder="300000"
                  required
                />
              </div>

              {/* Desired Loan Amount */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Desired Loan Amount (₹)
                  </label>
                  <span className="text-[11px] text-[#6B7280]">Up to 90% of Cost</span>
                </div>
                <input
                  type="number"
                  min="5000"
                  step="10000"
                  value={formData.loan_amount}
                  onChange={(e) => handleInputChange('loan_amount', e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                  placeholder="300000"
                  required
                />
              </div>

              {/* Calculated Project Cost */}
              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">
                  Estimated Total Project Cost / Course Fee (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="10000"
                  value={formData.project_cost}
                  onChange={(e) => handleInputChange('project_cost', e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B3B60]"
                  placeholder="333333"
                />
              </div>

              {/* Caste Status Gate */}
              <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E2E8F0]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sc_caste_declared}
                    onChange={(e) => handleInputChange('sc_caste_declared', e.target.checked)}
                    className="w-4 h-4 rounded text-[#0B3B60] focus:ring-[#0B3B60]"
                  />
                  <span className="text-xs font-semibold text-[#1A202C]">
                    Applicant belongs to Scheduled Caste (SC)
                  </span>
                </label>
                <p className="text-[10px] text-[#718096] mt-1 pl-6">
                  * NSFDC schemes are exclusively mandated for SC beneficiaries.
                </p>
              </div>

              {/* Conditional Education Fields */}
              {formData.purpose === 'education' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Education Loan Parameters</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Study Location
                    </label>
                    <select
                      value={formData.study_location}
                      onChange={(e) => handleInputChange('study_location', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white"
                    >
                      <option value="india">Studies in India (Max ₹30L @ 6.0%)</option>
                      <option value="abroad">Studies Abroad (Max ₹40L @ 7.0%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Gender / Concession
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white"
                    >
                      <option value="female">Female (0.5% Rebate Active)</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0B3B60] hover:bg-[#082942] text-white text-xs sm:text-sm font-semibold rounded-xl transition-base shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Rules...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Evaluate Deterministic Eligibility</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick preset tests */}
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] space-y-2">
            <span className="text-xs font-bold text-[#475569]">Quick Test Scenarios:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    purpose: 'entrepreneurship',
                    annual_family_income: 300000,
                    loan_amount: 300000,
                    project_cost: 333333,
                    sc_caste_declared: true,
                    education_status: 'not_applicable',
                    study_location: 'india',
                    gender: 'female',
                  });
                }}
                className="text-[11px] px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-100 font-medium text-[#1E293B]"
              >
                ₹3L Entrepreneurship (Term Loan)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    purpose: 'micro_business',
                    annual_family_income: 180000,
                    loan_amount: 100000,
                    project_cost: 111111,
                    sc_caste_declared: true,
                    education_status: 'not_applicable',
                    study_location: 'india',
                    gender: 'male',
                  });
                }}
                className="text-[11px] px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-100 font-medium text-[#1E293B]"
              >
                ₹1L Micro Credit Finance
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    purpose: 'education',
                    annual_family_income: 250000,
                    loan_amount: 2000000,
                    project_cost: 2222222,
                    sc_caste_declared: true,
                    education_status: 'graduate',
                    study_location: 'india',
                    gender: 'female',
                  });
                }}
                className="text-[11px] px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-100 font-medium text-[#1E293B]"
              >
                ₹20L Education (Domestic)
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Scheme Matches & Explanations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-800">Error evaluating eligibility</h4>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {resultsData && (
            <>
              {/* Summary Stats Header */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-semibold text-[#6B7280]">Evaluation Verdict Summary</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-bold text-[#0B3B60]">
                      {resultsData.matched_count} of {resultsData.total_schemes_evaluated} Schemes Matched
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#6B7280]">Deterministic Engine</span>
                  <div className="text-xs font-bold text-emerald-700">100% Rule Traceable</div>
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Legal Notice:</strong> The system provides <em>indicative</em> eligibility evaluation only.
                  It does NOT approve or guarantee loans. Sanction is executed solely by Channelizing Agencies (SCAs) and NSFDC.
                </span>
              </div>

              {/* Scheme Cards */}
              <div className="space-y-4">
                {resultsData.results.map((scheme) => {
                  const isEligible = scheme.eligible;

                  return (
                    <div
                      key={scheme.scheme_id}
                      className={`bg-white rounded-2xl border transition-base shadow-xs overflow-hidden ${
                        isEligible
                          ? 'border-emerald-300 ring-1 ring-emerald-100'
                          : 'border-slate-200 opacity-90'
                      }`}
                    >
                      {/* Top Scheme Title Bar */}
                      <div
                        className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isEligible ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base text-[#0B3B60]">
                              {scheme.scheme_name}
                            </h3>
                          </div>
                          <span className="text-[11px] text-[#64748B]">Type: {scheme.scheme_type}</span>
                        </div>

                        {/* Verdict Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isEligible
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {isEligible ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Potentially Eligible</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                <span>Does Not Match Current Criteria</span>
                              </>
                            )}
                          </span>

                          <span className="text-xs font-mono font-bold text-[#0B3B60] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            Score: {scheme.match_score}/100
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-4 text-xs">
                        {/* Key Financial Parameters Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] block">Recommended Loan</span>
                            <span className="font-bold text-[#0B3B60] text-sm">
                              {scheme.recommended_loan_amount
                                ? `₹${scheme.recommended_loan_amount.toLocaleString('en-IN')}`
                                : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] block">Beneficiary Rate</span>
                            <span className="font-bold text-emerald-700 text-sm">
                              {scheme.interest_rate_display}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] block">Repayment Tenure</span>
                            <span className="font-bold text-[#1E293B] text-sm">
                              {scheme.repayment_years} Years
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] block">Moratorium</span>
                            <span className="font-semibold text-[#475569] text-xs">
                              {scheme.moratorium_note}
                            </span>
                          </div>
                        </div>

                        {/* Structured Deterministic Explanation */}
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                          <span className="font-bold text-[#0B3B60] block mb-1">
                            Deterministic Rule Explanation:
                          </span>
                          <p className="text-[#334155] leading-relaxed">
                            {scheme.explanation}
                          </p>
                        </div>

                        {/* Matching Factors & Failed Factors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Matching factors */}
                          {scheme.matching_factors?.length > 0 && (
                            <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                              <span className="font-bold text-emerald-800 block mb-1.5 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Matching Factors:</span>
                              </span>
                              <ul className="space-y-1 text-[#2D3748]">
                                {scheme.matching_factors.map((f, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Failed factors */}
                          {scheme.failed_factors?.length > 0 && (
                            <div className="p-3 bg-red-50/40 rounded-xl border border-red-100">
                              <span className="font-bold text-red-800 block mb-1.5 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Failed Factors:</span>
                              </span>
                              <ul className="space-y-1 text-[#2D3748]">
                                {scheme.failed_factors.map((f, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-red-500 font-bold">•</span>
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Missing information warning */}
                        {scheme.missing_information?.length > 0 && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                            <span className="font-bold block mb-1">Additional Info Recommended:</span>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {scheme.missing_information.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Provenance and Manual Verification Alert */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#64748B]">
                          <div className="flex items-center gap-2">
                            <span>Source: <strong>{scheme.source_name}</strong></span>
                            <span>•</span>
                            <span>Verified: {scheme.last_verified_at}</span>
                          </div>
                          <a
                            href={scheme.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[#0B3B60] hover:text-[#C77D02] underline"
                          >
                            <span>Verify on NSFDC Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* If needs_manual_verification flag is set */}
                        {scheme.needs_manual_verification && (
                          <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 text-[11px]">
                            <span className="font-bold text-purple-900 block mb-0.5">
                              ⚠️ Secondary Circular Verification Note:
                            </span>
                            <p>{scheme.verification_note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
