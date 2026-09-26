import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import supabase from '../supabaseClient';

export default function AuthModal({ isOpen, onClose }) {
  const {
    loginDemoUser,
    pendingJourneyAction,
    setPendingJourneyAction,
    startJourney,
    setJourneyFormData,
    navigateTo,
  } = useApp();

  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAuthSuccess = (authenticatedUser) => {
    setSuccessMsg('Authentication successful! Resuming your journey...');
    setTimeout(() => {
      if (onClose) onClose();

      if (pendingJourneyAction) {
        const step = pendingJourneyAction.initialStep || 1;
        const prefill = pendingJourneyAction.prefill || {};
        if (fullName) {
          prefill.applicantName = fullName;
        }
        if (phone) {
          prefill.phone = phone;
        }
        setPendingJourneyAction(null);
        startJourney(step, prefill);
      } else {
        startJourney(1);
      }
    }, 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (tab === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full legal name as per Aadhaar.');
        return;
      }
      if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
        setError('Please enter a valid 10-digit Indian mobile number.');
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim() || null,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          // If phone was provided, prefill journey form data
          if (phone.trim()) {
            setJourneyFormData((prev) => ({ ...prev, phone: phone.trim(), applicantName: fullName.trim() }));
          }
          handleAuthSuccess(data.user);
        } else {
          // Attempt immediate sign in if session wasn't auto-returned
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password,
            });

          if (signInError) throw signInError;
          handleAuthSuccess(signInData.user);
        }
      } else {
        // Sign In Flow
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials or create a new account.');
          }
          throw signInError;
        }

        handleAuthSuccess(data.user);
      }
    } catch (err) {
      console.error('Auth error in modal:', err);
      const isNetwork =
        err?.message?.toLowerCase().includes('fetch') ||
        err?.message?.toLowerCase().includes('network') ||
        !window.navigator.onLine;

      if (isNetwork) {
        setError(
          'Supabase remote database is unreachable right now. Click "Continue with Demo Beneficiary Account" below to proceed instantly without an account!'
        );
      } else {
        setError(err?.message || 'Authentication failed. Please verify and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    if (loginDemoUser) {
      loginDemoUser(fullName || 'Aarav Sharma', email || 'aarav.sharma@example.com');
    }
    if (onClose) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-5 sm:p-7 max-w-md w-full relative max-h-[92vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center flex flex-col items-center pt-1">
          <Logo size="md" />
          <div className="mt-2.5 space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
              {tab === 'login'
                ? 'Sign In to Start Your Journey'
                : 'Create Account to Start Your Journey'}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#64748B] max-w-xs mx-auto">
              अपनी योजना आवेदन यात्रा शुरू करने और प्रगति सुरक्षित रखने के लिए साइन इन या साइन अप करें।
            </p>
          </div>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${
              tab === 'login'
                ? 'bg-white text-[#0B3B60] shadow-xs'
                : 'hover:text-[#0B3B60]'
            }`}
          >
            <span>🔐 Sign In / लॉगिन</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${
              tab === 'signup'
                ? 'bg-white text-[#0B3B60] shadow-xs'
                : 'hover:text-[#0B3B60]'
            }`}
          >
            <span>✍️ Sign Up / नया खाता</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          {tab === 'signup' && (
            <>
              {/* Full Legal Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#1E293B]">
                  Full Legal Name (as on Aadhaar) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#1E293B]">
                  Mobile Number (for SMS & Tracking) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block font-semibold text-[#1E293B]">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-[#1E293B]">
                Password <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-500">Min. 6 chars</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-1 min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{tab === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>
                  {tab === 'login' ? 'Sign In & Begin Journey' : 'Create Account & Begin Journey'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Fast Demo Option */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Or Explore Instantly
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[42px]"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>⚡ Continue with Demo Beneficiary Account (Aarav Sharma)</span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-500 text-center">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Protected under Row Level Security & Official National Portal Guidelines</span>
        </div>
      </div>
    </div>
  );
}
