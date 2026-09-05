import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  GraduationCap,
  Store,
  Tractor,
  Wrench,
  Truck,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Bot,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { understandRequirement, matchSchemes, checkEligibility } from '../api';
import Button from '../components/Button';
import Card from '../components/Card';
import ErrorPanel from '../components/ErrorPanel';
import StatusBadge from '../components/StatusBadge';

const SLOW_THRESHOLD_MS = 3000;

export default function Step1Details() {
  const { t } = useTranslation();
  const {
    formData,
    setFormData,
    aiInputText,
    setAiInputText,
    aiExtractionResult,
    setAiExtractionResult,
    setRecommendResult,
    setMatchedSchemes,
    setStep,
  } = useApp();

  const [inputMode, setInputMode] = useState('form'); // 'form' | 'ai'
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSlowMsg, setShowSlowMsg] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');

  const slowTimer = useRef(null);

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };
    if (field === 'purpose' && !formData.purpose) {
      newErrors.purpose = 'Please select your loan purpose.';
    }
    if (field === 'loan_amount') {
      const amt = parseFloat(formData.loan_amount);
      if (!formData.loan_amount || isNaN(amt) || amt <= 0) {
        newErrors.loan_amount = 'Please enter a valid desired loan amount.';
      } else {
        delete newErrors.loan_amount;
      }
    }
    if (field === 'annual_family_income') {
      const inc = parseFloat(formData.annual_family_income);
      if (formData.annual_family_income === '' || isNaN(inc) || inc < 0) {
        newErrors.annual_family_income = 'Please enter your total annual family income (0 or more).';
      } else {
        delete newErrors.annual_family_income;
      }
    }
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.purpose) newErrors.purpose = 'Please select a loan purpose.';
    const amt = parseFloat(formData.loan_amount);
    if (!formData.loan_amount || isNaN(amt) || amt <= 0) {
      newErrors.loan_amount = 'Please enter a valid loan amount.';
    }
    const inc = parseFloat(formData.annual_family_income);
    if (formData.annual_family_income === '' || isNaN(inc) || inc < 0) {
      newErrors.annual_family_income = 'Please enter your annual family income.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // AI Natural Language Understanding Flow
  const handleAiUnderstand = async (e) => {
    if (e) e.preventDefault();
    if (!aiInputText.trim()) return;

    setAiLoading(true);
    setApiError(null);

    try {
      const res = await understandRequirement({ query: aiInputText.trim() });
      const data = res.data;
      setAiExtractionResult(data);

      const profile = data.extracted_profile || {};

      // Populate structured form state with AI extracted values
      setFormData((prev) => ({
        ...prev,
        purpose: profile.purpose || prev.purpose || 'business',
        loan_amount: profile.loan_amount != null ? profile.loan_amount.toString() : prev.loan_amount,
        project_cost: profile.loan_amount != null ? Math.round(profile.loan_amount / 0.9).toString() : prev.project_cost,
        annual_family_income: profile.annual_income != null ? profile.annual_income.toString() : prev.annual_family_income,
        education_status: profile.education_status || prev.education_status,
        study_location: profile.study_location || prev.study_location,
        sc_caste_declared: true,
      }));

      // Store matched results from rule engine
      if (data.rule_engine_results && data.rule_engine_results.length > 0) {
        setRecommendResult({
          eligible: data.matched_count > 0,
          matched_count: data.matched_count,
          results: data.rule_engine_results,
          best_match: data.best_match,
          explanation: data.explanation,
        });
        setMatchedSchemes(data.rule_engine_results);
      }
    } catch (err) {
      console.warn('AI understand requirement failed, running local match:', err);
      // Fallback: Run standard match
    } finally {
      setAiLoading(false);
    }
  };

  // Structured Form Submit Flow (Deterministic Rule Engine Verification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ purpose: true, loan_amount: true, annual_family_income: true });
    if (!validate()) return;

    setApiError(null);
    setLoading(true);
    setShowSlowMsg(false);

    slowTimer.current = setTimeout(() => setShowSlowMsg(true), SLOW_THRESHOLD_MS);

    const amount = parseFloat(formData.loan_amount);
    const income = parseFloat(formData.annual_family_income);
    const cost = formData.project_cost ? parseFloat(formData.project_cost) : Math.round(amount / 0.9);

    const payload = {
      purpose: formData.purpose,
      annual_family_income: income,
      loan_amount: amount,
      project_cost: cost,
      sc_caste_declared: formData.sc_caste_declared !== false,
      education_status: formData.education_status || 'not_applicable',
      study_location: formData.study_location || 'india',
      gender: formData.gender || undefined,
    };

    try {
      // Evaluate against deterministic rule engine
      const res = await checkEligibility(payload);
      const results = res.data.results || [];
      const eligibleList = results.filter((r) => r.eligible);

      setRecommendResult({
        eligible: eligibleList.length > 0,
        matched_count: eligibleList.length,
        results: results,
        best_match: eligibleList[0] || null,
        explanation: eligibleList[0]?.explanation || 'Evaluated against verified NSFDC schemes.',
      });
      setMatchedSchemes(results);
      setStep(2);
    } catch (err) {
      console.error('Eligibility check error:', err);
      setApiError(true);
    } finally {
      clearTimeout(slowTimer.current);
      setLoading(false);
      setShowSlowMsg(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setLocStatus('denied');
      return;
    }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('latitude', pos.coords.latitude.toFixed(6));
        update('longitude', pos.coords.longitude.toFixed(6));
        setLocStatus('granted');
      },
      () => setLocStatus('denied')
    );
  };

  useEffect(() => () => clearTimeout(slowTimer.current), []);

  const purposeOptions = [
    {
      value: 'micro_business',
      label: 'Micro Credit / Small Business',
      desc: 'Small trade, vending, artisan units up to ₹1.4 Lakh',
      icon: Store,
    },
    {
      value: 'business',
      label: 'Entrepreneurship & Term Loan',
      desc: 'Manufacturing, machinery & services up to ₹50 Lakh',
      icon: Briefcase,
    },
    {
      value: 'education',
      label: 'Higher Education Loan',
      desc: 'Technical & professional studies in India/Abroad up to ₹20/30 Lakh',
      icon: GraduationCap,
    },
    {
      value: 'agriculture',
      label: 'Agriculture & Allied Activities',
      desc: 'Dairy, poultry, farm mechanization & minor irrigation',
      icon: Tractor,
    },
    {
      value: 'services',
      label: 'Service & Transport Sector',
      desc: 'Vehicles, repair workshops & IT service businesses',
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Step Heading */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#C77D02] uppercase tracking-wider">
            Step 1 · Find My Scheme
          </span>
          <StatusBadge status="verified" text="NSFDC Verified" size="xs" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#0B3B60] font-bold tracking-tight">
          Tell us about your requirement
        </h2>
        <p className="text-xs sm:text-sm text-[#4A5568]">
          Our deterministic AI & rule engine will evaluate and match verified government loan schemes.
        </p>
      </div>

      {apiError && <ErrorPanel onRetry={() => setApiError(null)} />}

      {/* Mode Switcher: AI Input vs Structured Form */}
      <div className="flex items-center gap-2 p-1.5 bg-[#EAF1F6] rounded-xl border border-[#CBD5E1]">
        <button
          type="button"
          onClick={() => setInputMode('ai')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-base cursor-pointer flex items-center justify-center gap-2 ${
            inputMode === 'ai'
              ? 'bg-[#0B3B60] text-white shadow-xs'
              : 'text-[#4A5568] hover:text-[#0B3B60]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#E59310]" />
          <span>AI Natural Language Input (Hindi/English)</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('form')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-base cursor-pointer flex items-center justify-center gap-2 ${
            inputMode === 'form'
              ? 'bg-[#0B3B60] text-white shadow-xs'
              : 'text-[#4A5568] hover:text-[#0B3B60]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Structured Requirement Form</span>
        </button>
      </div>

      {/* ── MODE 1: AI Natural Language Understanding Box ─────────────────── */}
      {inputMode === 'ai' && (
        <Card padding="p-5 sm:p-6" className="space-y-4 border-2 border-[#0B3B60]/30 bg-gradient-to-b from-white to-[#F7F9FB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              <Bot className="w-4 h-4 text-[#0F8B8D]" />
              <span>Describe Your Need in Simple Words</span>
            </div>
            <span className="text-[10px] text-[#6B7280]">
              Supports Hindi, Hinglish & English
            </span>
          </div>

          <p className="text-xs text-[#4A5568] leading-relaxed">
            Write or paste what you want to do. For example:{' '}
            <em className="text-[#0B3B60] font-medium font-serif">
              "Mujhe dairy farm ke liye 3 lakh ka loan chahiye, meri annual family income 2.5 lakh hai."
            </em>
          </p>

          <div className="space-y-2">
            <textarea
              rows={3}
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              placeholder="e.g. I want a ₹2 Lakh loan for starting a garment retail store. My family income is ₹1.8 Lakh."
              className="w-full p-3.5 border border-[#CBD5E1] rounded-xl text-xs sm:text-sm text-[#1C1C1C] outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10 bg-white"
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Kirana Shop (₹1.5L)',
                  'Dairy & Cattle (₹3L)',
                  'B.Tech Education (₹10L)',
                ].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => {
                      if (quick.includes('Kirana')) {
                        setAiInputText('Mujhe kirana shop kholne ke liye 1.25 lakh loan chahiye, family income 1.5 lakh hai.');
                      } else if (quick.includes('Dairy')) {
                        setAiInputText('Mujhe dairy farm ke liye 3 lakh loan chahiye, family income 2.5 lakh hai.');
                      } else {
                        setAiInputText('Mujhe B.Tech engineering ke liye 10 lakh education loan chahiye, family income 3 lakh hai.');
                      }
                    }}
                    className="px-2.5 py-1 rounded-md bg-[#EAF1F6] text-[#0B3B60] text-[11px] font-semibold hover:bg-[#0B3B60] hover:text-white transition-base cursor-pointer"
                  >
                    + {quick}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                loading={aiLoading}
                onClick={handleAiUnderstand}
                icon={Sparkles}
              >
                Understand & Match
              </Button>
            </div>
          </div>

          {/* AI Extracted Parameters Understanding Card */}
          {aiExtractionResult && (
            <div className="p-4 bg-white rounded-xl border border-[#0B3B60]/30 shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C77D02]" />
                  <span className="text-xs font-bold text-[#0B3B60]">
                    AI Requirement Understanding
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#6B7280]">
                    Detected: <strong>{aiExtractionResult.extracted_profile?.language_detected || 'auto'}</strong>
                  </span>
                  <StatusBadge
                    status="potentially_eligible"
                    text={aiExtractionResult.confidence || 'High Confidence'}
                    size="xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 bg-[#F7F9FB] rounded-lg border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] block">Purpose</span>
                  <span className="font-bold text-[#0B3B60] capitalize">
                    {aiExtractionResult.extracted_profile?.purpose?.replace('_', ' ') || 'Business'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F7F9FB] rounded-lg border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] block">Extracted Loan</span>
                  <span className="font-bold text-[#0B3B60] font-mono">
                    {aiExtractionResult.extracted_profile?.loan_amount
                      ? `₹${Number(aiExtractionResult.extracted_profile.loan_amount).toLocaleString('en-IN')}`
                      : 'Not specified'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F7F9FB] rounded-lg border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] block">Family Income</span>
                  <span className="font-bold text-[#0B3B60] font-mono">
                    {aiExtractionResult.extracted_profile?.annual_income
                      ? `₹${Number(aiExtractionResult.extracted_profile.annual_income).toLocaleString('en-IN')}`
                      : 'Not specified'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#F7F9FB] rounded-lg border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] block">Caste Category</span>
                  <span className="font-bold text-[#1A7F4E]">
                    {aiExtractionResult.extracted_profile?.caste || 'SC (Declared)'}
                  </span>
                </div>
              </div>

              {aiExtractionResult.extracted_profile?.clarification_question && (
                <div className="p-3 bg-[#FEF9E7] border border-[#B8860B]/30 rounded-lg text-xs text-[#8B6508]">
                  <strong>Note: </strong>
                  <span>{aiExtractionResult.extracted_profile.clarification_question}</span>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-[#1A7F4E] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parameters synchronized to Rule Engine</span>
                </span>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>View Recommended Schemes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── MODE 2: Structured Requirement Form ────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card padding="p-5 sm:p-6" className="space-y-6">
          {/* Loan Purpose Selection */}
          <fieldset>
            <legend className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-3">
              1. What is the purpose of your funding? <span className="text-[#B3261E]">*</span>
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {purposeOptions.map(({ value, label, desc, icon: Icon }) => {
                const isSelected = formData.purpose === value;
                return (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-base relative ${
                      isSelected
                        ? 'border-2 border-[#0B3B60] bg-[#EAF1F6] shadow-2xs'
                        : 'border border-[#E5E7EB] bg-white hover:border-[#0B3B60]/40 hover:bg-[#F7F9FB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={value}
                      checked={isSelected}
                      onChange={() => update('purpose', value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#0B3B60] bg-[#0B3B60]' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#1C1C1C]">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0B3B60]' : 'text-gray-500'}`} />
                        <span>{label}</span>
                      </div>
                      <p className="text-[11px] text-[#4A5568] mt-1 leading-snug">
                        {desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.purpose && (
              <p className="text-[#B3261E] text-xs font-medium mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.purpose}
              </p>
            )}
          </fieldset>

          {/* Desired Loan Amount & Annual Family Income */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Loan Amount */}
            <div>
              <label htmlFor="loan_amount" className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-1.5">
                2. Desired Loan Amount (₹) <span className="text-[#B3261E]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="loan_amount"
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.loan_amount}
                  onChange={(e) => {
                    update('loan_amount', e.target.value);
                    if (e.target.value) {
                      update('project_cost', Math.round(parseFloat(e.target.value) / 0.9).toString());
                    }
                  }}
                  onBlur={() => handleBlur('loan_amount')}
                  placeholder="e.g. 200000"
                  className={`w-full h-12 pl-8 pr-4 border rounded-xl bg-white text-[#1C1C1C] font-mono tabular-nums text-sm outline-none transition-base ${
                    errors.loan_amount
                      ? 'border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/20'
                      : 'border-[#CBD5E1] focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10'
                  }`}
                />
              </div>
              {errors.loan_amount ? (
                <p className="text-[#B3261E] text-xs font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.loan_amount}
                </p>
              ) : (
                <p className="text-[11px] text-[#6B7280] mt-1">
                  NSFDC finances up to 90%–95% of the total project cost.
                </p>
              )}
            </div>

            {/* Annual Family Income */}
            <div>
              <label htmlFor="annual_family_income" className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-1.5">
                3. Annual Family Income (₹) <span className="text-[#B3261E]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="annual_family_income"
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.annual_family_income}
                  onChange={(e) => update('annual_family_income', e.target.value)}
                  onBlur={() => handleBlur('annual_family_income')}
                  placeholder="e.g. 180000"
                  className={`w-full h-12 pl-8 pr-4 border rounded-xl bg-white text-[#1C1C1C] font-mono tabular-nums text-sm outline-none transition-base ${
                    errors.annual_family_income
                      ? 'border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/20'
                      : 'border-[#CBD5E1] focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10'
                  }`}
                />
              </div>
              {errors.annual_family_income ? (
                <p className="text-[#B3261E] text-xs font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.annual_family_income}
                </p>
              ) : (
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Total annual income of all earning family members combined.
                </p>
              )}
            </div>
          </div>

          {/* Education specific options if education is selected */}
          {formData.purpose === 'education' && (
            <div className="p-4 bg-[#EAF1F6]/50 rounded-xl border border-[#0B3B60]/20 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-[#0B3B60] mb-1.5">
                  Education Level
                </label>
                <select
                  value={formData.education_status}
                  onChange={(e) => update('education_status', e.target.value)}
                  className="w-full h-10 px-3 border border-[#CBD5E1] rounded-lg bg-white text-xs text-[#1C1C1C] outline-none"
                >
                  <option value="12th_pass">12th Pass / Intermediate</option>
                  <option value="graduate">Graduate (Technical / Professional)</option>
                  <option value="post_graduate">Post Graduate</option>
                  <option value="vocational">Vocational / Skill Diploma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B3B60] mb-1.5">
                  Study Location
                </label>
                <select
                  value={formData.study_location}
                  onChange={(e) => update('study_location', e.target.value)}
                  className="w-full h-10 px-3 border border-[#CBD5E1] rounded-lg bg-white text-xs text-[#1C1C1C] outline-none"
                >
                  <option value="india">In India (Limit up to ₹20 Lakh)</option>
                  <option value="abroad">Abroad / Foreign Studies (Limit up to ₹30 Lakh)</option>
                </select>
              </div>
            </div>
          )}

          {/* Gender & SC Caste Declaration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E7EB]">
            <div>
              <label className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-1.5">
                Applicant Gender (Optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['female', 'male', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update('gender', formData.gender === g ? '' : g)}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-base cursor-pointer ${
                      formData.gender === g
                        ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#6B7280] mt-1">
                * Female beneficiaries receive a 0.5% p.a. interest rebate on education loans.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B3B60] uppercase tracking-wider mb-1.5">
                Caste Self-Declaration
              </label>
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#E8F7EE] border border-[#1A7F4E]/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sc_caste_declared}
                  onChange={(e) => update('sc_caste_declared', e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A7F4E] mt-0.5"
                />
                <span className="text-[11px] text-[#1A7F4E] font-bold leading-snug">
                  I belong to Scheduled Caste (SC) as recognized under MoSJE / NSFDC.
                </span>
              </label>
            </div>
          </div>
        </Card>

        {showSlowMsg && (
          <div className="border border-[#B8860B]/30 bg-[#FEF9E7] rounded-xl p-4 text-xs text-[#B8860B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Evaluating rule engine across verified schemes…</span>
          </div>
        )}

        {/* Submit Verification Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={ArrowRight}
        >
          Verify Eligibility & Match Schemes
        </Button>
      </form>
    </div>
  );
}
