import React from 'react';
import { Home, Layers, FileCheck2, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { currentView, navigateTo } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => navigateTo('home') },
    { id: 'schemes', label: 'Schemes', icon: Layers, action: () => navigateTo('schemes') },
    { id: 'tracking', label: 'Applications', icon: FileCheck2, action: () => navigateTo('tracking') },
    { id: 'profile', label: 'Profile', icon: User, action: () => navigateTo('profile') },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-4 py-2 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            (item.id === 'home' && currentView === 'home') ||
            (item.id === 'schemes' && (currentView === 'schemes' || currentView === 'scheme_details')) ||
            (item.id === 'tracking' && currentView === 'tracking') ||
            (item.id === 'profile' && currentView === 'profile');

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0B3B60] font-bold'
                  : 'text-[#64748B] hover:text-[#0B3B60] font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-[#0B3B60] stroke-[2.5]' : 'text-[#64748B]'
                }`}
              />
              <span className="text-[10px] mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
