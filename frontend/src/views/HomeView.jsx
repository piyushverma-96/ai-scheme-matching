import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Play,
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
  Star,
  X,
  SlidersHorizontal,
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
  } = useApp();

  // FAQ Accordion State (open question index, default 0 open)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Scheme Details Modal on Homepage (Allows inspecting scheme without leaving page)
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Filter for verified schemes showcase
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState('all');

  // Inline Interactive Scheme Matcher State
  const [matchPurpose, setMatchPurpose] = useState('business');
  const [matchAmount, setMatchAmount] = useState(300000);
  const [matchIncome, setMatchIncome] = useState(300000);
  const [matchCaste, setMatchCaste] = useState('SC');

  // Inline Interactive EMI Calculator State
  const [calcLoanAmount, setCalcLoanAmount] = useState(300000);
  const [calcTenureYears, setCalcTenureYears] = useState(5);
  const [calcInterestRate, setCalcInterestRate] = useState(8.0);
  const [calcMoratoriumMonths, setCalcMoratoriumMonths] = useState(6);

  // Calculate dynamic EMI for the inline calculator
  const calculateEMI = (principal, annualRate, years, moratoriumMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = Math.max(1, years * 12 - moratoriumMonths);
    if (monthlyRate === 0) return Math.round(principal / totalMonths);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const currentEMI = useMemo(
    () => calculateEMI(calcLoanAmount, calcInterestRate, calcTenureYears, calcMoratoriumMonths),
    [calcLoanAmount, calcInterestRate, calcTenureYears, calcMoratoriumMonths]
  );

  // Commercial comparison (13% interest without government subvention)
  const commercialEMI = useMemo(
    () => calculateEMI(calcLoanAmount, 13.0, calcTenureYears, 0),
    [calcLoanAmount, calcTenureYears]
  );

  const monthlySavings = Math.max(0, commercialEMI - currentEMI);

  // Filter schemes based on selected category
  const filteredSchemes = useMemo(() => {
    if (schemeCategoryFilter === 'all') return SCHEMES_DATA;
    if (schemeCategoryFilter === 'micro') {
      return SCHEMES_DATA.filter((s) => s.id.includes('micro') || s.id.includes('mfs') || s.id.includes('aajeevika'));
    }
    if (schemeCategoryFilter === 'term') {
      return SCHEMES_DATA.filter((s) => s.id.includes('term') || s.id.includes('uny'));
    }
    if (schemeCategoryFilter === 'education') {
      return SCHEMES_DATA.filter((s) => s.id.includes('education') || s.id.includes('els'));
    }
    return SCHEMES_DATA;
  }, [schemeCategoryFilter]);

  // Evaluated match in the inline matcher
  const inlineMatchResult = useMemo(() => {
    if (matchCaste !== 'SC') {
      return {
        matched: false,
        reason: 'NSFDC schemes are statutorily reserved for Scheduled Caste (SC) applicants.',
      };
    }
    if (matchIncome > 500000) {
      return {
        matched: false,
        reason: 'Annual family income exceeds the NSFDC eligibility ceiling of ₹5,00,000.',
      };
    }

    if (matchPurpose === 'education') {
      const eduScheme = SCHEMES_DATA.find((s) => s.id === 'educational_loan_scheme') || SCHEMES_DATA[2];
      return {
        matched: true,
        scheme: eduScheme,
        score: 95,
        reason: 'Perfect match for professional higher education with 6.0% concessional student rate.',
      };
    }

    if (matchAmount <= 140000) {
      const mfsScheme = SCHEMES_DATA.find((s) => s.id === 'micro_credit_finance') || SCHEMES_DATA[1];
      return {
        matched: true,
        scheme: mfsScheme,
        score: 96,
        reason: 'Small enterprise project cost (≤ ₹1.40 Lakh) qualifies for fast-track Micro Finance Scheme at 6.50% p.a.',
      };
    }

    const termScheme = SCHEMES_DATA.find((s) => s.id === 'nsfdc_term_loan') || SCHEMES_DATA[0];
    return {
      matched: true,
      scheme: termScheme,
      score: 98,
      reason: 'Viable scale for NSFDC Term Loan (up to ₹50 Lakh) at 8.00% concessional interest rate with 6-month moratorium.',
    };
  }, [matchPurpose, matchAmount, matchIncome, matchCaste]);

  // Active step info (1 to 6)
  const currentStepNum = Math.min(6, Math.max(1, journeyStep || 1));

  // 6 Workflow Steps (Strict outcome-neutral language)
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

  // 8 FAQs from Brief
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
    <div id="top" className="w-full space-y-16 sm:space-y-24 pb-16 animate-in fade-in duration-300">
      {/* ── SECTION 1: HERO SECTION (EXACT MOCKUP HEADLINE & FLOATING CARDS) ── */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 lg:pt-12 pb-6">
        {/* Soft Background Radial Glows */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-8 left-8 w-80 h-80 bg-teal-50/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Hero Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              {/* Feature Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F8F2] border border-[#10B981]/30 text-[#0E6655] text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#0E6655]" />
                <span className="uppercase tracking-wider text-[11px] font-bold">AI-Powered Scheme Matching</span>
              </div>

              {/* Exact Mockup Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#0B3B60] tracking-tight leading-[1.12]">
                Your Business Idea.<br />
                The Right Scheme.<br />
                <span className="text-[#0E6655]">Real Government Support.</span>
              </h1>

              {/* Exact Mockup Subtitle */}
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                UdyamNex helps eligible entrepreneurs discover relevant government financial schemes, understand their benefits, calculate financial impact, and find the right application channel.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
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
                  <Play className="w-3.5 h-3.5 fill-[#0B3B60] text-[#0B3B60]" />
                  <span>How It Works</span>
                </button>
              </div>

              {/* Trust Indicators (Exact from Mockup) */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-[#475569]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0E6655]" />
                  <span>Verified Government Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0E6655]" />
                  <span>Personalized Recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0E6655]" />
                  <span>Simple Application Guidance</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual & 4 Interactive Floating Cards (5 Cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
              {/* Circular Backdrop Aura with Contour and Growth Arrow */}
              <div className="relative w-72 sm:w-96 md:w-[420px] aspect-square rounded-full bg-gradient-to-tr from-emerald-100/60 via-teal-50 to-white flex items-center justify-center shadow-inner border border-emerald-100">
                {/* Central Entrepreneur Hero Portrait */}
                <div className="w-64 sm:w-80 md:w-88 aspect-square rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-0">
                  <img
                    src="/hero_entrepreneur.jpg"
                    alt="Young Indian entrepreneur with laptop and backpack"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* ── 4 FLOATING GLASSMORPHIC CARDS MATCHING SCREENSHOT ──────── */}
              {/* Card 1: Top-Left (Eligible Schemes) */}
              <div
                onClick={() => {
                  const el = document.getElementById('schemes-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute top-2 left-0 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[210px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0E6655] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
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

              {/* Card 2: Top-Right (Best Match Found) */}
              <div
                onClick={() => {
                  const el = document.getElementById('personalized-match');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute top-4 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[220px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-[#0B3B60] leading-tight flex items-center justify-between">
                    <span>Best Match Found</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Most relevant scheme
                  </p>
                </div>
              </div>

              {/* Card 3: Bottom-Left (Channel Partner) */}
              <div
                onClick={() => navigateTo('partners')}
                className="absolute bottom-4 left-0 sm:-left-4 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[210px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0E6655] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-[#0B3B60] leading-tight flex items-center justify-between">
                    <span>Channel Partner</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                    Nearest eligible partner
                  </p>
                </div>
              </div>

              {/* Card 4: Bottom-Right (Financial Impact) */}
              <div
                onClick={() => {
                  const el = document.getElementById('calculator-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute bottom-6 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0E6655] rounded-2xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer z-20 flex items-center gap-2.5 max-w-[210px] group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
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

              {/* Handwritten Script Accent Text (Exact from Screenshot) */}
              <div className="absolute -bottom-6 right-0 sm:right-6 select-none pointer-events-none transform -rotate-6">
                <span className="font-serif italic text-sm sm:text-base text-emerald-800/60 font-semibold tracking-wide">
                  Build Your Tomorrow
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TRUST / VALUE STRIP (EXACT 4 ITEMS FROM SCREENSHOT) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-7 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
            {/* Item 1: Verified Government Data */}
            <div className="flex items-center gap-3.5 pt-3 first:pt-0 sm:pt-0 lg:px-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#0E6655] flex items-center justify-center shrink-0 border border-[#10B981]/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold text-[#0B3B60]">
                  Verified Government Data
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Official & trusted sources
                </div>
              </div>
            </div>

            {/* Item 2: Personalized Scheme Matching */}
            <div className="flex items-center gap-3.5 pt-3 first:pt-0 sm:pt-0 lg:px-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/50">
                <Brain className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold text-[#0B3B60]">
                  Personalized Scheme Matching
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Based on your profile
                </div>
              </div>
            </div>

            {/* Item 3: Financial Impact Calculator */}
            <div className="flex items-center gap-3.5 pt-3 first:pt-0 sm:pt-0 lg:px-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/50">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold text-[#0B3B60]">
                  Financial Impact Calculator
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Know your estimated benefits
                </div>
              </div>
            </div>

            {/* Item 4: Application Guidance */}
            <div className="flex items-center gap-3.5 pt-3 first:pt-0 sm:pt-0 lg:px-4">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E6655] flex items-center justify-center shrink-0 border border-teal-200/50">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold text-[#0B3B60]">
                  Application Guidance
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Step-by-step support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: "HOW UDYAMNEX WORKS" (6-STEP WORKFLOW) ───────────────── */}
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
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                onClick={() => startJourney(step.num)}
                className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E2E8F0] hover:border-[#0E6655] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
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

      {/* ── SECTION 4: VERIFIED GOVERNMENT SCHEMES (LIVE SHOWCASE ON SAME PAGE) ── */}
      <section id="schemes-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Government Schemes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
              Explore Verified NSFDC Welfare Schemes
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
              100% official terms, statutory income limits, and concessional interest rates straight from live Government gazette guidelines.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start">
            <button
              type="button"
              onClick={() => setSchemeCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                schemeCategoryFilter === 'all'
                  ? 'bg-white text-[#0B3B60] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B3B60]'
              }`}
            >
              All Schemes ({SCHEMES_DATA.length})
            </button>
            <button
              type="button"
              onClick={() => setSchemeCategoryFilter('micro')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                schemeCategoryFilter === 'micro'
                  ? 'bg-white text-[#0B3B60] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B3B60]'
              }`}
            >
              Micro-Credit (≤ ₹1.4L)
            </button>
            <button
              type="button"
              onClick={() => setSchemeCategoryFilter('term')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                schemeCategoryFilter === 'term'
                  ? 'bg-white text-[#0B3B60] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B3B60]'
              }`}
            >
              Term Loans (Up to ₹50L)
            </button>
            <button
              type="button"
              onClick={() => setSchemeCategoryFilter('education')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                schemeCategoryFilter === 'education'
                  ? 'bg-white text-[#0B3B60] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0B3B60]'
              }`}
            >
              Education Loans
            </button>
          </div>
        </div>

        {/* Schemes Grid (Directly on this single page) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl border border-[#E2E8F0] hover:border-[#0E6655] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3.5">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                    {scheme.category || 'NSFDC Welfare Program'}
                  </span>
                  <span className="text-xs font-bold text-[#0B3B60]">
                    {scheme.interest_rate_display || 'Subsidized Rate'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0B3B60] group-hover:text-[#0E6655] transition-colors leading-snug">
                  {scheme.name}
                </h3>

                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                  {scheme.short_description || scheme.description}
                </p>

                {/* Key Attributes Box */}
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-[#475569]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max Project Scale:</span>
                    <span className="font-bold text-[#1E293B]">{scheme.project_cost_max_display || 'Up to ₹50.00 Lakh'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Repayment Period:</span>
                    <span className="font-semibold text-[#1E293B]">{scheme.repayment_period || 'Up to 7 Years'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Moratorium:</span>
                    <span className="font-semibold text-[#1E293B]">{scheme.moratorium_period || '6 Months'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons on Card */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedScheme(scheme)}
                  className="flex-1 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-slate-50 text-[#0B3B60] font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => startJourney(1, { preferredSchemeId: scheme.id })}
                  className="flex-1 py-2.5 rounded-xl bg-[#0E6655] hover:bg-[#0B5345] text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: PERSONALIZED SCHEME MATCHING (INLINE ON SAME PAGE) ────── */}
      <section id="personalized-match" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Brain className="w-3.5 h-3.5" />
            <span>Instant Eligibility Check</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Personalized Scheme Matching
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
            See which verified government scheme matches your business or education requirement right now without paperwork.
          </p>
        </div>

        {/* 2-Column Matcher Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Input 1: Purpose */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0B3B60] block">
                Requirement / Enterprise Purpose
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'business', label: 'Small Business' },
                  { id: 'micro', label: 'Micro Enterprise' },
                  { id: 'education', label: 'Higher Education' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMatchPurpose(item.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      matchPurpose === item.id
                        ? 'bg-[#0E6655] text-white border-[#0E6655] shadow-2xs'
                        : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#0E6655]/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Project Cost / Loan Scale */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#0B3B60]">Required Amount / Scale:</span>
                <span className="text-[#0E6655] font-mono text-sm">₹{matchAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="50000"
                value={matchAmount}
                onChange={(e) => setMatchAmount(Number(e.target.value))}
                className="w-full accent-[#0E6655] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹50,000 (Micro)</span>
                <span>₹10,00,000</span>
                <span>₹50,00,000 (Max Limit)</span>
              </div>
            </div>

            {/* Input 3: Annual Household Income */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#0B3B60]">Annual Household Income:</span>
                <span className="text-[#0E6655] font-mono text-sm">₹{matchIncome.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="600000"
                step="25000"
                value={matchIncome}
                onChange={(e) => setMatchIncome(Number(e.target.value))}
                className="w-full accent-[#0E6655] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹50,000</span>
                <span>₹3,00,000</span>
                <span>₹5,00,000 (Statutory Ceiling)</span>
              </div>
            </div>
          </div>

          {/* Right Live Match Result (5 Cols) */}
          <div className="lg:col-span-5 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Deterministic Rule Result
              </span>
              {inlineMatchResult.matched && (
                <span className="text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                  {inlineMatchResult.score}% Compatibility
                </span>
              )}
            </div>

            {inlineMatchResult.matched ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B3B60]">
                      {inlineMatchResult.scheme?.name}
                    </h4>
                    <p className="text-[11px] text-[#0E6655] font-semibold mt-0.5">
                      {inlineMatchResult.scheme?.interest_rate_display} • {inlineMatchResult.scheme?.loan_amount_short}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {inlineMatchResult.reason}
                </p>

                <button
                  type="button"
                  onClick={() => startJourney(1, { preferredSchemeId: inlineMatchResult.scheme?.id })}
                  className="w-full py-2.5 rounded-xl bg-[#0E6655] hover:bg-[#0B5345] text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed with this Scheme</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-rose-700 block">Not Eligible under NSFDC Rules</span>
                <p className="text-xs text-rose-600 leading-relaxed">{inlineMatchResult.reason}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FINANCIAL IMPACT & EMI CALCULATOR (INLINE ON SAME PAGE) ─ */}
      <section id="calculator-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Financial Impact & EMI Calculator
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
            Simulate monthly repayments with official subsidized rates (6%–8%) and see how much you save compared to commercial bank rates.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Slider 1: Loan Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#0B3B60]">Loan Amount Required:</span>
                <span className="text-[#0E6655] font-mono text-sm">₹{calcLoanAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="50000"
                value={calcLoanAmount}
                onChange={(e) => setCalcLoanAmount(Number(e.target.value))}
                className="w-full accent-[#0E6655] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹50,000</span>
                <span>₹25,00,000</span>
                <span>₹50,00,000</span>
              </div>
            </div>

            {/* Slider 2: Tenure Years */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#0B3B60]">Repayment Tenure:</span>
                <span className="text-[#0E6655] font-mono text-sm">{calcTenureYears} Years ({calcTenureYears * 12} Months)</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={calcTenureYears}
                onChange={(e) => setCalcTenureYears(Number(e.target.value))}
                className="w-full accent-[#0E6655] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 Year</span>
                <span>3 Years</span>
                <span>7 Years (Max)</span>
              </div>
            </div>

            {/* Slider 3: Subsidized Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#0B3B60]">Concessional Interest Rate:</span>
                <span className="text-[#0E6655] font-mono text-sm">{calcInterestRate.toFixed(1)}% p.a.</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="8.0"
                step="0.5"
                value={calcInterestRate}
                onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                className="w-full accent-[#0E6655] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>4.0% (Women AMY)</span>
                <span>6.5% (MFS)</span>
                <span>8.0% (Term Loan)</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B3B60] to-[#0E6655] text-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-md">
            <div>
              <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                Estimated Monthly Repayment
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-mono">
                ₹{currentEMI.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-300">/mo</span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mt-1">
                Calculated on reducing monthly balance under official NSFDC subvention.
              </p>
            </div>

            <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 space-y-2 text-xs">
              <div className="flex justify-between text-slate-200">
                <span>Commercial Bank EMI (13%):</span>
                <span className="line-through text-rose-300 font-mono">₹{commercialEMI.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-200 pt-1 border-t border-white/10">
                <span>Monthly Subvention Savings:</span>
                <span className="font-mono text-emerald-300">+₹{monthlySavings.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startJourney(1)}
              className="w-full py-3 rounded-full bg-white text-[#0E6655] font-extrabold text-xs hover:bg-slate-100 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Apply with Subsidized Rate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: CORE FEATURES / CAPABILITIES (2x3 GRID) ──────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#0E6655] text-xs font-semibold border border-[#10B981]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Key Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B60] tracking-tight">
            Features & Capabilities
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

      {/* ── SECTION 8: HOW THE AI WORKS (UNDERSTAND → VERIFY → EXPLAIN) ──────── */}
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
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="text-base font-bold text-[#0B3B60]">1. Understand (NLU)</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Accepts your requirements in natural Hindi, English, or mixed voice notes. Extracts your purpose, project cost, household income, caste declaration, and state without complex paperwork.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#A3E4D7] ring-2 ring-[#0E6655]/10 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F8F2] text-[#0E6655] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="text-base font-bold text-[#0E6655]">2. Verify (Rule Engine)</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Deterministic Python Rule Engine compares extracted data against official NSFDC gazettes. Evaluates statutory caste mandate, the ₹5 Lakh annual income ceiling, and specific scheme project cost caps.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="text-base font-bold text-[#0B3B60]">3. Explain (Assistive AI)</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Generates transparent, personalized explanations showing exactly why a scheme was matched, clarifies required documents, and prepares you for your visit to the authorized State Channelizing Agency.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: "WHY UDYAMNEX" COMPARISON ─────────────────────────────── */}
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

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="hidden md:block p-5 bg-slate-50/70 font-bold text-[#0B3B60]">
              Evaluation Factor
            </div>
            <div className="hidden md:block p-5 bg-slate-50/70 font-bold text-slate-500">
              Traditional Discovery Process
            </div>
            <div className="hidden md:block p-5 bg-[#E8F8F2]/60 font-bold text-[#0E6655]">
              UdyamNex Guided Approach
            </div>

            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Information Sourcing
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Dispersed across multiple PDF circulars, regional notifications, and separate portal pages.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Centralized catalog of verified NSFDC credit schemes linking directly to live gazette source documents.
            </div>

            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Eligibility Assessment
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Manual deciphering of complex legal qualifications, income restrictions, and category clauses.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Instant deterministic matching comparing your income, caste, and project scale with mathematical precision.
            </div>

            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Financial & EMI Clarity
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Unclear subvention interest calculations, unknown moratorium grace periods, and complex formulas.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Dynamic EMI simulator showing subsidized 6.0%–8.0% interest rates and repayment schedules upfront.
            </div>

            <div className="p-4 sm:p-5 font-bold text-[#0B3B60] bg-slate-50/40">
              Channel Partner Finding
            </div>
            <div className="p-4 sm:p-5 text-[#64748B]">
              Physical district visits to identify which local government corporation or bank nodal desk accepts applications.
            </div>
            <div className="p-4 sm:p-5 text-[#0E6655] font-semibold bg-[#F9FEFB]">
              Directory of 38 verified State Channelizing Agencies (SCAs) with official addresses across all States & UTs.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: FAQ ACCORDION (ALL 8 Q&As VERBATIM) ─────────────────── */}
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

      {/* ── SECTION 11: FINAL CTA SECTION (TEAL GRADIENT BACKGROUND) ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0E6655] to-[#0B3B60] p-8 sm:p-12 lg:p-16 text-white text-center relative overflow-hidden shadow-xl">
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
                onClick={() => {
                  const el = document.getElementById('schemes-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
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

      {/* ── SCHEME DETAILS MODAL (Inspect scheme directly on homepage) ───────── */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                  {selectedScheme.category || 'NSFDC Scheme'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#0B3B60] mt-1.5">
                  {selectedScheme.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
              <p className="leading-relaxed">{selectedScheme.description || selectedScheme.short_description}</p>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">Subsidized Interest:</span>
                  <span className="font-bold text-[#0B3B60]">{selectedScheme.interest_rate_display || 'Concessional Rate'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Maximum Project Scale:</span>
                  <span className="font-bold text-[#0B3B60]">{selectedScheme.project_cost_max_display || 'Up to ₹50 Lakh'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Repayment Tenure:</span>
                  <span className="font-semibold text-slate-700">{selectedScheme.repayment_period || 'Up to 7 Years'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Moratorium Period:</span>
                  <span className="font-semibold text-slate-700">{selectedScheme.moratorium_period || '6 Months'}</span>
                </div>
              </div>

              {selectedScheme.eligibility_criteria && (
                <div className="space-y-1.5">
                  <h5 className="font-bold text-[#0B3B60] text-xs uppercase tracking-wider">Statutory Eligibility:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#64748B]">
                    {selectedScheme.eligibility_criteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href={selectedScheme.source_url || 'https://nsfdc.nic.in/scheme'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#0B3B60] hover:text-[#0E6655] font-semibold"
              >
                <span>View Official Gazette URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  const sId = selectedScheme.id;
                  setSelectedScheme(null);
                  startJourney(1, { preferredSchemeId: sId });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0E6655] hover:bg-[#0B5345] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Apply for this Scheme</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
