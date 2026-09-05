import React from 'react';
import {
  LayoutDashboard,
  Route,
  FileCheck2,
  Bookmark,
  Users,
  Calculator,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  User,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const {
    currentView,
    navigateTo,
    startJourney,
    journeyStep,
    sidebarOpen,
    setSidebarOpen,
    setAiAssistantOpen,
  } = useApp();

  const mainNav = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: LayoutDashboard,
      action: () => navigateTo('home'),
    },
    {
      id: 'journey',
      label: 'My Journey',
      icon: Route,
      action: () => startJourney(journeyStep || 1),
    },
    {
      id: 'tracking',
      label: 'Applications',
      icon: FileCheck2,
      action: () => navigateTo('tracking'),
    },
    {
      id: 'saved_schemes',
      label: 'Saved Schemes',
      icon: Bookmark,
      action: () => navigateTo('schemes'),
    },
    {
      id: 'partners',
      label: 'Find Partner',
      icon: Users,
      action: () => navigateTo('partners'),
    },
    {
      id: 'calculator',
      label: 'EMI Calculator',
      icon: Calculator,
      action: () => navigateTo('calculator'),
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FolderOpen,
      action: () => navigateTo('documents'),
    },
    {
      id: 'ai',
      label: 'Ask ArthSetu',
      icon: MessageSquare,
      action: () => setAiAssistantOpen(true),
    },
    {
      id: 'help_trust',
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => navigateTo('help_trust'),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      action: () => navigateTo('profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => navigateTo('settings'),
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-[#E2E8F0] z-40 flex flex-col justify-between py-5 px-4 transition-transform duration-200 ease-in-out shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Mobile Top Header in Drawer */}
          <div className="flex items-center justify-between px-2 lg:hidden pb-2 border-b border-[#F1F5F9]">
            <Logo size="sm" showTagline={false} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.id === 'home' && currentView === 'home') ||
                (item.id === 'journey' && (currentView === 'journey' || currentView === 'wizard' || currentView === 'find_scheme')) ||
                (item.id === 'calculator' && currentView === 'calculator') ||
                (item.id === 'partners' && currentView === 'partners') ||
                (item.id === 'tracking' && (currentView === 'tracking' || currentView === 'my_applications')) ||
                (item.id === 'saved_schemes' && currentView === 'schemes') ||
                (item.id === 'documents' && currentView === 'documents') ||
                (item.id === 'help_trust' && currentView === 'help_trust') ||
                (item.id === 'profile' && currentView === 'profile') ||
                (item.id === 'settings' && currentView === 'settings');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0E6655] text-white shadow-xs font-bold'
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B3B60]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#64748B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Trust & Data Safety Card (matching reference image) */}
        <div className="pt-4 border-t border-[#E2E8F0]">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-[#0E6655] font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#0E6655] shrink-0" />
              <span>Your Information is Safe</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              We protect your data and use it only to provide verified scheme guidance.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
