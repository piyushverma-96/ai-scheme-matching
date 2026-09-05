import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, User, LogOut, ShieldCheck, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useWindowDimensions from '../hooks/useWindowDimensions';
import Logo from './Logo';
import i18n from '../i18n';

export default function Header() {
  const {
    navigateTo,
    setSidebarOpen,
    user,
    profile,
    logout,
    userApplications = [],
  } = useApp();

  const { isMobile } = useWindowDimensions();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Beneficiary';

  const displayRole = profile ? 'Beneficiary' : user ? 'Beneficiary' : 'Guest Portal';
  const initialLetter = (displayName || 'B').charAt(0).toUpperCase();

  // Notification count driven by real applications requiring attention
  const activeNotifications = userApplications.filter(
    (app) => app.status === 'Documents Required' || app.status === 'Under Review'
  );
  const notificationsCount = activeNotifications.length;

  const currentLangLabel = i18n.language === 'hi' ? 'हिंदी' : 'English';

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Side: Logo & Tagline (and mobile menu toggle) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-[#475569] hover:text-[#0B3B60] hover:bg-slate-100 rounded-xl border border-[#E2E8F0] cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-left cursor-pointer transition-transform active:scale-95"
          >
            <Logo size={isMobile ? 'sm' : 'md'} showTagline={!isMobile} />
          </button>
        </div>

        {/* Right Side: Language Switcher, Notifications & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setNotificationsOpen(false);
                setProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#0B3B60]/40 text-xs font-semibold text-[#475569] hover:text-[#0B3B60] transition-colors cursor-pointer bg-white shadow-2xs"
              aria-label="Language selector"
            >
              <Globe className="w-3.5 h-3.5 text-[#0B3B60]" />
              <span className="hidden sm:inline">{currentLangLabel}</span>
              <span className="sm:hidden">{i18n.language === 'hi' ? 'हि' : 'EN'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                    i18n.language === 'en'
                      ? 'bg-[#EFF6FF] text-[#0B3B60] font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                    i18n.language === 'hi'
                      ? 'bg-[#EFF6FF] text-[#0B3B60] font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell with Real Badge (Hidden if 0) */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0B3B60]/40 flex items-center justify-center text-[#475569] hover:text-[#0B3B60] transition-colors relative shadow-2xs cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {notificationsCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] mb-2 px-1">
                  <span className="text-xs font-bold text-[#0B3B60]">Official Notifications</span>
                  <span className="text-[10px] text-[#0E6655] font-semibold bg-[#E8F8F2] px-2 py-0.5 rounded-full border border-[#10B981]/20">
                    {notificationsCount} Active
                  </span>
                </div>
                {notificationsCount === 0 ? (
                  <p className="text-xs text-[#64748B] py-3 text-center">
                    No new alerts. All applications are up to date.
                  </p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {activeNotifications.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigateTo('tracking');
                        }}
                        className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] cursor-pointer transition-colors border border-transparent hover:border-[#BFDBFE]"
                      >
                        <p className="font-bold text-[#1E293B]">
                          {app.scheme_name} — {app.status}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Application ID: {app.application_number}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
                setLangDropdownOpen(false);
              }}
              className="flex items-center gap-2.5 bg-white border border-[#E2E8F0] hover:border-[#0B3B60]/40 rounded-xl px-2.5 sm:px-3 py-1 shadow-2xs transition-colors cursor-pointer"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#0B3B60] text-white text-xs font-bold flex items-center justify-center overflow-hidden border border-[#0B3B60]/20 shadow-2xs shrink-0">
                {initialLetter}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-[#0B3B60] block leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-[#64748B] block leading-tight font-medium">
                  {displayRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-[#F1F5F9] sm:hidden">
                  <span className="text-xs font-bold text-[#0B3B60] block">{displayName}</span>
                  <span className="text-[10px] text-[#64748B] block">{displayRole}</span>
                </div>
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigateTo('profile');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigateTo('tracking');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                      <span>My Applications</span>
                    </button>
                    <div className="my-1 border-t border-[#F1F5F9]" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigateTo('login');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0B3B60] hover:bg-[#EFF6FF] cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#0B3B60]" />
                    <span>Login / Sign Up</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
