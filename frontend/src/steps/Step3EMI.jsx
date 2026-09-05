import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  ShieldCheck,
  TrendingDown,
  Info,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Landmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Tooltip from '../components/Tooltip';
import StatusBadge from '../components/StatusBadge';

const formatINR = (num) =>
  num != null ? `₹${Number(Math.round(num)).toLocaleString('en-IN')}` : '—';

/**
 * Step 3: Pure Deterministic EMI Calculation
 * Formula: EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 *  - r = annual rate / (12 * 100)
 *  - n = tenure in months
 *  - moratoriumMonths = months during which principal repayment is deferred
 */
export default function Step3EMI() {
  const { t } = useTranslation();
  const {
    selectedScheme,
    recommendResult,
    formData,
    emiConfig,
    setEmiConfig,
    setStep,
    navigateTo,
  } = useApp();

  const primaryScheme = selectedScheme || recommendResult?.best_match || {};

  const [amount, setAmount] = useState(
    emiConfig.amount || (formData.loan_amount ? parseFloat(formData.loan_amount) : 300000)
  );
  const [rate, setRate] = useState(
    emiConfig.rate || (primaryScheme.rate_beneficiary_min || 5.0)
  );
  const [tenure, setTenure] = useState(
    emiConfig.tenure || (primaryScheme.repayment_years ? primaryScheme.repayment_years * 12 : 60)
  );
  const [moratorium, setMoratorium] = useState(
    emiConfig.moratoriumMonths != null ? emiConfig.moratoriumMonths : (primaryScheme.moratorium_months || 3)
  );

  // Synchronize state changes to AppContext
  useEffect(() => {
    setEmiConfig({
      amount: Number(amount),
      rate: Number(rate),
      tenure: Number(tenure),
      moratoriumMonths: Number(moratorium),
    });
  }, [amount, rate, tenure, moratorium, setEmiConfig]);

  // Deterministic EMI Calculation
  const repaymentMonths = Math.max(1, tenure - moratorium);
  const monthlyRate = rate / (12 * 100);

  const emi =
    monthlyRate === 0
      ? amount / repaymentMonths
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
        (Math.pow(1 + monthlyRate, repaymentMonths) - 1);

  const totalRepayment = emi * repaymentMonths;
  const totalInterest = Math.max(0, totalRepayment - amount);

  // Commercial Bank Comparison (@ 13% p.a. standard commercial MSME rate)
  const commRate = 13.0 / (12 * 100);
  const commEmi =
    (amount * commRate * Math.pow(1 + commRate, repaymentMonths)) /
    (Math.pow(1 + commRate, repaymentMonths) - 1);
  const commTotalRepayment = commEmi * repaymentMonths;
  const savings = Math.max(0, commTotalRepayment - totalRepayment);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              Step 3 · EMI & Repayment Calculator
            </span>
            <StatusBadge status="verified" text="Deterministic Math" size="xs" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0B3B60] font-bold tracking-tight">
            Plan your monthly instalment
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568]">
            Calculate your monthly budget with verified NSFDC concessional rates and moratorium benefits.
          </p>
        </div>

        {primaryScheme.scheme_name && (
          <div className="p-2.5 bg-[#EAF1F6] rounded-xl border border-[#0B3B60]/20 text-xs">
            <span className="text-[10px] text-[#6B7280] block font-semibold">Matched Scheme</span>
            <strong className="text-[#0B3B60]">{primaryScheme.scheme_name}</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Input Controls (Left Column) */}
        <div className="lg:col-span-7 space-y-5">
          <Card padding="p-5 sm:p-6" className="space-y-6">
            {/* 1. Loan Amount */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
                  Loan Amount (₹)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    min="10000"
                    max="5000000"
                    step="5000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-32 h-8 px-2 border rounded-lg text-sm font-bold text-[#0B3B60] font-mono text-right outline-none focus:border-[#0B3B60]"
                  />
                </div>
              </div>
              <input
                type="range"
                min="25000"
                max="5000000"
                step="25000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[#0B3B60]"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                <span>₹25,000 (Micro)</span>
                <span>₹50,00,000 (Term Loan)</span>
              </div>
            </div>

            {/* 2. Concessional Interest Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Concessional Rate (% p.a.)</span>
                  <Tooltip tip="NSFDC schemes offer interest rates between 4.0% to 8.0% p.a., far lower than standard commercial banks.">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </Tooltip>
                </label>
                <span className="text-sm font-bold text-[#1A7F4E] font-mono tabular-nums">
                  {rate.toFixed(1)}% p.a.
                </span>
              </div>
              <input
                type="range"
                min="4.0"
                max="10.0"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-[#1A7F4E]"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                <span>4.0% (Women/Edu)</span>
                <span>6.5% (Micro)</span>
                <span>10.0%</span>
              </div>
            </div>

            {/* 3. Repayment Tenure */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
                  Repayment Tenure (Months)
                </label>
                <span className="text-sm font-bold text-[#0B3B60] font-mono tabular-nums">
                  {tenure} Months ({(tenure / 12).toFixed(1)} Years)
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="120"
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-[#0B3B60]"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                <span>1 Year (12m)</span>
                <span>5 Years (60m)</span>
                <span>10 Years (120m)</span>
              </div>
            </div>

            {/* 4. Moratorium Period */}
            <div className="pt-2 border-t border-[#E5E7EB]">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Moratorium Period</span>
                  <Tooltip tip="Moratorium is a grace period after loan disbursement during which you do not have to pay EMI instalments.">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </Tooltip>
                </label>
                <span className="text-xs font-bold text-[#C77D02] font-mono">
                  {moratorium} Months Moratorium
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoratorium(m)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-base cursor-pointer ${
                      moratorium === m
                        ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {m === 0 ? 'No Moratorium' : `${m} Months`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1.5">
                Active repayment starts after {moratorium} months ({repaymentMonths} paying instalments).
              </p>
            </div>
          </Card>

          {/* Subvention Savings Banner */}
          <div className="bg-[#E8F7EE] border border-[#1A7F4E]/30 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-[#1A7F4E] text-white flex items-center justify-center shrink-0">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-[#1A7F4E] font-bold uppercase tracking-wider">
                Government Concessional Savings
              </p>
              <h4 className="font-bold text-[#1A7F4E] text-base sm:text-lg font-mono">
                You Save {formatINR(savings)} vs Commercial Bank Loans!
              </h4>
              <p className="text-[11px] text-[#4A5568] mt-0.5">
                Commercial MSME loans charge ~13% p.a. NSFDC concessional loans offer substantial interest relief.
              </p>
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0B3B60] text-white rounded-2xl p-6 shadow-md space-y-5">
            <div className="text-center pb-4 border-b border-white/20">
              <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider block mb-1">
                Estimated Monthly EMI
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-bold font-mono text-white">
                {formatINR(emi)}
              </div>
              <p className="text-blue-200 text-xs mt-1">
                per month for {repaymentMonths} months
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-blue-200">Principal Loan:</span>
                <span className="font-bold font-mono text-white">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-blue-200">Total Interest Payable:</span>
                <span className="font-bold font-mono text-[#E59310]">{formatINR(totalInterest)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-blue-200">Total Repayment Amount:</span>
                <span className="font-bold font-mono text-base text-white">{formatINR(totalRepayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Moratorium Grace:</span>
                <span className="font-bold text-white">{moratorium} Months</span>
              </div>
            </div>

            <p className="text-[11px] text-blue-200/80 leading-snug pt-2 border-t border-white/10">
              * Calculations are mathematical estimates. Exact instalment schedule is finalized by the Channelizing Agency during sanction.
            </p>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setStep(4)}
              icon={ArrowRight}
            >
              Locate Channelizing Agency →
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="text-xs font-semibold text-[#6B7280] hover:text-[#0B3B60] transition-base cursor-pointer"
        >
          ← Back to Matched Schemes
        </button>

        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="text-xs font-semibold text-[#0B3B60] hover:text-[#C77D02] transition-base cursor-pointer"
        >
          Return to Portal Home
        </button>
      </div>
    </div>
  );
}
