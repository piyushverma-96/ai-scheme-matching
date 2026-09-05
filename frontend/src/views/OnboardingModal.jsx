import React, { useState } from 'react';
import {
  ArrowRight,
  Globe,
  Search,
  Calculator,
  Building2,
  Check,
  X,
} from 'lucide-react';
import Logo from '../components/Logo';
import i18n from '../i18n';

export default function OnboardingModal({ isOpen, onClose }) {
  const [stage, setStage] = useState('lang'); // 'lang' | 1 | 2 | 3
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  if (!isOpen) return null;

  const handleLangConfirm = () => {
    i18n.changeLanguage(selectedLang);
    setStage(1);
  };

  const handleNext = () => {
    if (stage === 1) setStage(2);
    else if (stage === 2) setStage(3);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Language Selection Stage */}
        {stage === 'lang' && (
          <div className="space-y-5 text-center pt-2">
            <Logo size="lg" className="justify-center" />

            <div className="pt-2">
              <h3 className="text-base font-bold text-[#0B3B60]">
                Choose your language / अपनी भाषा चुनें
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Select your preferred language for government schemes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`py-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                  selectedLang === 'en'
                    ? 'bg-[#0B3B60] text-white border-[#0B3B60] shadow-xs'
                    : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-white'
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => setSelectedLang('hi')}
                className={`py-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                  selectedLang === 'hi'
                    ? 'bg-[#0B3B60] text-white border-[#0B3B60] shadow-xs'
                    : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:bg-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleLangConfirm}
                className="w-full py-3.5 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Onboarding Steps */}
        {typeof stage === 'number' && (
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 rounded-3xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto shadow-xs">
              {stage === 1 && <Search className="w-8 h-8 stroke-[2]" />}
              {stage === 2 && <Calculator className="w-8 h-8 stroke-[2]" />}
              {stage === 3 && <Building2 className="w-8 h-8 stroke-[2]" />}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
                {stage === 1 && 'Find schemes that match your needs'}
                {stage === 2 && 'Understand eligibility and repayment'}
                {stage === 3 && 'Find the right channel partner'}
              </h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed max-w-xs mx-auto">
                {stage === 1 &&
                  'Discover verified government-backed concessional loans starting from 4% interest rate.'}
                {stage === 2 &&
                  'Check indicative criteria deterministically and plan monthly EMI with moratorium grace periods.'}
                {stage === 3 &&
                  'Connect with authorized State SC Finance Corporations and partner bank branches near you.'}
              </p>
            </div>

            {/* Step Dots */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    stage === dot ? 'bg-[#0B3B60] w-6' : 'bg-[#E2E8F0]'
                  }`}
                />
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{stage === 3 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
