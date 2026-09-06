import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  Check,
  Bookmark,
  Building2,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  FileCheck2,
  Info,
  ShieldCheck,
  X,
  Sparkles,
  Search,
  Award,
  Calculator,
  Compass,
  FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { SCHEMES_DATA } from '../data/mockData';

export default function HomeView() {
  const { t } = useTranslation();
  const {
    navigateTo,
    startJourney,
    journeyStep = 1,
    setAiAssistantOpen,
    savedSchemeIds = [],
    toggleSaveScheme,
    user,
    profile,
    userApplications = [],
  } = useApp();

  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  // Dynamic user name from real profile / Supabase Auth
  const userFirstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    t('header.guest', 'Beneficiary');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting_morning', 'Good morning');
    if (hour < 17) return t('dashboard.greeting_afternoon', 'Good afternoon');
    return t('dashboard.greeting_evening', 'Good evening');
  };

  // Active step info (1 to 6)
  const currentStepNum = Math.min(6, Math.max(1, journeyStep || 1));
  const progressPct = Math.round((currentStepNum / 6) * 100);

  const stepTitles = [
    t('stepper.step1_title', 'Understand User Need'),
    t('stepper.step2_title', 'Identify Eligible Schemes'),
    t('stepper.step3_title', 'Recommend the Best Scheme'),
    t('stepper.step4_title', 'Calculate Financial Impact'),
    t('stepper.step5_title', 'Find the Right Application Channel'),
    t('stepper.step6_title', 'Guide the Application'),
  ];

  const currentStepName = stepTitles[currentStepNum - 1] || t('stepper.step1_title', 'Understand User Need');

  // 6 Steps definition for the Journey Timeline
  const SIX_STEPS = [
    {
      num: 1,
      id: 'step_1',
      title: t('stepper.step1_title', 'Understand User Need'),
      desc: t('stepper.step1_desc', 'Tell us about your purpose, income, required amount and location.'),
      icon: Search,
    },
    {
      num: 2,
      id: 'step_2',
      title: t('stepper.step2_title', 'Identify Eligible Schemes'),
      desc: t('stepper.step2_desc', 'We check schemes you may be eligible for based on your details.'),
      icon: ShieldCheck,
    },
    {
      num: 3,
      id: 'step_3',
      title: t('stepper.step3_title', 'Recommend the Best Scheme'),
      desc: t('stepper.step3_desc', 'We recommend the most suitable scheme and explain why.'),
      icon: Award,
    },
    {
      num: 4,
      id: 'step_4',
      title: t('stepper.step4_title', 'Calculate Financial Impact'),
      desc: t('stepper.step4_desc', 'Understand financial assistance, eligible support, and repayment impact.'),
      icon: Calculator,
    },
    {
      num: 5,
      id: 'step_5',
      title: t('stepper.step5_title', 'Find the Right Application Channel'),
      desc: t('stepper.step5_desc', 'Find the designated channel partner or direct official government portal.'),
      icon: Compass,
    },
    {
      num: 6,
      id: 'step_6',
      title: t('stepper.step6_title', 'Guide the Application'),
      desc: t('stepper.step6_desc', 'Complete scheme-specific documents, submit application and track progress.'),
      icon: FileText,
    },
  ];

  // Dynamic status for each of the 6 steps based on user's real progress
  const getStepStatus = (stepNum) => {
    if (stepNum < currentStepNum) return 'completed';
    if (stepNum === currentStepNum) return 'in_progress';
    return 'upcoming';
  };

  // Only verified NSFDC schemes saved by this specific user
  const savedSchemes = SCHEMES_DATA.filter((s) => savedSchemeIds.includes(s.id));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ── TOP SECTION: WELCOME HERO + PROGRESS CARD ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Hero Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 max-w-xl z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
              {getGreeting()}, {userFirstName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {t('dashboard.hero_desc', 'We help you identify the right government financial schemes and guide you through the official 6-step application process for verified government support.')}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => startJourney(currentStepNum)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0E6655] hover:bg-[#0B5345] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{currentStepNum > 1 ? t('dashboard.continue_journey', 'Continue Journey') : t('dashboard.start_journey', 'Start My Journey')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setHowItWorksOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-slate-50 text-[#0B3B60] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Play className="w-3.5 h-3.5 fill-[#0B3B60] text-[#0B3B60]" />
                <span>{t('dashboard.how_it_works', 'How It Works')}</span>
              </button>
            </div>
          </div>

          {/* Clean Stepper Illustration on the right */}
          <div className="hidden sm:flex absolute right-4 bottom-2 opacity-90 pointer-events-none items-end">
            <svg
              className="w-48 h-36 text-[#0E6655]/15"
              viewBox="0 0 200 150"
              fill="currentColor"
            >
              {/* Stepped mountain illustration */}
              <rect x="10" y="110" width="30" height="30" rx="4" fill="#E8F8F2" stroke="#10B981" strokeWidth="1.5" />
              <rect x="50" y="85" width="30" height="55" rx="4" fill="#D1F2E6" stroke="#10B981" strokeWidth="1.5" />
              <rect x="90" y="60" width="30" height="80" rx="4" fill="#A3E4D7" stroke="#0E6655" strokeWidth="1.5" />
              <rect x="130" y="35" width="30" height="105" rx="4" fill="#0E6655" fillOpacity="0.8" />
              <circle cx="145" cy="20" r="7" fill="#0B3B60" />
              <path d="M145 27 L145 35" stroke="#0B3B60" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Right Progress Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {t('dashboard.your_progress', 'Your Progress')}
              </span>
              <span className="text-xs font-bold text-[#0E6655] bg-[#E8F8F2] px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                {t('stepper.step', 'Step')} {currentStepNum} {t('stepper.of', 'of')} 6
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-[#0B3B60]">{currentStepName}</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                {currentStepNum > 1
                  ? t('dashboard.keep_going', "Keep going! You're making real progress.")
                  : t('dashboard.start_step1', 'Start Step 1 to unlock eligible government schemes.')}
              </p>
            </div>

            {/* Real Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-semibold text-[#64748B]">
                <span>{t('dashboard.progress', 'Progress')}</span>
                <span className="text-[#0E6655] font-bold">{progressPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0E6655] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startJourney(currentStepNum)}
            className="w-full py-2.5 rounded-xl border border-[#0E6655] text-[#0E6655] hover:bg-[#E8F8F2] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 min-h-[44px]"
          >
            <span>{t('dashboard.continue_journey', 'Continue Journey')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── CENTER SECTION: YOUR 6-STEP JOURNEY ─────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
            {t('dashboard.journey_section_title', 'Your 6-Step Journey')}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {t('dashboard.journey_section_sub', 'Follow these steps to find the right scheme and complete your application.')}
          </p>
        </div>

        {/* 6 Step Cards: Horizontal on Desktop, Vertical Stack on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative">
          {SIX_STEPS.map((step) => {
            const status = getStepStatus(step.num);
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in_progress';
            const isUpcoming = status === 'upcoming';

            return (
              <div
                key={step.id}
                onClick={() => startJourney(step.num)}
                className={`bg-white rounded-2xl p-4 sm:p-4.5 border transition-all flex flex-col justify-between cursor-pointer group relative shadow-2xs hover:shadow-md ${
                  isInProgress
                    ? 'border-[#0E6655] ring-2 ring-[#0E6655]/15 shadow-sm'
                    : isCompleted
                    ? 'border-[#A3E4D7] bg-[#F9FEFB]'
                    : 'border-[#E2E8F0] hover:border-[#0B3B60]/40'
                }`}
              >
                {/* Step Circle & Status Header */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                      isCompleted
                        ? 'bg-[#E8F8F2] text-[#0E6655] border border-[#10B981]'
                        : isInProgress
                        ? 'bg-[#0E6655] text-white shadow-xs'
                        : 'bg-slate-100 text-[#64748B] border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span>{step.num}</span>
                    )}
                  </div>

                  {/* Connected Track Indicator on desktop */}
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{step.num}
                  </span>
                </div>

                {/* Step Content */}
                <div className="space-y-1.5 mb-4">
                  <h4
                    className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${
                      isInProgress
                        ? 'text-[#0E6655]'
                        : isCompleted
                        ? 'text-[#0B3B60]'
                        : 'text-[#1E293B] group-hover:text-[#0B3B60]'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#64748B] leading-normal line-clamp-3">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Status Pill */}
                <div>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2 py-0.5 rounded-md border border-[#10B981]/30">
                      <span>{t('dashboard.status_completed', 'Completed')}</span>
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0E6655] bg-[#D1F2E6] px-2 py-0.5 rounded-md border border-[#0E6655]/30">
                      <span>{t('dashboard.status_in_progress', 'In Progress')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {t('dashboard.status_upcoming', 'Upcoming')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM SECTION: APPLICATIONS, SAVED SCHEMES & NEED HELP? ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Your Applications Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-sm sm:text-base font-bold text-[#0B3B60] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0E6655]" />
                <span>{t('dashboard.your_applications', 'Your Applications')}</span>
              </h4>
              <button
                type="button"
                onClick={() => navigateTo('tracking')}
                className="text-xs font-bold text-[#0E6655] hover:underline cursor-pointer"
              >
                {t('dashboard.view_all', 'View All')}
              </button>
            </div>

            {userApplications.length === 0 ? (
              <div className="py-7 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1] space-y-2.5">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B]">{t('dashboard.no_apps_title', 'No applications yet')}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {t('dashboard.no_apps_desc', 'Start your 6-step journey to find a suitable scheme and apply.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startJourney(1)}
                  className="px-3.5 py-1.5 bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-block"
                >
                  {t('dashboard.start_journey', 'Start My Journey')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigateTo('tracking')}
                    className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-[#0E6655]/40 hover:bg-[#F9FEFB] transition-all cursor-pointer space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#0B3B60]">{app.scheme_name}</h5>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {t('dashboard.app_id', 'ID')}: {app.application_number}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          app.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : app.status === 'Documents Required'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : app.status === 'Submitted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">{t('dashboard.submitted_date', 'Submitted')}</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(app.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t('dashboard.current_step', 'Current Step')}</span>
                        <span className="font-semibold text-slate-700">{app.status}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                        <span className="text-slate-400 block">{t('dashboard.partner', 'Partner')}</span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {app.partner_name || 'Lead Partner'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Saved Schemes Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-sm sm:text-base font-bold text-[#0B3B60] flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#0E6655]" />
                <span>{t('dashboard.saved_schemes', 'Saved Schemes')}</span>
              </h4>
              <button
                type="button"
                onClick={() => navigateTo('schemes')}
                className="text-xs font-bold text-[#0E6655] hover:underline cursor-pointer"
              >
                {t('dashboard.browse_all', 'Browse All')}
              </button>
            </div>

            {savedSchemes.length === 0 ? (
              <div className="py-7 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1] space-y-2.5">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B]">{t('dashboard.no_saved_title', 'No saved schemes yet')}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {t('dashboard.no_saved_desc', 'Bookmark schemes during your journey or browse verified NSFDC schemes.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('schemes')}
                  className="px-3.5 py-1.5 border border-[#CBD5E1] hover:bg-white text-[#0B3B60] text-xs font-bold rounded-xl transition-all cursor-pointer inline-block"
                >
                  {t('dashboard.browse_schemes', 'Browse Schemes')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-[#0E6655]/40 hover:bg-[#F9FEFB] transition-all flex items-center justify-between gap-3 shadow-2xs group"
                  >
                    <div
                      onClick={() => navigateTo('schemes')}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#0B3B60] group-hover:text-[#0E6655] transition-colors">
                          {scheme.name}
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          {scheme.interest_rate_display} • {scheme.loan_amount_short}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Toggle Saved Scheme"
                      onClick={() => toggleSaveScheme(scheme.id)}
                      className="text-[#0E6655] p-1.5 hover:bg-[#E8F8F2] rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Bookmark className="w-4 h-4 fill-[#0E6655]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Need Help? Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm sm:text-base font-bold text-[#0B3B60]">{t('dashboard.need_help', 'Need Help?')}</h4>
            <h5 className="text-xs font-bold text-slate-800">{t('dashboard.ask_assistant', 'Ask ArthSetu Assistant')}</h5>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {t('dashboard.ask_desc', 'Get instant answers to your questions about verified NSFDC schemes, eligibility criteria, required documents, and empanelled channel partners.')}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setAiAssistantOpen(true)}
              className="px-4 py-2.5 bg-[#0E6655] hover:bg-[#0B5345] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <span>{t('dashboard.ask_now', 'Ask Now')}</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            {/* AI Assistant Avatar Illustration */}
            <div className="w-12 h-12 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center shrink-0 border border-[#10B981]/30">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER TRUST NOTE ────────────────────────────────────────────────── */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#E2E8F0] flex items-center gap-3 text-[11px] text-[#64748B]">
        <Info className="w-4 h-4 text-[#0B3B60] shrink-0" />
        <span>
          {t('dashboard.trust_footer', 'The information and guidance provided are based on verified NSFDC scheme guidelines. Official sanction and disbursement are subject to partner bank verification.')}
        </span>
      </div>

      {/* ── HOW IT WORKS MODAL ──────────────────────────────────────────────── */}
      {howItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
                {t('dashboard.how_modal_title', 'How ArthSetu Works — 6-Step Journey')}
              </h3>
              <button
                type="button"
                onClick={() => setHowItWorksOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              {SIX_STEPS.map((step) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#E8F8F2] text-[#0E6655] font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 border border-[#10B981]/30">
                    {step.num}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#1E293B]">{step.title}</h5>
                    <p className="text-xs text-[#64748B] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setHowItWorksOpen(false);
                  startJourney(currentStepNum);
                }}
                className="px-5 py-2 rounded-xl bg-[#0E6655] hover:bg-[#0B5345] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {t('dashboard.continue_journey', 'Continue Journey →')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
