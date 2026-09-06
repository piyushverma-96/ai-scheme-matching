import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Briefcase,
  GraduationCap,
  Store,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FindSchemeWizardView() {
  const { navigateTo } = useApp();
  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState('wizard'); // 'wizard' | 'ai'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);

  // Form State
  const [purpose, setPurpose] = useState('business');
  const [fundingAmount, setFundingAmount] = useState('300000');
  const [familyIncome, setFamilyIncome] = useState('300000');
  const [city, setCity] = useState('Bhopal');
  const [casteDeclared, setCasteDeclared] = useState(true);
  const [aiText, setAiText] = useState('');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      triggerProcessing();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigateTo('home');
  };

  const triggerProcessing = () => {
    setIsProcessing(true);
    setProcessingStage(1);

    setTimeout(() => {
      setProcessingStage(2);
    }, 900);

    setTimeout(() => {
      setProcessingStage(3);
    }, 1800);

    setTimeout(() => {
      setIsProcessing(false);
      navigateTo('eligibility_result');
    }, 2600);
  };

  const handleAiUnderstand = (e) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    triggerProcessing();
  };

  // Processing Animation View
  if (isProcessing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 max-w-md w-full shadow-lg text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-3xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0B3B60]">
              Evaluating Scheme Match
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Checking criteria against verified guidelines...
            </p>
          </div>

          <div className="space-y-3 text-left pt-2 text-xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  processingStage >= 1
                    ? 'bg-[#E8F8F2] text-[#10B981]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                ✓
              </div>
              <span
                className={
                  processingStage >= 1 ? 'font-bold text-[#1E293B]' : 'text-gray-400'
                }
              >
                Understanding your requirement
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  processingStage >= 2
                    ? 'bg-[#E8F8F2] text-[#10B981]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                ✓
              </div>
              <span
                className={
                  processingStage >= 2 ? 'font-bold text-[#1E293B]' : 'text-gray-400'
                }
              >
                Checking available schemes & subsidies
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  processingStage >= 3
                    ? 'bg-[#E8F8F2] text-[#10B981]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                ✓
              </div>
              <span
                className={
                  processingStage >= 3 ? 'font-bold text-[#1E293B]' : 'text-gray-400'
                }
              >
                Verifying indicative eligibility criteria
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer min-h-[44px] px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-[#64748B]">
          Step {step} of 4
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0B3B60] transition-all duration-300 rounded-full"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Mode Switch Pill: Guided Form vs AI Assistant */}
      <div className="flex bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0]">
        <button
          onClick={() => setInputMode('wizard')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            inputMode === 'wizard'
              ? 'bg-white text-[#0B3B60] shadow-xs'
              : 'text-[#64748B]'
          }`}
        >
          Step-by-Step Form
        </button>
        <button
          onClick={() => setInputMode('ai')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            inputMode === 'ai'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-[#64748B]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tell in Your Own Words</span>
        </button>
      </div>

      {/* Mode 1: Natural Language AI Input */}
      {inputMode === 'ai' && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B3B60]">
              Tell us what you need
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>AI assisted</span>
            </span>
          </div>

          <p className="text-xs text-[#64748B]">
            Describe your requirement in simple words. For example: "I want to start a small business in Bhopal and need ₹3 lakh funding."
          </p>

          <form onSubmit={handleAiUnderstand} className="space-y-4">
            <textarea
              rows={4}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="I want to start a small retail shop / manufacturing unit and need around ₹3 lakh loan..."
              className="w-full p-4 rounded-2xl border border-[#E2E8F0] text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10 resize-none"
            />

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Understand my requirement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mode 2: Step-by-Step Progressive Disclosure Wizard */}
      {inputMode === 'wizard' && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          {/* Step 1: Purpose */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-[#0B3B60]">
                  What do you need financial assistance for?
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Choose the category that best describes your goal
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    id: 'business',
                    title: 'Business / Entrepreneurship',
                    desc: 'Start a new business, purchase machinery, or expand existing enterprise',
                    icon: Briefcase,
                  },
                  {
                    id: 'education',
                    title: 'Higher Education',
                    desc: 'Professional courses (Engineering, Medical, MBA) in India or Abroad',
                    icon: GraduationCap,
                  },
                  {
                    id: 'other',
                    title: 'Micro Credit / Other Services',
                    desc: 'Small vendor, transport vehicle, or artisan livelihood tools',
                    icon: Store,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = purpose === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPurpose(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-[#0B3B60] bg-[#EFF6FF] ring-2 ring-[#0B3B60]/10'
                          : 'border-[#E2E8F0] hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#0B3B60] text-white'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Funding Amount */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-[#0B3B60]">
                  How much funding do you need?
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter estimated total loan requirement in Indian Rupees
                </p>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-[#0B3B60]">
                  ₹
                </span>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  placeholder="300000"
                  className="w-full h-12 pl-10 pr-4 rounded-2xl border border-[#E2E8F0] font-mono text-base font-bold text-[#1E293B] outline-none focus:border-[#0B3B60]"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {['100000', '300000', '500000', '1500000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFundingAmount(val)}
                    className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    ₹{(Number(val) / 100000).toFixed(0)} Lakh
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Annual Family Income */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-[#0B3B60]">
                  What is your annual family income?
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Government schemes provide interest subventions based on income brackets
                </p>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-[#0B3B60]">
                  ₹
                </span>
                <input
                  type="number"
                  value={familyIncome}
                  onChange={(e) => setFamilyIncome(e.target.value)}
                  placeholder="300000"
                  className="w-full h-12 pl-10 pr-4 rounded-2xl border border-[#E2E8F0] font-mono text-base font-bold text-[#1E293B] outline-none focus:border-[#0B3B60]"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {['150000', '300000', '500000', '800000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFamilyIncome(val)}
                    className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    ₹{(Number(val) / 100000).toFixed(0)} Lakh
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: City & Declaration */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-[#0B3B60]">
                  Your Location & Category Confirmation
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  To match nearby channel partners and category-specific subsidies
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Your District / City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bhopal"
                  className="w-full h-11 px-4 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm outline-none focus:border-[#0B3B60]"
                />
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={casteDeclared}
                  onChange={(e) => setCasteDeclared(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B3B60] accent-[#0B3B60] mt-0.5"
                />
                <span className="text-[11px] text-[#475569] leading-snug">
                  I self-declare that I belong to the <strong>Scheduled Caste (SC)</strong> or eligible priority category.
                </span>
              </label>
            </div>
          )}

          {/* Wizard Next Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <span>{step === 4 ? 'Check My Eligibility' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
