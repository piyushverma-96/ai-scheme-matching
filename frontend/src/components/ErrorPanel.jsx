import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorPanel({ onRetry, message }) {
  const { t } = useTranslation();
  return (
    <div className="border border-[#B3261E]/20 bg-[#FDF2F2] rounded-xl p-4 sm:p-5 text-center space-y-2.5">
      <div className="flex items-center justify-center gap-2 text-[#B3261E] font-semibold text-sm sm:text-base">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{t('step1.error_title')}</span>
      </div>
      <p className="text-xs sm:text-sm text-[#B3261E]/90">
        {message || t('common.network_error')}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#07263F] underline underline-offset-4 cursor-pointer mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t('step1.error_retry')}
        </button>
      )}
    </div>
  );
}
