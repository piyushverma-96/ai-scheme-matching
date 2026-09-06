import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 text-center space-y-1.5 text-xs text-[#64748B]">
        <div className="flex items-center justify-center gap-1.5 font-bold text-[#0B3B60]">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>{t('footer.tagline', 'ArthSetu · Right Scheme. Right Partner. Right Guidance.')}</span>
        </div>
        <p className="text-[11px] leading-relaxed max-w-xl mx-auto text-[#94A3B8]">
          {t('footer.disclaimer', 'This platform provides guidance on government supported financial and educational loan schemes. Final approval and loan terms are determined by the authorized channel partner following verification.')}
        </p>
      </div>
    </footer>
  );
}
