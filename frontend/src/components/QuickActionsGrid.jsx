import React from 'react';
import {
  Calculator,
  Building2,
  FileSearch,
  MessageSquareText,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function QuickActionsGrid({ onTrackClick }) {
  const { navigateTo, setAiAssistantOpen } = useApp();

  const actions = [
    {
      id: 'calculator',
      title: 'Calculate EMI',
      desc: 'Calculate your loan EMI and total repayment',
      linkText: 'Calculate',
      icon: Calculator,
      iconBg: 'bg-[#E8F8F2]',
      iconColor: 'text-[#10B981]',
      linkColor: 'text-[#10B981] hover:text-[#059669]',
      onClick: () => navigateTo('calculator'),
    },
    {
      id: 'partners',
      title: 'Find Partner',
      desc: 'Find nearest eligible channel partner',
      linkText: 'Find Now',
      icon: Building2,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#7C3AED]',
      linkColor: 'text-[#7C3AED] hover:text-[#6D28D9]',
      onClick: () => navigateTo('partners'),
    },
    {
      id: 'tracking',
      title: 'Track Application',
      desc: 'Track your application status',
      linkText: 'Track Now',
      icon: FileSearch,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
      linkColor: 'text-[#D97706] hover:text-[#B45309]',
      onClick: () => {
        if (onTrackClick) onTrackClick();
        else navigateTo('tracking');
      },
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      desc: 'Ask anything about schemes',
      linkText: 'Ask Now',
      icon: MessageSquareText,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
      linkColor: 'text-[#2563EB] hover:text-[#1D4ED8]',
      onClick: () => setAiAssistantOpen(true),
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm sm:text-base font-bold text-[#0B3B60]">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.onClick}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3">
                <div
                  className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1E293B] group-hover:text-[#0B3B60] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div
                className={`pt-3 mt-3 border-t border-[#F8FAFC] flex items-center justify-between text-xs font-semibold ${item.linkColor}`}
              >
                <span>{item.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
