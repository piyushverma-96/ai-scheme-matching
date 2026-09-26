import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  FileCheck2,
  Sparkles,
  Calculator,
  MapPin,
  FileText,
  User,
  HelpCircle,
  Home,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { t } = useTranslation();
  const {
    currentView,
    navigateTo,
    startJourney,
    journeyStep = 1,
    sidebarOpen,
    setSidebarOpen,
    user,
  } = useApp();

  // Helper to determine step status for 6-step journey (Steps 1 to 6)
  const getStepStatus = (stepNum) => {
    if (journeyStep > stepNum) return 'completed';
    if (journeyStep === stepNum) return 'current';
    return 'future';
  };

  // Primary 8 navigation items per specification
  const primaryNav = [
    {
      id: 'dashboard',
      number: '01',
      label: t('sidebar.dashboard', 'Dashboard'),
      icon: LayoutDashboard,
      action: () => navigateTo('dashboard'),
      isActive:
        currentView === 'dashboard' ||
        currentView === 'tracking' ||
        currentView === 'my_applications',
      isJourneyStep: false,
    },
    {
      id: 'step_1_need',
      number: '02',
      stepNum: 1,
      label: t('sidebar.understand_need', 'Understand Your Need'),
      icon: UserCheck,
      action: () => startJourney(1),
      isActive:
        (currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme') &&
        journeyStep === 1,
      isJourneyStep: true,
      stepStatus: getStepStatus(1),
    },
    {
      id: 'step_2_schemes',
      number: '03',
      stepNum: 2,
      label: t('sidebar.eligible_schemes', 'Eligible Schemes'),
      icon: FileCheck2,
      action: () => startJourney(2),
      isActive:
        ((currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme') &&
          journeyStep === 2) ||
        currentView === 'schemes' ||
        currentView === 'eligibility' ||
        currentView === 'eligibility_result',
      isJourneyStep: true,
      stepStatus: getStepStatus(2),
    },
    {
      id: 'step_3_best_match',
      number: '04',
      stepNum: 3,
      label: t('sidebar.best_match', 'Best Match'),
      icon: Sparkles,
      action: () => startJourney(3),
      isActive:
        (currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme') &&
        journeyStep === 3,
      isJourneyStep: true,
      stepStatus: getStepStatus(3),
    },
    {
      id: 'step_4_financial_impact',
      number: '05',
      stepNum: 4,
      label: t('sidebar.financial_impact', 'Financial Impact'),
      icon: Calculator,
      action: () => startJourney(4),
      isActive:
        ((currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme') &&
          journeyStep === 4) ||
        currentView === 'calculator',
      isJourneyStep: true,
      stepStatus: getStepStatus(4),
    },
    {
      id: 'step_5_channel_partners',
      number: '06',
      stepNum: 5,
      label: t('sidebar.channel_partners', 'Channel Partners'),
      icon: MapPin,
      action: () => startJourney(5),
      isActive:
        ((currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme') &&
          journeyStep === 5) ||
        currentView === 'partners',
      isJourneyStep: true,
      stepStatus: getStepStatus(5),
    },
    {
      id: 'step_6_application_guidance',
      number: '07',
      stepNum: 6,
      label: t('sidebar.application_guidance', 'Application Guidance'),
      icon: FileText,
      action: () => startJourney(6),
      isActive:
        ((currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme') &&
          journeyStep === 6) ||
        currentView === 'documents',
      isJourneyStep: true,
      stepStatus: getStepStatus(6),
    },
    {
      id: 'profile',
      number: '08',
      label: t('sidebar.profile', 'Profile'),
      icon: User,
      action: () => navigateTo('profile'),
      isActive: currentView === 'profile' || currentView === 'settings',
      isJourneyStep: false,
    },
  ];

  // Secondary navigation items
  const secondaryNav = [
    {
      id: 'faqs',
      label: t('sidebar.faqs', 'FAQs'),
      icon: HelpCircle,
      action: () => navigateTo('help_trust'),
      isActive: currentView === 'help_trust' || currentView === 'faq',
    },
    {
      id: 'home_page',
      label: t('sidebar.home_page', 'Home Page'),
      icon: Home,
      action: () => {
        navigateTo('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      isActive: currentView === 'home',
    },
  ];

  const handleNavClick = (action) => {
    action();
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main SaaS Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen max-h-screen w-[265px] md:w-[245px] lg:w-[265px] bg-[#FAFCFB]/95 backdrop-blur-xl bg-grain border-r border-[#E2E8F0]/80 z-50 lg:z-30 flex flex-col justify-between py-5 px-3.5 sm:px-4 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Application Navigation"
      >
        <div className="space-y-4">
          {/* Top Header: UdyamNex Logo + Tagline */}
          <div className="flex items-center justify-between px-1.5 pb-4 border-b border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => {
                navigateTo('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer transition-transform active:scale-95 group"
              aria-label="UdyamNex Dashboard"
            >
              {/* Existing UdyamNex SVG Logo */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform group-hover:scale-105 duration-200"
                >
                  <path
                    d="M6 26C11 16 29 16 34 26"
                    stroke="#0B3B60"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 28C14 14 26 8 32 10C34 16 28 26 18 29"
                    fill="#10B981"
                    fillOpacity="0.88"
                  />
                  <path
                    d="M16 24C19 17 26 13 30 14"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 29C15 29 25 29 32 29"
                    stroke="#0B3B60"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="font-sans font-bold tracking-tight text-[#0B3B60] text-lg leading-tight">
                  UdyamNex
                </span>
                <span className="text-[10px] font-medium text-[#64748B] leading-tight mt-0.5">
                  Right Scheme. Real Support.
                </span>
              </div>
            </button>

            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 6-Step Journey Progress Strip Banner */}
          <div className="px-2 pt-1 pb-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E6655]" />
                <span>6-Step Application</span>
              </span>
              <span className="font-mono text-[#0E6655] font-bold">
                Step {Math.min(6, Math.max(1, journeyStep))}/6
              </span>
            </div>
          </div>

          {/* Primary Navigation Items (01 - 08) */}
          <nav className="space-y-1.5" aria-label="Main Application Links">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.action)}
                  className={`group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 cursor-pointer min-h-[44px] text-left ${
                    isActive
                      ? 'bg-[#E8F8F2] text-[#0E6655] font-semibold shadow-[0_1px_3px_rgba(14,102,85,0.08)] ring-1 ring-[#0E6655]/15'
                      : 'text-[#475569] hover:bg-slate-100/70 hover:text-[#0E6655]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Line Icon with smooth hover micro-interaction */}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#0E6655]' : 'text-[#64748B] group-hover:text-[#0E6655]'
                    }`}
                  />

                  {/* 2-Digit Index Number */}
                  <span
                    className={`font-mono text-[11px] font-semibold shrink-0 transition-colors ${
                      isActive ? 'text-[#0E6655]/80' : 'text-[#94A3B8] group-hover:text-[#0E6655]/70'
                    }`}
                  >
                    {item.number}
                  </span>

                  {/* Item Label */}
                  <span className="flex-1 truncate tracking-tight text-[13px] font-medium leading-snug">
                    {item.label}
                  </span>

                  {/* 6-Step Journey Indicator (For items 02 to 07) */}
                  {item.isJourneyStep && (
                    <span className="shrink-0 flex items-center justify-center font-mono">
                      {item.stepStatus === 'completed' && (
                        <span
                          title={t('sidebar.completed', 'Completed')}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-[#10B981] bg-[#E8F8F2] border border-[#10B981]/30 transition-transform group-hover:scale-105"
                        >
                          ✓
                        </span>
                      )}
                      {item.stepStatus === 'current' && (
                        <span
                          title={t('sidebar.current_step', 'Current Step')}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-[#0E6655] bg-[#D1F2E5] border border-[#0E6655]/30 animate-pulse"
                        >
                          →
                        </span>
                      )}
                      {item.stepStatus === 'future' && (
                        <span
                          title={t('sidebar.upcoming', 'Upcoming')}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-slate-300"
                        >
                          ○
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Thin Separator */}
          <div className="pt-2">
            <div className="border-t border-[#F1F5F9]" />
          </div>

          {/* Secondary Navigation (FAQs & Home Page) */}
          <div className="space-y-1" aria-label="Secondary Links">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('sidebar.more', 'Support & Overview')}
            </div>

            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.action)}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 cursor-pointer min-h-[42px] text-left ${
                    isActive
                      ? 'bg-[#E8F8F2] text-[#0E6655] font-semibold shadow-[0_1px_3px_rgba(14,102,85,0.08)] ring-1 ring-[#0E6655]/15'
                      : 'text-[#64748B] hover:bg-slate-100/70 hover:text-[#0E6655]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#0E6655]' : 'text-[#94A3B8] group-hover:text-[#0E6655]'
                    }`}
                  />
                  <span className="flex-1 truncate tracking-tight text-[13px] font-medium">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Safety & Verified Standards Card */}
        <div className="pt-4 mt-6 border-t border-[#F1F5F9]">
          <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0]/70 rounded-2xl p-3 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-[#0E6655] font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#0E6655] shrink-0" />
              <span>{t('nav.trust_title', 'Your Information is Safe')}</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {t(
                'nav.trust_desc',
                'Protected by official government security standards for verified scheme delivery.'
              )}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
