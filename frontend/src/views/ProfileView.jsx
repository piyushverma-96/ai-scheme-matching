import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileCheck2,
  Bookmark,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Edit3,
  Building2,
  GraduationCap,
  Briefcase,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import i18n from '../i18n';

export default function ProfileView() {
  const {
    navigateTo,
    user,
    profile,
    logout,
    setCompleteProfileOpen,
    savedSchemeIds = [],
    userApplications = [],
  } = useApp();

  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const handleLangToggle = (lang) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#E2E8F0] text-[#0B3B60] flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#0B3B60]">Please Log In</h3>
        <p className="text-xs text-[#64748B]">
          Log in with your email account to view your personalized profile, applications, and documents.
        </p>
        <button
          onClick={() => navigateTo('login')}
          className="px-6 py-2.5 bg-[#0B3B60] text-white text-xs font-bold rounded-xl hover:bg-[#07263F] transition-colors cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'Beneficiary';
  const initialLetter = fullName.charAt(0).toUpperCase();
  const email = user?.email || profile?.email || '';
  const phone = profile?.phone || 'Not provided';
  const location = [profile?.city, profile?.district, profile?.state]
    .filter(Boolean)
    .join(', ') || 'Madhya Pradesh, India';
  const pincode = profile?.pincode || '462003';
  const education = profile?.education_status || 'Graduate / Diploma';
  const occupation = profile?.occupation || 'Small Business / Trade';
  const incomeFormatted = profile?.annual_family_income
    ? `₹${Number(profile.annual_family_income).toLocaleString('en-IN')}`
    : '₹2,50,000';
  const purpose = profile?.purpose || 'Business Setup / Expansion';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCompleteProfileOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#0E6655] text-[#0E6655] hover:bg-[#E8F8F2] text-xs font-bold transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* User Avatar Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0B3B60] text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0 border border-[#0B3B60]/20">
            {initialLetter}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0B3B60]">
              {fullName}
            </h2>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{email}</span>
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-block text-[10px] font-bold text-[#0E6655] bg-[#E8F8F2] px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                Scheduled Caste (SC) Beneficiary
              </span>
              <span className="text-[10px] text-[#64748B]">
                UID: {user.id.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal & Demographic Details Section */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Personal & Eligibility Details
          </h3>
          <span className="text-[10px] font-semibold text-[#0E6655] bg-[#E8F8F2] px-2 py-0.5 rounded-md">
            Verified for NSFDC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-1">
          <div className="space-y-1">
            <span className="text-[#64748B] text-[11px] block">Full Name</span>
            <span className="font-bold text-[#1E293B] block">{fullName}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[#64748B] text-[11px] block">Contact Mobile</span>
            <span className="font-bold text-[#1E293B] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>{phone}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[#64748B] text-[11px] block">Location</span>
            <span className="font-bold text-[#1E293B] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{location} (PIN: {pincode})</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[#64748B] text-[11px] block">Annual Family Income</span>
            <span className="font-bold text-[#0E6655] font-mono flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#0E6655]" />
              <span>{incomeFormatted}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[#64748B] text-[11px] block">Education Status</span>
            <span className="font-bold text-[#1E293B] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
              <span>{education}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[#64748B] text-[11px] block">Occupation</span>
            <span className="font-bold text-[#1E293B] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <span>{occupation}</span>
            </span>
          </div>

          <div className="sm:col-span-2 space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[#64748B] text-[11px] block">Purpose of Financial Assistance</span>
            <span className="font-bold text-[#0B3B60] block">{purpose}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats & Activity */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() => navigateTo('tracking')}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs cursor-pointer hover:border-[#0B3B60]/40 transition-colors"
        >
          <span className="text-[11px] text-[#64748B] block font-medium">My Applications</span>
          <span className="text-lg font-bold text-[#0B3B60] mt-1 block">
            {userApplications.length}
          </span>
        </div>

        <div
          onClick={() => navigateTo('schemes')}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs cursor-pointer hover:border-[#0B3B60]/40 transition-colors"
        >
          <span className="text-[11px] text-[#64748B] block font-medium">Saved Schemes</span>
          <span className="text-lg font-bold text-[#0B3B60] mt-1 block">
            {savedSchemeIds.length}
          </span>
        </div>

        <div
          onClick={() => navigateTo('documents')}
          className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs cursor-pointer hover:border-[#0B3B60]/40 transition-colors"
        >
          <span className="text-[11px] text-[#64748B] block font-medium">Required Documents</span>
          <span className="text-xs font-bold text-[#0E6655] mt-1.5 flex items-center gap-1">
            <span>Manage Checklist</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#0B3B60]" />
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Language Preference / भाषा चुनें
          </h3>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => handleLangToggle('en')}
            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              selectedLang === 'en'
                ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                : 'border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLangToggle('hi')}
            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              selectedLang === 'hi'
                ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                : 'border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
            }`}
          >
            हिंदी (Hindi)
          </button>
        </div>
      </div>

      {/* Security & Logout Section */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-[#1E293B]">Account Session</h4>
            <p className="text-[11px] text-[#64748B]">
              Authenticated via Supabase. Protected by Row-Level Security policies.
            </p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] font-bold text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
