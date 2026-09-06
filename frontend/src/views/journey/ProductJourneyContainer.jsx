import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import SixStepProgressStepper from '../../components/SixStepProgressStepper';
import Step1UnderstandNeed from './Step1UnderstandNeed';
import Step2EligibleSchemes from './Step2EligibleSchemes';
import Step3RecommendBestScheme from './Step3RecommendBestScheme';
import Step4FinancialImpact from './Step4FinancialImpact';
import Step5RightPartner from './Step5RightPartner';
import Step6GuideApplication from './Step6GuideApplication';
import { ArrowLeft, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export default function ProductJourneyContainer() {
  const { t } = useTranslation();
  const { journeyStep, setJourneyStep, setView } = useApp();

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [journeyStep]);

  const renderCurrentStep = () => {
    switch (journeyStep) {
      case 1:
        return <Step1UnderstandNeed />;
      case 2:
        return <Step2EligibleSchemes />;
      case 3:
        return <Step3RecommendBestScheme />;
      case 4:
        return <Step4FinancialImpact />;
      case 5:
        return <Step5RightPartner />;
      case 6:
        return <Step6GuideApplication />;
      default:
        return <Step1UnderstandNeed />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setView('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100/80 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg cursor-pointer min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('journey_nav.dashboard_back', 'Dashboard')}</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('journey_nav.pipeline_title', 'Technical Approach: 6-Stage Verified Delivery Pipeline')}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700">{t('journey_nav.official_portal', 'Official Portal')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 space-y-5 sm:space-y-6">
        {/* Global 6-Stage Progress Stepper */}
        <SixStepProgressStepper 
          currentStep={journeyStep} 
          onStepClick={(step) => {
            // Allow going back to any previous step or jumping around
            setJourneyStep(step);
          }} 
        />

        {/* Active Step Content */}
        <main className="transition-all duration-300">
          {renderCurrentStep()}
        </main>
      </div>
    </div>
  );
}
