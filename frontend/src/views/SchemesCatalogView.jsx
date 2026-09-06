import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Landmark,
  Briefcase,
  ArrowRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SCHEMES_DATA } from '../data/mockData';

export default function SchemesCatalogView() {
  const { navigateTo, openSchemeDetail } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'business' | 'women'

  const filtered = SCHEMES_DATA.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.fullName.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'business' && s.category.includes('Business')) ||
      (filter === 'women' && s.category.includes('Women'));
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer min-h-[44px] px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Header Info */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0B3B60]">
          Recommended Schemes
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Based on the information you provided
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by name..."
            className="w-full h-11 pl-11 pr-4 bg-white rounded-2xl border border-[#E2E8F0] text-xs sm:text-sm outline-none focus:border-[#0B3B60] shadow-xs"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'business', label: 'Business' },
            { id: 'women', label: 'Women Special' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] flex items-center shrink-0 ${
                filter === item.id
                  ? 'bg-[#0B3B60] text-white'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((scheme, idx) => (
          <div
            key={scheme.id}
            onClick={() => openSchemeDetail(scheme)}
            className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      idx % 2 === 0
                        ? 'bg-[#E8F8F2] text-[#10B981]'
                        : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}
                  >
                    {idx % 2 === 0 ? (
                      <Landmark className="w-5 h-5 stroke-[2]" />
                    ) : (
                      <Briefcase className="w-5 h-5 stroke-[2]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B3B60] group-hover:text-[#2563EB] transition-colors leading-tight">
                      {scheme.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                      {scheme.fullName}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#10B981] bg-[#E8F8F2] px-2.5 py-0.5 rounded-full shrink-0">
                  {scheme.badge}
                </span>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed mb-4 line-clamp-2">
                {scheme.short_description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] mb-4 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">Loan Limit</span>
                  <span className="font-bold text-[#1E293B] font-mono">
                    {scheme.loan_amount_short}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-medium">Interest Rate</span>
                  <span className="font-bold text-[#1E293B] font-mono">
                    {scheme.interest_rate_display}
                  </span>
                </div>
              </div>

              {/* Why this matches checklist */}
              <div className="space-y-1.5 pb-2 text-[11px]">
                {scheme.why_matched?.slice(0, 2).map((reason, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-2 text-[#065F46]">
                    <span className="font-bold">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#0B3B60] group-hover:text-[#2563EB]">
              <span>View Scheme Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
