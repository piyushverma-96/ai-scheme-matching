import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'outline'
  size = 'lg', // 'md' | 'lg'
  fullWidth = true,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon = null,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-base select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    md: 'py-2.5 px-4 text-sm gap-2',
    lg: 'py-3.5 px-6 text-base gap-2.5 min-h-[48px]',
  }[size] || 'py-3.5 px-6 text-base gap-2.5 min-h-[48px]';

  const variantStyles = {
    // Primary CTA: warm amber/gold (#C77D02)
    primary: 'bg-[#C77D02] text-white hover:bg-[#A56701] active:bg-[#8F5801] shadow-xs',
    // Secondary/Ghost: white background, navy border, navy text
    secondary: 'bg-white text-[#0B3B60] border-2 border-[#0B3B60] hover:bg-[#EAF1F6] active:bg-[#D5E3EE]',
    ghost: 'bg-transparent text-[#0B3B60] hover:bg-[#EAF1F6] active:bg-[#D5E3EE]',
    outline: 'bg-white text-[#1C1C1C] border border-[#E5E7EB] hover:border-[#0B3B60] hover:bg-[#F7F9FB]',
    teal: 'bg-[#0F8B8D] text-white hover:bg-[#0B696B] active:bg-[#085153] shadow-xs',
  }[variant] || '';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <span>{typeof children === 'string' ? children : 'Loading...'}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
