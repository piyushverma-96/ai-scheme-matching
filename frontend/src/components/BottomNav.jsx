import React from 'react';
import { Home, Layers, FileCheck2, User, Bot, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { t } = useTranslation();
  const { currentView, navigateTo, setAiAssistantOpen, aiAssistantOpen } = useApp();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home / Dashboard */}
        <button
          type="button"
          onClick={() => {
            navigateTo('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-h-[46px] min-w-[48px] ${
            currentView === 'home'
              ? 'text-[#0E6655] font-bold'
              : 'text-[#64748B] hover:text-[#0B3B60] font-medium'
          }`}
        >
          <Home
            className={`w-5 h-5 ${
              currentView === 'home' ? 'text-[#0E6655] stroke-[2.5]' : 'text-[#64748B]'
            }`}
          />
          <span className="text-[10px] mt-1 leading-none">{t('nav.dashboard', 'Home')}</span>
        </button>

        {/* 2. Schemes Catalog */}
        <button
          type="button"
          onClick={() => navigateTo('schemes')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-h-[46px] min-w-[48px] ${
            currentView === 'schemes' || currentView === 'scheme_details'
              ? 'text-[#0E6655] font-bold'
              : 'text-[#64748B] hover:text-[#0B3B60] font-medium'
          }`}
        >
          <Layers
            className={`w-5 h-5 ${
              currentView === 'schemes' || currentView === 'scheme_details'
                ? 'text-[#0E6655] stroke-[2.5]'
                : 'text-[#64748B]'
            }`}
          />
          <span className="text-[10px] mt-1 leading-none">{t('nav.browse_schemes', 'Schemes')}</span>
        </button>

        {/* 3. CENTER HIGHLIGHTED ACTION: Ask UdyamNex AI (Elegantly Integrated) */}
        <button
          type="button"
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="flex flex-col items-center justify-center -mt-4 cursor-pointer group px-2"
          aria-label="Ask UdyamNex AI Assistant"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-200 border-2 border-white ${
              aiAssistantOpen
                ? 'bg-[#0B3B60] text-white scale-105 ring-2 ring-[#0E6655]/30'
                : 'bg-[#0E6655] hover:bg-[#0B5345] text-white'
            }`}
          >
            <Bot className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] mt-1 font-bold leading-none ${
              aiAssistantOpen ? 'text-[#0B3B60]' : 'text-[#0E6655]'
            }`}
          >
            Ask AI
          </span>
        </button>

        {/* 4. Applications Tracking */}
        <button
          type="button"
          onClick={() => navigateTo('tracking')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-h-[46px] min-w-[48px] ${
            currentView === 'tracking'
              ? 'text-[#0E6655] font-bold'
              : 'text-[#64748B] hover:text-[#0B3B60] font-medium'
          }`}
        >
          <FileCheck2
            className={`w-5 h-5 ${
              currentView === 'tracking' ? 'text-[#0E6655] stroke-[2.5]' : 'text-[#64748B]'
            }`}
          />
          <span className="text-[10px] mt-1 leading-none">{t('nav.applications', 'Tracking')}</span>
        </button>

        {/* 5. User Profile */}
        <button
          type="button"
          onClick={() => navigateTo('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-h-[46px] min-w-[48px] ${
            currentView === 'profile'
              ? 'text-[#0E6655] font-bold'
              : 'text-[#64748B] hover:text-[#0B3B60] font-medium'
          }`}
        >
          <User
            className={`w-5 h-5 ${
              currentView === 'profile' ? 'text-[#0E6655] stroke-[2.5]' : 'text-[#64748B]'
            }`}
          />
          <span className="text-[10px] mt-1 leading-none">{t('nav.profile', 'Profile')}</span>
        </button>
      </div>
    </nav>
  );
}
