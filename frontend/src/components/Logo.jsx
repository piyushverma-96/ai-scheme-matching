import React from 'react';

export default function Logo({ showTagline = true, size = 'md', className = '' }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Leaf & Bridge Swoosh Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={isSmall ? '28' : isLarge ? '44' : '36'}
          height={isSmall ? '28' : isLarge ? '44' : '36'}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Bridge / Arch */}
          <path
            d="M6 26C11 16 29 16 34 26"
            stroke="#0B3B60"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Dynamic Leaf Swoosh in Emerald Teal */}
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
          {/* Blue connecting pillar */}
          <path
            d="M8 29C15 29 25 29 32 29"
            stroke="#0B3B60"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-sans font-bold tracking-tight text-[#0B3B60] leading-none ${
            isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
          }`}
        >
          UdyamNex
        </span>
        {showTagline && (
          <span className="text-[10px] sm:text-[11px] font-medium text-[#64748B] leading-tight mt-0.5">
            Right Scheme. Real Support.
          </span>
        )}
      </div>
    </div>
  );
}
