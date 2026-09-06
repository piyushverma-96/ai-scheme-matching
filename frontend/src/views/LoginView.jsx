import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';
import supabase from '../supabaseClient';

export default function LoginView({ onLoginSuccess, initialTab = 'login' }) {
  const { navigateTo } = useApp();
  const [tab, setTab] = useState(initialTab); // 'login' | 'signup'

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (tab === 'signup') {
        // Sign Up Flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || email.split('@')[0],
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        // Auto-login or proceed
        if (data.session) {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess();
            else navigateTo('home');
          }, 400);
        } else {
          // If session was not immediately returned, sign in with password
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });
          if (signInError) throw signInError;
          if (onLoginSuccess) onLoginSuccess();
          else navigateTo('home');
        }
      } else {
        // Login Flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials or create an account.');
          }
          throw signInError;
        }

        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigateTo('home');
        }
      }
    } catch (err) {
      console.error('Auth action error:', err);
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-8 max-w-md w-full max-w-[calc(100vw-32px)] shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Logo */}
        <div className="text-center flex flex-col items-center justify-center pt-2">
          <Logo size="lg" />
          <p className="text-xs text-[#64748B] mt-2">
            Government Beneficiary Portal for NSFDC Schemes
          </p>
        </div>

        {/* Segmented Tab: Login | Sign Up */}
        <div className="flex border-b border-[#E2E8F0] text-sm">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 pt-2 text-center font-bold transition-colors relative cursor-pointer min-h-[44px] flex items-center justify-center ${
              tab === 'login' ? 'text-[#0B3B60]' : 'text-[#64748B] hover:text-[#0B3B60]'
            }`}
          >
            <span>Login</span>
            {tab === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B3B60] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 pt-2 text-center font-bold transition-colors relative cursor-pointer min-h-[44px] flex items-center justify-center ${
              tab === 'signup' ? 'text-[#0B3B60]' : 'text-[#64748B] hover:text-[#0B3B60]'
            }`}
          >
            <span>Sign Up</span>
            {tab === 'signup' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B3B60] rounded-full" />
            )}
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {tab === 'signup' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="block font-semibold text-[#1E293B]">Full Name</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#1E293B]">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block font-semibold text-[#1E293B]">Password</label>
              {tab === 'login' && (
                <span className="text-[11px] text-[#64748B]">Min. 6 characters</span>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            <span>
              {loading
                ? tab === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : tab === 'login'
                ? 'Sign In to Portal'
                : 'Create Real Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security & RLS notice */}
        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-center gap-2 text-[11px] text-[#64748B] text-center">
          <Shield className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Real Supabase Email Auth & Row-Level Data Isolation</span>
        </div>
      </div>
    </div>
  );
}
