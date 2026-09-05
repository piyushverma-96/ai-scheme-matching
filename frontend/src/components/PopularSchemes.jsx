import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Building,
  GraduationCap,
  Users,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from './Card';
import Button from './Button';

export const POPULAR_SCHEMES_DATA = [
  {
    id: 'term_loan',
    name: 'Term Loan Scheme for SC Entrepreneurs',
    category: 'Business / MSME',
    icon: Briefcase,
    badge: 'Popular for Business',
    maxAmount: '₹50,00,000',
    rate: '6.0% – 8.0% p.a.',
    financing: 'Up to 90%',
    tenure: 'Up to 10 Years',
    moratorium: '6–12 Months',
    target: 'Scheduled Caste entrepreneurs establishing industrial, service, or commercial units.',
    projectType: 'business',
    prefillCost: '1500000',
  },
  {
    id: 'education_loan',
    name: 'Education Loan Scheme (Inland & Overseas)',
    category: 'Higher Education',
    icon: GraduationCap,
    badge: '4% Interest Subvention',
    maxAmount: '₹20,00,000',
    rate: '4.0% p.a.',
    financing: 'Up to 90%',
    tenure: 'Up to 10 Years',
    moratorium: 'Course duration + 6 Months',
    target: 'SC students pursuing professional courses (Engineering, Medical, MBA, etc.) in India or Abroad.',
    projectType: 'education',
    prefillCost: '800000',
  },
  {
    id: 'mahila_samriddhi',
    name: 'Mahila Samriddhi Yojana (MSY)',
    category: 'Women Entrepreneurs',
    icon: Users,
    badge: 'Women Special',
    maxAmount: '₹1,40,000',
    rate: '4.0% p.a.',
    financing: 'Up to 100%',
    tenure: 'Up to 3.5 Years',
    moratorium: '3 Months',
    target: 'SC women self-help groups & individual women entrepreneurs for micro-enterprise.',
    projectType: 'business',
    prefillCost: '140000',
  },
  {
    id: 'micro_credit',
    name: 'Micro Credit Finance (MCF)',
    category: 'Small Business',
    icon: Building,
    badge: 'Quick Disbursal',
    maxAmount: '₹1,00,000',
    rate: '5.0% p.a.',
    financing: 'Up to 100%',
    tenure: 'Up to 3 Years',
    moratorium: '3 Months',
    target: 'Small vendors, rural artisans, and service providers for direct income generation.',
    projectType: 'business',
    prefillCost: '100000',
  },
];

export default function PopularSchemes() {
  const { startWizard, navigateTo } = useApp();

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0B3B60]">
            Popular Schemes
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Verified NSFDC welfare schemes tailored for Scheduled Caste applicants
          </p>
        </div>
        <button
          onClick={() => navigateTo('schemes')}
          className="text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#C77D02] transition-base flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>View All Schemes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {POPULAR_SCHEMES_DATA.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.id}
              accent="navy"
              padding="p-5 sm:p-6"
              className="flex flex-col justify-between hover:shadow-md transition-base"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF1F6] text-[#0B3B60] border border-[#0B3B60]/20">
                    <Icon className="w-3 h-3" />
                    {s.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A7F4E] bg-[#E8F7EE] px-2 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                </div>

                {/* Scheme Title */}
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0B3B60] mb-2 leading-snug">
                  {s.name}
                </h3>

                <p className="text-xs text-[#4A5568] mb-4 leading-relaxed line-clamp-2">
                  {s.target}
                </p>

                {/* Metric Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB] mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-[#6B7280] font-medium block">Max Funding</span>
                    <span className="text-xs sm:text-sm font-bold text-[#0B3B60] font-mono tabular-nums">
                      {s.maxAmount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] font-medium block">Interest Rate</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1A7F4E] font-mono tabular-nums">
                      {s.rate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] font-medium block">Max Tenure</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1C1C1C] font-mono tabular-nums">
                      {s.tenure}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={() =>
                    startWizard(1, {
                      project_type: s.projectType,
                      project_cost: s.prefillCost,
                    })
                  }
                  className="w-full py-2 px-3 bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs font-semibold rounded-lg transition-base cursor-pointer flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Check Eligibility</span>
                </button>

                <button
                  onClick={() => navigateTo('calculator')}
                  className="w-full py-2 px-3 bg-white hover:bg-[#EAF1F6] text-[#0B3B60] border border-[#0B3B60] text-xs font-semibold rounded-lg transition-base cursor-pointer flex items-center justify-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculate EMI</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
