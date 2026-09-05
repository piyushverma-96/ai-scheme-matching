import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  ShieldCheck,
  ListOrdered,
  Calculator,
  FolderLock,
  MapPin,
  Send,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HowItWorks() {
  const { startWizard, navigateTo } = useApp();

  const steps = [
    {
      step: 1,
      title: '1. Create Profile',
      desc: 'Tell us about your business and funding needs',
      icon: User,
      action: () => startWizard(1),
    },
    {
      step: 2,
      title: '2. Check Eligibility',
      desc: 'We match your profile with eligible schemes',
      icon: ShieldCheck,
      action: () => startWizard(1),
    },
    {
      step: 3,
      title: '3. Get Recommendations',
      desc: 'View and compare the best matching schemes',
      icon: ListOrdered,
      action: () => navigateTo('schemes'),
    },
    {
      step: 4,
      title: '4. Calculate Benefits',
      desc: 'Use calculator to estimate EMI & interest savings',
      icon: Calculator,
      action: () => navigateTo('calculator'),
    },
    {
      step: 5,
      title: '5. Get Documents',
      desc: 'See required documents for each scheme',
      icon: FolderLock,
      action: () => navigateTo('documents'),
    },
    {
      step: 6,
      title: '6. Find Partner',
      desc: 'Locate nearest state channelizing partners',
      icon: MapPin,
      action: () => navigateTo('partners'),
    },
    {
      step: 7,
      title: '7. Apply',
      desc: 'Get application guidance and apply',
      icon: Send,
      action: () => navigateTo('guidance'),
    },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0B3B60]">
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            A seamless 7-step journey from eligibility check to loan disbursal
          </p>
        </div>
      </div>

      {/* Steps cards grid with horizontal scroll on small screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.step}
              onClick={item.action}
              className="bg-white hover:bg-[#F7F9FB] border border-[#E5E7EB] hover:border-[#0B3B60]/40 rounded-xl p-3.5 text-center flex flex-col items-center justify-start shadow-2xs hover:shadow-xs transition-base cursor-pointer group relative"
            >
              {/* Icon badge */}
              <div className="w-10 h-10 rounded-full bg-[#EAF1F6] text-[#0B3B60] group-hover:bg-[#0B3B60] group-hover:text-white transition-base flex items-center justify-center mb-2.5 shrink-0">
                <Icon className="w-4 h-4" />
              </div>

              {/* Title & Desc */}
              <h3 className="text-xs font-bold text-[#1C1C1C] leading-snug mb-1 group-hover:text-[#0B3B60]">
                {item.title}
              </h3>
              <p className="text-[11px] text-[#6B7280] leading-tight">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
