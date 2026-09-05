import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, ShieldCheck, UserCheck, Phone, X, Check, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from './Button';
import i18n from '../i18n';

export default function BeneficiaryLoginModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { setBeneficiary, startWizard } = useApp();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [casteDeclared, setCasteDeclared] = useState(true);
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setBeneficiary({
      name: name.trim() || 'Beneficiary Applicant',
      phone: phone.trim() || '9876543210',
      sc_caste_declared: casteDeclared,
      isLoggedIn: true,
      loginTime: new Date().toISOString(),
    });
    i18n.changeLanguage(selectedLang);
    onClose();
    startWizard(1);
  };

  const handleQuickGuest = () => {
    setBeneficiary({
      name: 'Guest Beneficiary',
      phone: '',
      sc_caste_declared: true,
      isLoggedIn: true,
      isGuest: true,
      loginTime: new Date().toISOString(),
    });
    onClose();
    startWizard(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] relative my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6B7280] hover:text-[#1C1C1C] p-1.5 rounded-lg hover:bg-gray-100 transition-base cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF1F6] text-[#0B3B60] border border-[#0B3B60]/20 flex items-center justify-center mx-auto mb-3">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0B3B60]">
            Beneficiary Portal Login
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Access Government SC Loan & Education Schemes (MoSJE / NSFDC)
          </p>
        </div>

        {/* Language Selection */}
        <div className="mb-4 bg-[#F7F9FB] p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#4A5568] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#0F8B8D]" />
            <span>Preferred Language / भाषा:</span>
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedLang('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-base cursor-pointer ${
                selectedLang === 'en'
                  ? 'bg-[#0B3B60] text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-base cursor-pointer ${
                selectedLang === 'hi'
                  ? 'bg-[#0B3B60] text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#1C1C1C] mb-1">
              Applicant Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enter Your Full Name"
              className="w-full h-11 px-3.5 border border-[#E5E7EB] rounded-xl text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1C1C1C] mb-1">
              Mobile Number (10 Digits)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full h-11 pl-12 pr-3.5 border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-mono outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />
            </div>
          </div>

          {/* Caste Self-Declaration */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#EAF1F6]/70 border border-[#0B3B60]/20 cursor-pointer">
            <input
              type="checkbox"
              checked={casteDeclared}
              onChange={(e) => setCasteDeclared(e.target.checked)}
              className="w-4 h-4 rounded text-[#0B3B60] mt-0.5"
            />
            <span className="text-[11px] text-[#0B3B60] leading-snug font-medium">
              I self-declare that I belong to the <strong>Scheduled Caste (SC)</strong> community as per Government of India guidelines.
            </span>
          </label>

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              icon={UserCheck}
            >
              Sign In & Find Schemes
            </Button>

            <button
              type="button"
              onClick={handleQuickGuest}
              className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-base cursor-pointer"
            >
              Continue as Guest Beneficiary
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-[#6B7280] mt-4">
          🔒 Zero document upload required for initial scheme discovery.
        </p>
      </div>
    </div>
  );
}
