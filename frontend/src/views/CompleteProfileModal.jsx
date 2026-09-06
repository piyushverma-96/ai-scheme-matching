import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ArrowRight, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CompleteProfileModal({ isOpen, onClose }) {
  const { user, profile, saveProfile } = useApp();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || 'Male',
    state: profile?.state || 'Madhya Pradesh',
    district: profile?.district || 'Bhopal',
    city: profile?.city || 'Bhopal',
    pincode: profile?.pincode || '462003',
    education_status: profile?.education_status || 'Graduate / Diploma',
    occupation: profile?.occupation || 'Small Business / Trade',
    annual_family_income: profile?.annual_family_income || '250000',
    purpose: profile?.purpose || 'Business Expansion / Setup',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setError('Full Name is required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await saveProfile({
        ...formData,
        email: user?.email,
        annual_family_income: Number(formData.annual_family_income) || 250000,
      });
      if (onClose) onClose();
    } catch (err) {
      console.error('Save profile error:', err);
      setError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 sm:p-8 max-w-xl w-full max-w-[calc(100vw-32px)] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E8F8F2] text-[#10B981] flex items-center justify-center shrink-0 shadow-2xs">
              <UserCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
                Complete Your Profile
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                We only collect details necessary to check your eligibility for NSFDC financial assistance.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#1E293B] p-2 rounded-lg transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Row 1: Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">
                Email (Authenticated)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-mono cursor-not-allowed"
              />
            </div>
          </div>

          {/* Row 2: Mobile Number & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">
                Mobile Number <span className="text-[10px] text-[#94A3B8] font-normal">(Contact only)</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0B3B60]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female (Eligible for Mahila Samriddhi)</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Row 3: State & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">State</label>
              <select
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0B3B60]"
              >
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Delhi">Delhi NCT</option>
                <option value="Bihar">Bihar</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="e.g. Bhopal"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#0B3B60]"
              />
            </div>
          </div>

          {/* Row 4: City/Village & Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">City / Village</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. Bhopal"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#0B3B60]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="e.g. 462003"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] outline-none focus:border-[#0B3B60]"
              />
            </div>
          </div>

          {/* Row 5: Education & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">Education Status</label>
              <select
                value={formData.education_status}
                onChange={(e) => handleChange('education_status', e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0B3B60]"
              >
                <option value="10th Pass">10th Pass or Below</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Graduate / Diploma">Graduate / Diploma</option>
                <option value="Post Graduate">Post Graduate / Professional</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">Occupation</label>
              <select
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0B3B60]"
              >
                <option value="Small Business / Trade">Small Business / Retail Trade</option>
                <option value="Artisan / Handicraft">Artisan / Handloom / Crafts</option>
                <option value="Agriculture & Allied">Agriculture & Allied Services</option>
                <option value="Service Provider">Service Provider / Self-Employed</option>
                <option value="Student">Student (Seeking Education Loan)</option>
                <option value="Unemployed">Aspiring Entrepreneur</option>
              </select>
            </div>
          </div>

          {/* Row 6: Annual Family Income & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">
                Annual Family Income (₹) <span className="text-[10px] text-[#64748B]">(NSFDC limit ≤ ₹3L)</span>
              </label>
              <input
                type="number"
                value={formData.annual_family_income}
                onChange={(e) => handleChange('annual_family_income', e.target.value)}
                placeholder="250000"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] font-mono outline-none focus:border-[#0B3B60]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#1E293B]">Purpose of Assistance</label>
              <select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0B3B60]"
              >
                <option value="Business Expansion / Setup">Business Setup / Expansion (Term Loan)</option>
                <option value="Micro Business Unit">Micro Enterprise / Self Help Group</option>
                <option value="Higher Education (ELS)">Higher Education in India / Abroad</option>
                <option value="Machinery & Equipment">Purchase of Machinery / Tools</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center gap-2.5 text-[11px] text-[#64748B]">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>Your information is protected under Row Level Security and never shared publicly.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <span>{submitting ? 'Saving Profile...' : 'Save & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
