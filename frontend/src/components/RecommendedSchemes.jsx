import React from 'react';
import { Landmark, Briefcase, ArrowRight, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SCHEMES_DATA } from '../data/mockData';

export default function RecommendedSchemes({ onSelectScheme }) {
  const { navigateTo, openSchemeDetail } = useApp();

  const handleCardClick = (scheme) => {
    if (onSelectScheme) {
      onSelectScheme(scheme);
    } else {
      openSchemeDetail(scheme);
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0B3B60]">
            Recommended for you
          </h3>
          <p className="text-[11px] text-[#64748B]">
            Based on your profile
          </p>
        </div>

        <button
          onClick={() => navigateTo('schemes')}
          className="text-xs font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SCHEMES_DATA.slice(0, 2).map((scheme, idx) => {
          return (
            <div
              key={scheme.id}
              onClick={() => handleCardClick(scheme)}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-[#E8F8F2] text-[#10B981]'
                          : 'bg-[#EFF6FF] text-[#2563EB]'
                      }`}
                    >
                      {idx === 0 ? (
                        <Landmark className="w-4 h-4 stroke-[2.2]" />
                      ) : (
                        <Briefcase className="w-4 h-4 stroke-[2.2]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0B3B60] group-hover:text-[#2563EB] transition-colors leading-tight">
                        {scheme.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5 leading-tight line-clamp-1">
                        {scheme.fullName}
                      </p>
                    </div>
                  </div>

                  <span className="text-[#94A3B8] group-hover:text-[#0B3B60] transition-colors p-1">
                    <Info className="w-4 h-4" />
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F1F5F9]">
                  <div>
                    <span className="text-[10px] text-[#64748B] block font-medium">Loan Amount</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
                      {scheme.loan_amount_short}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#64748B] block font-medium">Interest Rate</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1E293B]">
                      {scheme.interest_rate_display}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
