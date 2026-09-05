import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HeroBanner({ onGetStarted }) {
  const { startWizard } = useApp();

  const handleStart = () => {
    if (onGetStarted) onGetStarted();
    else startWizard(1);
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-4 sm:p-8 shadow-xs">
      {/* Soft background tint accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EFF6FF] rounded-full blur-3xl opacity-40 pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 right-48 w-64 h-64 bg-[#E8F8F2] rounded-full blur-2xl opacity-40 pointer-events-none -mb-16" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Text & CTA */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B3B60] tracking-tight leading-tight">
            Find the right scheme for your needs
          </h2>

          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-lg">
            Answer a few questions and we will suggest the best schemes for you.
          </p>

          <div className="pt-2">
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Illustration Vector */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] flex items-center justify-center">
            {/* Custom SVG Illustration representing 2 entrepreneurs working on laptop with rupee coin and document */}
            <svg
              viewBox="0 0 320 240"
              className="w-full h-full drop-shadow-xs"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Desk */}
              <ellipse cx="160" cy="205" rx="140" ry="16" fill="#F1F5F9" />
              <rect x="50" y="150" width="220" height="10" rx="4" fill="#CBD5E1" />
              <rect x="75" y="160" width="8" height="40" rx="3" fill="#94A3B8" />
              <rect x="237" y="160" width="8" height="40" rx="3" fill="#94A3B8" />

              {/* Laptop */}
              <rect x="130" y="125" width="60" height="32" rx="3" fill="#0B3B60" />
              <rect x="134" y="128" width="52" height="26" rx="2" fill="#38BDF8" fillOpacity="0.3" />
              <path d="M120 156H200L195 160H125L120 156Z" fill="#64748B" />

              {/* Person 1 (Left - Male in Blue shirt) */}
              {/* Hair & Head */}
              <circle cx="105" cy="85" r="16" fill="#1E293B" />
              <circle cx="107" cy="87" r="14" fill="#FBD38D" />
              <path d="M94 82C94 74 100 70 110 70C118 70 122 75 120 84C115 82 108 81 100 85Z" fill="#1E293B" />
              {/* Body */}
              <path d="M85 160C85 125 95 110 107 110C119 110 129 125 129 160H85Z" fill="#2563EB" />
              <path d="M107 110L112 135L120 120" stroke="#FBD38D" strokeWidth="5" strokeLinecap="round" />

              {/* Person 2 (Right - Female in Emerald Green outfit) */}
              {/* Hair & Head */}
              <circle cx="215" cy="85" r="17" fill="#0F172A" />
              <circle cx="213" cy="87" r="14" fill="#F6AD55" />
              <path d="M198 86C198 72 210 68 224 72C230 76 232 88 230 98C222 92 216 88 206 90Z" fill="#0F172A" />
              {/* Body */}
              <path d="M191 160C191 125 201 110 213 110C225 110 235 125 235 160H191Z" fill="#10B981" />
              <path d="M205 115L195 138L185 145" stroke="#F6AD55" strokeWidth="5" strokeLinecap="round" />

              {/* Floating Rupee Gold Coin */}
              <g transform="translate(240, 30)">
                <circle cx="20" cy="20" r="18" fill="#F59E0B" />
                <circle cx="20" cy="20" r="15" fill="#FBBF24" />
                <text
                  x="20"
                  y="26"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fontSize="18"
                  textAnchor="middle"
                  fill="#78350F"
                >
                  ₹
                </text>
              </g>

              {/* Floating Document Icon */}
              <g transform="translate(60, 40)">
                <rect x="0" y="0" width="30" height="38" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                <rect x="6" y="8" width="18" height="3" rx="1.5" fill="#10B981" />
                <rect x="6" y="15" width="14" height="2.5" rx="1" fill="#94A3B8" />
                <rect x="6" y="21" width="16" height="2.5" rx="1" fill="#94A3B8" />
                <rect x="6" y="27" width="10" height="2.5" rx="1" fill="#94A3B8" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
