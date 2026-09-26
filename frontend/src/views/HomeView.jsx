import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  Sparkles,
  Search,
  Award,
  Calculator,
  Compass,
  FileText,
  ShieldCheck,
  Lock,
  Cpu,
  Building2,
  MapPin,
  Users,
  Zap,
  Layers,
  FileCheck2,
  HelpCircle,
  Info,
  ExternalLink,
  Bot,
  Scale,
  Brain,
  MessageSquare,
  BadgeCheck,
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
    user,
    profile,
    userApplications = [],
  } = useApp();

  // FAQ Accordion State (open question index, default 0 open)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Dynamic user name from real profile / Supabase Auth
  const userFirstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Beneficiary';

  // Active step info (1 to 6)
  const currentStepNum = Math.min(6, Math.max(1, journeyStep || 1));

  // Dynamic verified counts from ground truth database
  const verifiedSchemesCount = SCHEMES_DATA?.length || 5;
  const verifiedPartnersCount = 38; // Real State Channelizing Agencies (from data/verified_partners_seed.json)

  // 6 Workflow Steps (Outcome-neutral, strict compliance with non-guaranteed claims)
  const WORKFLOW_STEPS = [
    {
      num: 1,
      title: 'Understand Your Need',
      desc: 'Tell us about your goals, business or education needs in plain Hindi or English.',
      icon: Users,
    },
    {
      num: 2,
      title: 'Find Eligible Schemes',
      desc: 'Our rule engine checks your eligibility with verified government gazette data.',
      icon: Search,
    },
    {
      num: 3,
      title: 'Get Best Recommendation',
      desc: 'We suggest the most suitable schemes for you with transparent match factor breakdown.',
      icon: Award,
    },
    {
      num: 4,
      title: 'Calculate Financial Impact',
      desc: 'Know your benefits, loan amount, subsidized EMI, and repayment schedule.',
      icon: Calculator,
    },
    {
      num: 5,
      title: 'Locate Channel Partner',
      desc: 'Find the authorized State Channelizing Agency or bank branch in your district.',
      icon: MapPin,
    },
    {
      num: 6,
      title: 'Guide the Application',
      desc: 'Structured checklist, document verification guidance, and official portal handoff.',
      icon: FileCheck2,
    },
  ];

  // 6 Core Capabilities
  const CORE_CAPABILITIES = [
    {
      icon: ShieldCheck,
      title: 'Verified Scheme Data',
      desc: 'Every scheme rule, interest rate, and subsidy ceiling is directly sourced from official Ministry and NSFDC gazettes with full policy transparency and zero fabricated terms.',
      tag: 'Gazette Verified',
    },
    {
      icon: Cpu,
      title: 'Deterministic Eligibility Engine',
      desc: 'Eligibility is calculated strictly by mathematical logic and statutory policy rules. We verify caste qualification, income ceilings (≤ ₹5 Lakh), and project scale with zero hallucinations.',
      tag: 'Sole Authority',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      desc: 'Express your goals naturally in everyday Hindi, English, or mixed dialects. Our Natural Language Understanding maps your exact profile to the most advantageous scheme.',
      tag: 'Bilingual NLU',
    },
    {
      icon: Calculator,
      title: 'Financial Impact Calculator',
      desc: 'Simulate monthly installments under concessional interest rates (6.0% - 8.0%), calculate moratorium periods up to 12 months, and see your exact savings compared to commercial loans.',
      tag: 'Concessional Rates',
    },
    {
      icon: Building2,
      title: 'Channel Partner Locator',
      desc: 'Find official State Channelizing Agencies (SCAs) and empanelled nodal bank branches across all 36 States & UTs with verified addresses and liaison contacts.',
      tag: '38 Apex SCAs',
    },
    {
      icon: FileText,
      title: 'Application Guidance',
      desc: 'Get a personalized document readiness checklist, step-by-step application instructions, and direct handoff to official state portals like PM-SURAJ without intermediary fees.',
      tag: 'Zero Brokerage',
    },
  ];

  // 8 FAQs from the Brief (Verbatim answers avoiding overclaiming)
  const FAQS = [
    {
      q: 'Does UdyamNex guarantee loan approval or financial outcomes?',
      a: 'No. UdyamNex provides scheme recommendations and application guidance based on official eligibility guidelines. Final approval and sanction depend entirely on the authorized channel partner (State Channelizing Agency or bank) following formal document verification and credit appraisal.',
    },
    {
      q: 'What government schemes are covered on UdyamNex?',
      a: 'UdyamNex currently features verified concessional credit schemes directly from the National Scheduled Castes Finance and Development Corporation (NSFDC), Ministry of Social Justice and Empowerment. All scheme criteria, interest rates, and loan limits are verified against official government gazettes.',
    },
    {
      q: 'Is UdyamNex free to use?',
      a: 'Yes, UdyamNex is 100% free and open. There are no application fees, intermediary charges, or hidden commissions for exploring schemes, calculating financial impact, or accessing application guidance.',
    },
    {
      q: 'How does the AI matching work?',
      a: 'Our deterministic rule engine evaluates statutory criteria (caste eligibility, annual income ceiling, project scale, and activity purpose) with zero hallucinations. The AI assistant then translates complex scheme guidelines into simple, personalized explanations in your preferred language.',
    },
    {
      q: 'Who decides my eligibility — the AI or official rules?',
      a: 'Rules decide. AI explains. Scheme eligibility is calculated strictly by deterministic mathematical and policy rule checks matching official NSFDC guidelines. The AI is used exclusively for natural language understanding and explaining recommendations.',
    },
    {
      q: 'What documents are required to apply?',
      a: 'Standard requirements include a valid Caste Certificate issued by competent revenue authority, Family Income Certificate or Self-Declaration (within ₹5 Lakh/year limit), Aadhaar Card linked to mobile, Bank Account Passbook, and a basic Project Cost Estimate or Quotation.',
    },
    {
      q: 'How do I connect with my local Channel Partner?',
      a: 'UdyamNex includes a State Channelizing Agency (SCA) directory. After finding your eligible scheme, you can locate authorized state SC finance corporations and partner bank nodal branches in your state/district with address and contact details.',
    },
    {
      q: 'Is my personal information secure?',
      a: 'Yes. UdyamNex follows privacy-by-design principles. We do not store sensitive passwords or Aadhaar biometric data. Your self-declared information is processed strictly to assess scheme compatibility and generate your personalized application checklist.',
    },
  ];

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-16 animate-in fade-in duration-300">
      {/* ── LOGGED-IN QUICK RESUME BANNER (If user is signed in) ─────────────── */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-10 sm:-mb-16 pt-4">
          <div className="bg-white border border-[#A3E4D7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0B3B60]">
                  Welcome back, {userFirstName}! You are on Step {currentStepNum} of 6
                </p>
                <p className="text-[11px] text-[#64748B]">
                  {currentStepNum > 1
                    ? 'Resume your scheme application journey where you left off.'
                    : 'Start Step 1 to discover verified NSFDC government schemes for your business.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startJourney(currentStepNum)}
              className="px-4 py-2 bg-[#0E6655] hover:bg-[#0B5345] text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>{currentStepNum > 1 ? 'Resume Journey' : 'Start Journey'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 1: HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 lg:pt-14 pb-8">
        {/* Soft Background Radial Glow */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Hero Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
              {/* Feature Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F8F2] border border-[#10B981]/30 text-[#0E6655] text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0E6655]" />
                <span>AI-Powered Scheme Matching</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0B3B60] tracking-tight leading-[1.12]">
                Your Idea. Our AI.{' '}
                <span className="text-[#0E6655] block sm:inline">
                  Government Support.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-[#64748B] leading-relaxed max-w-xl">
                UdyamNex helps marginalized entrepreneurs find the right government schemes, connect with trusted partners, and turn their ideas into successful businesses.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => startJourney(1)}
                  className="px-6 py-3.5 rounded-full bg-[#0E6655] hover:bg-[#0B5345] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
                >
                  <span>Find Your Scheme</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#0B3B60] font-semibold text-sm border border-[#CBD5E1] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] shadow-2xs"
                >
                  <span>How It Works</span>
                </button>
              </div>

              {/* Trust Indicators (Direct from brief) */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs font-semibold text-[#475569]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0E6655]" />
                  <span>Verified Government Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0E6655]" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0E6655]" />
                  <span>For Marginalized Entrepreneurs</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual & 4 Interactive Floating Cards (5 Cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
              {/* Circular Backdrop Aura with Contour and Growth Arrow */}
              <div className="relative w-72 sm:w-96 md:w-[420px] aspect-square rounded-full bg-gradient-to-tr from-emerald-100/60 via-teal-50 to-white flex items-center justify-center shadow-inner border border-emerald-100">
                {/* Growth trend arrow swoosh */}
                <div className="absolute -top-3 right-6 text-emerald-400/80 pointer-events-none">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>

                {/* Left Artisan Inset Thumbnail */}
                <div className="hidden sm:block absolute -left-4 top-1/3 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md z-10">
                  <img
                    src="/artisan_tailor.jpg"
                    alt="Grassroots artisan working"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Local Business Inset Thumbnail */}
                <div className="hidden sm:block absolute -right-3 top-1/4 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md z-10">
                  <img
                    src="/business_shop.jpg"
                    alt="Local small enterprise"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Central Entrepreneur Hero Portrait */}
                <div className="w-64 sm:w-80 md:w-88 aspect-square rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-0">
                  <img
                    src="/hero_entrepreneur.jpg"
                    alt="Young Indian entrepreneur with laptop and backpack"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* ── 4 FLOATING GLASSMORPHIC CARDS AROUND HERO ──────────────── */}
              {/* Card 1: Top-Left (AI Matching) */}
              <div
                onClick={() => startJourney(1)}
                className="absolute -top-3 left-0 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[210px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-[#0B3B60] leading-tight flex items-center justify-between">
                    <span>AI Matching</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Finds the best schemes
                  </p>
                </div>
              </div>

              {/* Card 2: Top-Right (Eligible Schemes - CRITICAL FIX 1: Non-numeric!) */}
              <div
                onClick={() => navigateTo('schemes')}
                className="absolute top-4 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[230px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0E6655] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-[#0B3B60] leading-tight flex items-center justify-between">
                    <span>Eligible Schemes</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Matched to your profile
                  </p>
                </div>
              </div>

              {/* Card 3: Bottom-Left (Channel Partners) */}
              <div
                onClick={() => navigateTo('partners')}
                className="absolute -bottom-3 left-0 sm:-left-4 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[220px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0E6655] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-[#0B3B60] leading-tight flex items-center justify-between">
                    <span>Channel Partners</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Banks, SCAs & nodal desks
                  </p>
                </div>
              </div>

              {/* Card 4: Bottom-Right (Financial Impact) */}
              <div
                onClick={() => navigateTo('calculator')}
                className="absolute bottom-6 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[220px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-[#0B3B60] leading-tight flex items-center justify-between">
                    <span>Financial Impact</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Know your benefits & EMI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TRUST / VALUE STRIP (CRITICAL FIX 1: REAL COUNTS) ────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Stat 1: Real Government Schemes count from database */}
            <div className="flex items-center gap-3.5 sm:gap-4 pt-4 first:pt-0 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center shrink-0 border border-[#10B981]/20">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-extrabold text-[#0B3B60]">
                  {verifiedSchemesCount}
                </div>
                <div className="text-xs font-semibold text-[#1E293B]">
                  Government Schemes
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Verified NSFDC welfare programs
                </div>
              </div>
            </div>

            {/* Stat 2: Real Channel Partners count from verified directory */}
            <div className="flex items-center gap-3.5 sm:gap-4 pt-4 first:pt-0 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E6655] flex items-center justify-center shrink-0 border border-teal-200/50">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-extrabold text-[#0B3B60]">
                  {verifiedPartnersCount}
                </div>
                <div className="text-xs font-semibold text-[#1E293B]">
                  Channel Partners
                </div>
                <div className="text-[11px] text-[#64748B]">
                  State Channelizing Agencies (SCAs)
                </div>
              </div>
            </div>

            {/* Stat 3: Qualitative Truth Indicator */}
            <div className="flex items-center gap-3.5 sm:gap-4 pt-4 first:pt-0 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0E6655] flex items-center justify-center shrink-0 border border-[#10B981]/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-lg sm:text-xl font-extrabold text-[#0B3B60]">
                  Verified Data
                </div>
                <div className="text-xs font-semibold text-[#1E293B]">
                  Official Gazette Rules
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Direct MoSJE & NSFDC terms
                </div>
              </div>
            </div>

            {/* Stat 4: Zero fees claim */}
            <div className="flex items-center gap-3.5 sm:gap-4 pt-4 first:pt-0 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B3B60] flex items-center justify-center shrink-0 border border-blue-200/50">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-lg sm:text-xl font-extrabold text-[#0B3B60]">
                  100% Free
                </div>
                <div className="text-xs font-semibold text-[#1E293B]">
                  Zero Intermediary Fees
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Direct access for entrepreneurs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: "HOW UDYAMNEX WORKS" (CRITICAL FIX 2: GUIDE APPLICATION) ── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Simple 6-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            How UdyamNex Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
            From understanding your needs to successful application — we're with you at every step.
          </p>
        </div>

        {/* 6 Horizontal Workflow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                onClick={() => startJourney(step.num)}
                className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E2E8F0] hover:border-[#0E6655] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
                  {/* Step Top Row with Icon, Number & Connector */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] group-hover:bg-[#0E6655] text-[#0E6655] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-[#E8F8F2] text-[#0B3B60] group-hover:text-[#0E6655] text-xs font-extrabold flex items-center justify-center transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#0B3B60] group-hover:text-[#0E6655] transition-colors leading-snug mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-[#0E6655] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Start Step {step.num}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 4: CORE CAPABILITIES (2x3 GRID, 6 CARDS) ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Core Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
            Everything you need to navigate government support with certainty, transparency, and dignity.
          </p>
        </div>

        {/* 2x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs hover:shadow-md hover:border-[#0E6655]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                      {cap.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0B3B60] leading-snug">
                    {cap.title}
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 5: HOW THE AI WORKS (UNDERSTAND → VERIFY → EXPLAIN) ──────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Philosophy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            How the AI Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
            A transparent two-tier system where deterministic rules make decisions and AI provides plain-language explanations.
          </p>
        </div>

        {/* Motto Banner: "Rules decide. AI explains." */}
        <div className="bg-gradient-to-r from-[#0B3B60] to-[#0E6655] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <Scale className="w-3.5 h-3.5 text-emerald-300" />
              <span>Core Principle</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              "Rules decide. AI explains."
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Statutory government welfare eligibility cannot be left to probabilistic AI hallucinations. In UdyamNex, 100% of scheme eligibility decisions are executed by deterministic mathematical rules. Generative AI is strictly employed to interpret natural queries and explain official policy logic in plain language.
            </p>
          </div>
        </div>

        {/* 3 Columns: Understand → Verify → Explain */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Understand */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="text-base font-bold text-[#0B3B60]">1. Understand (NLU)</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Accepts your requirements in natural Hindi, English, or mixed voice notes. Extracts your purpose, project cost, household income, caste declaration, and state without complex paperwork.
            </p>
          </div>

          {/* Column 2: Verify */}
          <div className="bg-white rounded-3xl border border-[#A3E4D7] ring-2 ring-[#0E6655]/10 p-6 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="text-base font-bold text-[#0E6655]">2. Verify (Rule Engine)</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Deterministic Python Rule Engine compares extracted data against official NSFDC gazettes. Evaluates statutory caste mandate, the ₹5 Lakh annual income ceiling, and specific scheme project cost caps.
            </p>
          </div>

          {/* Column 3: Explain */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="text-base font-bold text-[#0B3B60]">3. Explain (Assistive AI)</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Generates transparent, personalized explanations showing exactly why a scheme was matched, clarifies required documents, and prepares you for your visit to the authorized State Channelizing Agency.
            </p>
          </div>
        </div>

        {/* Visual Flow Diagram */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
            Transparent Architectural Pipeline
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-mono">Input</span>
              <span className="text-xs font-bold text-[#1E293B]">Beneficiary Query</span>
            </div>
            <div className="hidden sm:flex justify-center text-slate-300">→</div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-[#10B981]/30">
              <span className="text-[10px] text-[#0E6655] block font-mono">Authority</span>
              <span className="text-xs font-bold text-[#0E6655]">Rule Engine Evaluation</span>
            </div>
            <div className="hidden sm:flex justify-center text-slate-300">→</div>
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
              <span className="text-[10px] text-blue-500 block font-mono">Output</span>
              <span className="text-xs font-bold text-[#0B3B60]">Actionable Guidance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: "WHY UDYAMNEX" COMPARISON ─────────────────────────────── */}
      <section id="why-udyamnex" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Scale className="w-3.5 h-3.5" />
            <span>Process Comparison</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Why UdyamNex
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
            A factual comparison between the traditional discovery process and UdyamNex's guided workflow.
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            {/* Headers */}
            <div className="hidden md:block p-5 bg-slate-50/70 font-bold text-[#0B3B60]">
              Evaluation Factor
            </div>
            <div className="hidden md:block p-5 bg-slate-50/70 font-bold text-slate-500">
              Traditional Discovery Process
            </div>
            <div className="hidden md:block p-5 bg-[#E8F8F2]/60 font-bold text-[#0E6655]">
              UdyamNex Guided Approach
            </div>

            {/* Row 1: Information Access */}
            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Information Sourcing
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Dispersed across multiple PDF circulars, regional notifications, and separate portal pages.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Centralized catalog of verified NSFDC credit schemes linking directly to live gazette source documents.
            </div>

            {/* Row 2: Eligibility Check */}
            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Eligibility Assessment
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Manual deciphering of complex legal qualifications, income restrictions, and category clauses.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Instant deterministic matching comparing your income, caste, and project scale with mathematical precision.
            </div>

            {/* Row 3: Financial Calculations */}
            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Financial & EMI Clarity
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Unclear subvention interest calculations, unknown moratorium grace periods, and complex formulas.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Dynamic EMI simulator showing subsidized 6.0%–8.0% interest rates and repayment schedules upfront.
            </div>

            {/* Row 4: Channel Partner Access */}
            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Channel Partner Finding
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Physical district visits to identify which local government corporation or bank nodal desk accepts applications.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Directory of 38 verified State Channelizing Agencies (SCAs) with official addresses across all States & UTs.
            </div>

            {/* Row 5: Language Support */}
            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Language & Accessibility
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Formal administrative English terminology that creates digital barriers for grassroots beneficiaries.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Bilingual support in Hindi and English with natural language search and plain-text explanations.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: IMPACT SECTION (ACCESSIBILITY, TRANSPARENCY, EFFICIENCY) ─ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Users className="w-3.5 h-3.5" />
            <span>Inclusive Mission</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Impact for Grassroots Entrepreneurs
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
            Designed to bridge the last-mile gap between central welfare credit programs and deserving citizens.
          </p>
        </div>

        {/* 3 Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B3B60]">Accessibility</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Eliminating literacy and digital barriers. Beneficiaries can describe their enterprise needs in natural everyday language to receive clear, structured guidance.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0E6655] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B3B60]">Transparency</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Every matched scheme shows exact statutory rule factors, live government source links, and clear explanations without hidden clauses or commercial bias.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E6655] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B3B60]">Efficiency</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Replacing weeks of manual confusion with a structured 6-step roadmap, required document checklists, and direct navigation to authorized state nodal agencies.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: SECURITY & TRUST (4 CARDS) ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Governance & Privacy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Security, Privacy & Responsible AI
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
            Built from the ground up to protect beneficiary data and ensure algorithmic fairness.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0B3B60]">Verified Sources</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              All scheme parameters, loan ceilings, and SCA addresses are traced to official Gazette publications and the NSFDC portal.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0B3B60]">Privacy by Design</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              We do not store bank passwords or Aadhaar biometric data. Your self-declared information is processed strictly for scheme matching.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0B3B60]">Explainable Matching</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Zero black-box decisions. Inspect the statutory rule factors that qualified or disqualified your enterprise for each scheme.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0E6655] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#0B3B60]">Responsible AI</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Guarded against hallucinations, unauthorized loan guarantees, and predatory commercial lending marketing.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FAQ ACCORDION (ALL 8 Q&As VERBATIM FROM BRIEF) ────────── */}
      <section id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
            Clear, honest answers about UdyamNex, scheme matching, and government financial assistance.
          </p>
        </div>

        {/* 8 Accordion Q&A Items */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-[#0B3B60] flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.q}</span>
                  <div
                    className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#E8F8F2] text-[#0E6655]' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 10: FINAL CTA SECTION (TEAL GRADIENT BACKGROUND) ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0E6655] to-[#0B3B60] p-8 sm:p-12 lg:p-16 text-white text-center relative overflow-hidden shadow-xl">
          {/* Subtle Decorative Pattern */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Right Scheme. Real Support.</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to Find the Right Government Scheme?
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl mx-auto">
              Start your guided 6-step journey today. Explore verified NSFDC schemes, calculate your financial impact, and locate authorized channel partners in your district.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => startJourney(1)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#0E6655] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Find Your Scheme</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('schemes')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/25 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Browse Verified Schemes</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-[11px] font-semibold text-emerald-100/80">
              <span>✓ 100% Free & Open</span>
              <span>✓ Official NSFDC Guidelines</span>
              <span>✓ Zero Intermediary Fees</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
