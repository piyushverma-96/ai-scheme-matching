import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Table, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

const formatINR = (num) =>
  num != null ? `₹${Number(Math.round(num)).toLocaleString('en-IN')}` : '—';

export default function CalculatorView() {
  const { navigateTo, startWizard } = useApp();

  const [amount, setAmount] = useState(300000);
  const [rate, setRate] = useState(8.0);
  const [tenureYears, setTenureYears] = useState(5);
  const [moratoriumMonths, setMoratoriumMonths] = useState(12);
  const [showSchedule, setShowSchedule] = useState(false);

  // EMI Mathematical calculation
  const totalMonths = tenureYears * 12;
  const repaymentMonths = Math.max(1, totalMonths - moratoriumMonths);
  const monthlyRate = rate / (12 * 100);

  const monthlyEmi =
    monthlyRate === 0
      ? amount / repaymentMonths
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
        (Math.pow(1 + monthlyRate, repaymentMonths) - 1);

  const totalRepayment = monthlyEmi * repaymentMonths;
  const totalInterest = Math.max(0, totalRepayment - amount);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EMI Calculator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Section */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          {/* 1. Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#64748B]">Loan Amount</label>
              <span className="text-base font-bold text-[#0B3B60] font-mono">
                {formatINR(amount)}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
              <span>₹10,000</span>
              <span>₹50,00,000</span>
            </div>
          </div>

          {/* 2. Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#64748B]">Interest Rate (% p.a.)</label>
              <span className="text-base font-bold text-[#0B3B60] font-mono">
                {rate.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.25"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          {/* 3. Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#64748B]">Tenure (Years)</label>
              <span className="text-base font-bold text-[#0B3B60] font-mono">
                {tenureYears}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* 4. Moratorium */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#64748B]">Moratorium (Months)</label>
              <span className="text-base font-bold text-[#0B3B60] font-mono">
                {moratoriumMonths}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="3"
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
              <span>0</span>
              <span>24</span>
            </div>
          </div>
        </div>

        {/* Right Output: "Your EMI Details" Mint Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#E8F8F2] border border-[#10B981]/30 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-[#065F46]">
              Your EMI Details
            </h3>

            <div>
              <span className="text-xs font-medium text-[#047857] block">Monthly EMI</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#065F46] font-mono mt-1">
                {formatINR(monthlyEmi)}
              </div>
            </div>

            <div className="pt-3 border-t border-[#10B981]/20 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#047857]">Total Interest</span>
                <span className="font-bold text-[#065F46] font-mono">
                  {formatINR(totalInterest)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#047857]">Total Amount</span>
                <span className="font-bold text-[#065F46] font-mono">
                  {formatINR(totalRepayment)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: View Amortization Schedule */}
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Table className="w-4 h-4" />
            <span>{showSchedule ? 'Hide Schedule' : 'View Amortization Schedule'}</span>
          </button>

          {/* Amortization Table Accordion */}
          {showSchedule && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-3 animate-in fade-in duration-150 text-xs">
              <h4 className="font-bold text-[#0B3B60]">Repayment Summary Table</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] text-[#64748B]">
                      <th className="py-1.5">Year</th>
                      <th className="py-1.5">Principal</th>
                      <th className="py-1.5">Interest</th>
                      <th className="py-1.5">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] font-mono">
                    {Array.from({ length: tenureYears }).map((_, yIdx) => {
                      const yr = yIdx + 1;
                      const principalYr = Math.round(amount / tenureYears);
                      const interestYr = Math.round(totalInterest / tenureYears);
                      const balance = Math.max(0, amount - principalYr * yr);

                      return (
                        <tr key={yr}>
                          <td className="py-1.5 font-bold">Year {yr}</td>
                          <td className="py-1.5">{formatINR(principalYr)}</td>
                          <td className="py-1.5 text-[#D97706]">{formatINR(interestYr)}</td>
                          <td className="py-1.5 text-[#0B3B60] font-semibold">{formatINR(balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
