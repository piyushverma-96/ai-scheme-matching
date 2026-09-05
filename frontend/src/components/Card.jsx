import React from 'react';

export default function Card({
  children,
  accent = null, // 'amber' | 'teal' | 'navy' | null
  className = '',
  padding = 'p-5 sm:p-6',
  ...props
}) {
  const accentBorder = {
    amber: 'border-t-4 border-t-[#C77D02]',
    teal: 'border-t-4 border-t-[#0F8B8D]',
    navy: 'border-t-4 border-t-[#0B3B60]',
  }[accent] || '';

  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E7EB] shadow-xs ${accentBorder} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
