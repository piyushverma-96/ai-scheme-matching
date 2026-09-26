import React from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Lock,
  Cpu,
  FileCheck2,
  Building2,
  Calculator,
  Compass,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { t } = useTranslation();
  const { navigateTo, startJourney } = useApp();

  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto text-xs text-[#64748B]">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <button
              type="button"
              onClick={() => {
                navigateTo('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left cursor-pointer transition-transform active:scale-95"
            >
              <Logo size="md" showTagline={true} />
            </button>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm">
              An intelligent, transparent assistance platform connecting Scheduled Caste entrepreneurs and students to verified NSFDC concessional loan schemes and authorized State Channelizing Agencies.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E8F8F2] text-[#0E6655] font-semibold text-[11px] border border-[#10B981]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified NSFDC Data</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[#475569] font-semibold text-[11px] border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Privacy by Design</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[#475569] font-semibold text-[11px] border border-slate-200">
                <Cpu className="w-3.5 h-3.5" />
                <span>Deterministic Rules</span>
              </span>
            </div>
          </div>

          {/* Column 3: Product Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              Product & Tools
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => startJourney(1)}
                  className="hover:text-[#0E6655] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Find Your Scheme</span>
                  <span className="text-[10px] text-[#0E6655] font-bold">→</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('schemes')}
                  className="hover:text-[#0E6655] transition-colors cursor-pointer"
                >
                  Verified Schemes Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('calculator')}
                  className="hover:text-[#0E6655] transition-colors cursor-pointer"
                >
                  Financial Impact & EMI Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('partners')}
                  className="hover:text-[#0E6655] transition-colors cursor-pointer"
                >
                  Channel Partner Directory (38 SCAs)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('tracking')}
                  className="hover:text-[#0E6655] transition-colors cursor-pointer"
                >
                  Track Application Lifecycle
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              Official Resources
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://nsfdc.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0E6655] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>NSFDC Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmsuraj.dosje.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0E6655] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>PM-SURAJ Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://socialjustice.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0E6655] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Ministry of Social Justice</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('home');
                    setTimeout(() => {
                      document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-[#0E6655] transition-colors cursor-pointer"
                >
                  Frequently Asked Questions (FAQs)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('documents')}
                  className="hover:text-[#0E6655] transition-colors cursor-pointer"
                >
                  Document Checklist Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Technology & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              Technology & Governance
            </h4>
            <ul className="space-y-2.5">
              <li className="text-[#475569]">
                <strong className="block text-[#1E293B]">Deterministic Rule Engine</strong>
                Sole authority on eligibility evaluation.
              </li>
              <li className="text-[#475569]">
                <strong className="block text-[#1E293B]">Responsible AI Policy</strong>
                Zero hallucinated terms, zero loan approval guarantees.
              </li>
              <li className="text-[#475569]">
                <strong className="block text-[#1E293B]">Smart India Hackathon 2026</strong>
                Problem Statement: 26092 (MoSJE / NSFDC).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Unified Tagline and Statutory Disclaimer */}
      <div className="border-t border-slate-100 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <p className="text-xs font-semibold text-[#0B3B60]">
              UdyamNex · <span className="text-[#0E6655]">Right Scheme. Real Support.</span>
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Smart India Hackathon 2026 Prototype · Verified NSFDC Guidelines & Gazette Rules.
            </p>
          </div>

          <div className="max-w-xl text-[11px] text-[#94A3B8] leading-relaxed text-center sm:text-right">
            This platform provides scheme matching and application guidance based on verified NSFDC guidelines. Final loan sanctioning and subsidy disbursement are made exclusively by authorized State Channelizing Agencies and partner banks following physical verification.
          </div>
        </div>
      </div>
    </footer>
  );
}
