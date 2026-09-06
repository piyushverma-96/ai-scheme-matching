import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  GraduationCap,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Building2,
  FileCheck2,
  User,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Info,
  Check,
  RotateCcw,
  Layers,
  Truck,
  Wrench,
  Tractor,
  Palette,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Comprehensive list of Indian States & Union Territories
const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const PURPOSE_OPTIONS = [
  {
    id: 'business',
    title: 'Small Business / Entrepreneurship',
    desc: 'Setting up a new enterprise, expanding existing shop/unit, purchasing machinery, or working capital',
    icon: Briefcase,
    badge: 'High Priority',
  },
  {
    id: 'education',
    title: 'Higher / Professional Education',
    desc: 'Tuition fees, study loans, ITI/Polytechnic, engineering/medical courses, or overseas education',
    icon: GraduationCap,
    badge: 'Subsidized Interest',
  },
  {
    id: 'micro_finance',
    title: 'Micro-Finance & Small Vendor',
    desc: 'Street vendors, artisans, small traders requiring fast micro-credit with zero collateral',
    icon: Store,
    badge: 'Zero Collateral',
  },
  {
    id: 'sanitation',
    title: 'Sanitation & Green Business',
    desc: 'Mechanized sewer/septic cleaning, waste management, e-rickshaws, or sanitation equipment',
    icon: Layers,
    badge: 'Special Welfare Tier',
  },
];

const BUSINESS_SECTORS = [
  { id: 'retail', label: 'Retail & Wholesale Trade', icon: Store },
  { id: 'manufacturing', label: 'Manufacturing & Fabrication', icon: Wrench },
  { id: 'services', label: 'Services, Repair & Maintenance', icon: Building2 },
  { id: 'agri_allied', label: 'Agriculture & Allied (Dairy, Poultry, Fishery)', icon: Tractor },
  { id: 'artisan', label: 'Artisan, Handloom & Handicrafts', icon: Palette },
  { id: 'transport', label: 'Transport & Commercial Logistics', icon: Truck },
];

const AMOUNT_PRESETS = [
  { label: '₹50,000', value: '50000' },
  { label: '₹1,00,000', value: '100000' },
  { label: '₹3,00,000', value: '300000' },
  { label: '₹5,00,000', value: '500000' },
  { label: '₹10,00,000', value: '1000000' },
  { label: '₹20,00,000', value: '2000000' },
  { label: '₹50,00,000', value: '5000000' },
];

const INCOME_PRESETS = [
  { label: 'Under ₹1.5 Lakh', value: '150000' },
  { label: '₹2.5 Lakh', value: '250000' },
  { label: '₹3.0 Lakh (NSFDC Cap)', value: '300000' },
  { label: '₹5.0 Lakh', value: '500000' },
  { label: 'Above ₹8.0 Lakh', value: '850000' },
];

export default function Step1UnderstandNeed({ onComplete }) {
  const {
    journeyFormData,
    setJourneyFormData,
    nextJourneyStep,
    saveJourneyProgress,
    saveProfile,
    user,
    profile,
  } = useApp();

  // ── Form State (Initialized from context, profile, or localStorage) ──
  const [applicantName, setApplicantName] = useState(
    journeyFormData?.applicantName || profile?.full_name || ''
  );
  const [dob, setDob] = useState(
    journeyFormData?.dob || profile?.date_of_birth || ''
  );
  const [age, setAge] = useState(journeyFormData?.age || '');
  const [gender, setGender] = useState(
    journeyFormData?.gender || profile?.gender || 'Male'
  );

  // Social Category & Declaration
  const [categoryKey, setCategoryKey] = useState(
    journeyFormData?.categoryKey || 'SC'
  );
  const [casteDeclared, setCasteDeclared] = useState(
    journeyFormData?.casteDeclared !== false
  );

  // Purpose & Conditional Business Fields
  const [purposeKey, setPurposeKey] = useState(
    journeyFormData?.purposeKey || 'business'
  );
  const [businessStatus, setBusinessStatus] = useState(
    journeyFormData?.businessStatus || 'new'
  );
  const [businessSector, setBusinessSector] = useState(
    journeyFormData?.businessSector || 'Retail & Wholesale Trade'
  );
  const [businessActivity, setBusinessActivity] = useState(
    journeyFormData?.businessActivity || ''
  );

  // Conditional Education Fields
  const [courseLevel, setCourseLevel] = useState(
    journeyFormData?.courseLevel || 'graduate'
  );
  const [studyLocation, setStudyLocation] = useState(
    journeyFormData?.studyLocation || 'india'
  );

  // Conditional Sanitation Profile
  const [sanitationProfile, setSanitationProfile] = useState(
    journeyFormData?.sanitationProfile || 'mechanized_cleaning'
  );

  // Financial Requirements
  const [fundingAmount, setFundingAmount] = useState(
    journeyFormData?.fundingAmount || '300000'
  );
  const [familyIncome, setFamilyIncome] = useState(() => {
    if (journeyFormData?.familyIncome && journeyFormData.familyIncome !== 'undefined') {
      return String(journeyFormData.familyIncome);
    }
    if (profile?.annual_family_income != null) {
      return String(profile.annual_family_income);
    }
    return '250000';
  });

  // Socio-Economic Profile
  const [educationStatus, setEducationStatus] = useState(
    journeyFormData?.educationStatus || profile?.education_status || 'graduate'
  );
  const [occupation, setOccupation] = useState(
    journeyFormData?.occupation || profile?.occupation || 'Self-Employed / Micro-Entrepreneur'
  );

  // Location Details
  const [stateName, setStateName] = useState(
    journeyFormData?.stateName || journeyFormData?.state || profile?.state || 'Madhya Pradesh'
  );
  const [district, setDistrict] = useState(
    journeyFormData?.district || profile?.district || 'Bhopal'
  );
  const [city, setCity] = useState(
    journeyFormData?.city || profile?.city || 'Bhopal'
  );
  const [pincode, setPincode] = useState(
    journeyFormData?.pincode || profile?.pincode || '462001'
  );

  // UI / Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Auto-calculate age from DOB if entered
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      if (!isNaN(birthDate.getTime())) {
        const diffMs = Date.now() - birthDate.getTime();
        const calculatedAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
        if (calculatedAge > 0 && calculatedAge < 120) {
          setAge(String(calculatedAge));
        }
      }
    }
  }, [dob]);

  // Sync back from profile if user logged in after initial load
  useEffect(() => {
    if (profile) {
      if (!applicantName && profile.full_name) setApplicantName(profile.full_name);
      if (!dob && profile.date_of_birth) setDob(profile.date_of_birth);
      if (!stateName && profile.state) setStateName(profile.state);
      if (!district && profile.district) setDistrict(profile.district);
      if (!city && profile.city) setCity(profile.city);
      if (!pincode && profile.pincode) setPincode(profile.pincode);
    }
  }, [profile]);

  // Continuous background auto-save to context & localStorage to prevent data loss on refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = {
        applicantName,
        dob,
        age,
        gender,
        categoryKey,
        casteDeclared,
        purposeKey,
        businessStatus,
        businessSector,
        businessActivity,
        courseLevel,
        studyLocation,
        sanitationProfile,
        fundingAmount,
        amount: Number(fundingAmount) || 300000,
        amountFormatted: `₹${Number(fundingAmount || 0).toLocaleString('en-IN')}`,
        familyIncome,
        incomeValue: Number(familyIncome) || 250000,
        educationStatus,
        occupation,
        state: stateName,
        stateName,
        district,
        city,
        pincode,
      };
      if (setJourneyFormData) {
        setJourneyFormData(draft);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [
    applicantName,
    dob,
    age,
    gender,
    categoryKey,
    casteDeclared,
    purposeKey,
    businessStatus,
    businessSector,
    businessActivity,
    courseLevel,
    studyLocation,
    sanitationProfile,
    fundingAmount,
    familyIncome,
    educationStatus,
    occupation,
    stateName,
    district,
    city,
    pincode,
    setJourneyFormData,
  ]);

  // Handle Natural Language AI Text Auto-Fill
  const handleAiAutoFill = (e) => {
    e.preventDefault();
    if (!aiInputText.trim()) return;

    const text = aiInputText.toLowerCase();

    // 1. Detect Purpose
    if (text.includes('education') || text.includes('college') || text.includes('study') || text.includes('degree') || text.includes('btech')) {
      setPurposeKey('education');
    } else if (text.includes('sanitation') || text.includes('sewer') || text.includes('cleaning') || text.includes('septic') || text.includes('tanker')) {
      setPurposeKey('sanitation');
    } else if (text.includes('vendor') || text.includes('artisan') || text.includes('handloom') || text.includes('hawker') || text.includes('micro')) {
      setPurposeKey('micro_finance');
    } else {
      setPurposeKey('business');
    }

    // 2. Detect Amount
    if (text.includes('10 lakh') || text.includes('10,00,000') || text.includes('1000000')) {
      setFundingAmount('1000000');
    } else if (text.includes('5 lakh') || text.includes('5,00,000') || text.includes('500000')) {
      setFundingAmount('500000');
    } else if (text.includes('3 lakh') || text.includes('3,00,000') || text.includes('300000')) {
      setFundingAmount('300000');
    } else if (text.includes('2 lakh') || text.includes('2,00,000') || text.includes('200000')) {
      setFundingAmount('200000');
    } else if (text.includes('1 lakh') || text.includes('1,00,000') || text.includes('100000')) {
      setFundingAmount('100000');
    } else if (text.includes('50 thousand') || text.includes('50,000') || text.includes('50000')) {
      setFundingAmount('50000');
    }

    // 3. Detect Income
    if (text.includes('income 1.5') || text.includes('income 1,50,000')) {
      setFamilyIncome('150000');
    } else if (text.includes('income 2') || text.includes('income 2,00,000')) {
      setFamilyIncome('200000');
    } else if (text.includes('income 3') || text.includes('income 3,00,000')) {
      setFamilyIncome('300000');
    }

    // 4. Detect Cities
    if (text.includes('bhopal')) {
      setCity('Bhopal');
      setDistrict('Bhopal');
      setStateName('Madhya Pradesh');
    } else if (text.includes('indore')) {
      setCity('Indore');
      setDistrict('Indore');
      setStateName('Madhya Pradesh');
    } else if (text.includes('jabalpur')) {
      setCity('Jabalpur');
      setDistrict('Jabalpur');
      setStateName('Madhya Pradesh');
    } else if (text.includes('delhi')) {
      setCity('New Delhi');
      setDistrict('New Delhi');
      setStateName('Delhi');
    }

    setAiSuccessMsg('Profile fields successfully updated from your description!');
    setTimeout(() => setAiSuccessMsg(''), 4000);
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!applicantName.trim()) {
      errs.applicantName = 'Please enter beneficiary / applicant full name.';
    }
    if (!fundingAmount || Number(fundingAmount) <= 0) {
      errs.fundingAmount = 'Please provide required financial support amount.';
    }
    if (!familyIncome || Number(familyIncome) <= 0) {
      errs.familyIncome = 'Please provide annual household income.';
    }
    if (!stateName.trim()) {
      errs.stateName = 'Please select your state.';
    }
    if (!district.trim()) {
      errs.district = 'Please enter your district.';
    }
    if (!city.trim()) {
      errs.city = 'Please enter your city, town, or village.';
    }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      errs.pincode = 'Please enter a valid 6-digit postal pincode.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const numAmount = Number(fundingAmount) || 300000;
      const numIncome = Number(familyIncome) || 250000;

      const categoryLabels = {
        SC: 'Scheduled Caste (SC)',
        OBC: 'Other Backward Classes (OBC)',
        ST: 'Scheduled Tribe (ST)',
        SafaiKaramchari: 'Safai Karamchari / Sanitation Worker',
        General: 'General / Other',
      };

      const purposeLabels = {
        business: 'Small Business / Entrepreneurship',
        education: 'Higher Education / Technical Training',
        micro_finance: 'Micro-Finance & Small Vendor',
        sanitation: 'Sanitation & Green Business Enterprise',
      };

      const canonicalPayload = {
        applicantName: applicantName.trim(),
        dob: dob || null,
        age: age ? Number(age) : null,
        gender,
        category: categoryLabels[categoryKey] || 'Scheduled Caste (SC)',
        categoryKey,
        casteDeclared,
        purpose: purposeLabels[purposeKey] || 'Small Business / Entrepreneurship',
        purposeKey,
        businessStatus: isBusinessPurpose ? businessStatus : 'not_applicable',
        businessSector: isBusinessPurpose ? businessSector : 'not_applicable',
        businessActivity: isBusinessPurpose ? businessActivity : '',
        courseLevel: purposeKey === 'education' ? courseLevel : 'not_applicable',
        studyLocation: purposeKey === 'education' ? studyLocation : 'not_applicable',
        sanitationProfile: purposeKey === 'sanitation' ? sanitationProfile : 'not_applicable',
        fundingAmount: String(numAmount),
        amount: numAmount,
        amountFormatted: `₹${numAmount.toLocaleString('en-IN')}`,
        familyIncome: String(numIncome),
        incomeValue: numIncome,
        educationStatus,
        occupation,
        state: stateName,
        stateName,
        district: district.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        areaType: 'Semi-Urban',
      };

      // 1. Update Context & LocalStorage
      if (setJourneyFormData) {
        setJourneyFormData(canonicalPayload);
      }

      // 2. Persist to Supabase user_journey table under authenticated user
      if (saveJourneyProgress) {
        await saveJourneyProgress(2, canonicalPayload);
      }

      // 3. Persist to Supabase profiles table if authenticated user
      if (user && saveProfile) {
        try {
          await saveProfile({
            full_name: applicantName.trim(),
            date_of_birth: dob || null,
            gender: gender || 'Male',
            state: stateName,
            district: district.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            education_status: educationStatus,
            occupation: occupation,
            annual_family_income: numIncome,
            purpose: purposeLabels[purposeKey],
          });
        } catch (profErr) {
          console.warn('Profile save note:', profErr);
        }
      }

      // 4. Progress to Stage 2 (Checking scheme eligibility)
      if (onComplete) {
        onComplete();
      } else if (nextJourneyStep) {
        nextJourneyStep();
      }
    } catch (err) {
      console.error('Error submitting Stage 1 form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Reset all fields in this intake form to defaults?')) {
      setApplicantName('');
      setDob('');
      setAge('');
      setGender('Male');
      setCategoryKey('SC');
      setCasteDeclared(true);
      setPurposeKey('business');
      setBusinessStatus('new');
      setBusinessSector('Retail & Wholesale Trade');
      setBusinessActivity('');
      setFundingAmount('300000');
      setFamilyIncome('250000');
      setEducationStatus('graduate');
      setOccupation('Self-Employed / Micro-Entrepreneur');
      setStateName('Madhya Pradesh');
      setDistrict('Bhopal');
      setCity('Bhopal');
      setPincode('462001');
      setErrors({});
    }
  };

  const isBusinessPurpose = purposeKey === 'business' || purposeKey === 'micro_finance';
  const isEducationPurpose = purposeKey === 'education';
  const isSanitationPurpose = purposeKey === 'sanitation';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── 1. OFFICIAL FORM HEADER BANNER ── */}
      <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#0B3B60] via-[#2563EB] to-[#0F8B8D]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                <ShieldCheck className="w-3 h-3 text-[#2563EB]" />
                <span>OFFICIAL INTAKE · FORM ARTH-01</span>
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">
                Direct Scheme Eligibility Matching
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#0B3B60] tracking-tight">
              Beneficiary Intake & Scheme Requirement Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl">
              Complete this single statutory assessment form. ArthSetu AI cross-references your demographic,
              purpose, and income criteria against apex welfare corporations (NSFDC, NBCFDC, NSKFDC) and central
              credit guarantees.
            </p>
          </div>

          {/* AI Assist Drawer Toggle */}
          <button
            type="button"
            onClick={() => setAiAssistOpen(!aiAssistOpen)}
            className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>{aiAssistOpen ? 'Close Smart Fill' : '⚡ Quick Auto-Fill with AI'}</span>
          </button>
        </div>

        {/* Optional Collapsible AI Assist Panel */}
        {aiAssistOpen && (
          <div className="mt-5 pt-5 border-t border-[#E2E8F0] space-y-3 bg-[#F8FAFC] -mx-6 -mb-6 p-6 rounded-b-3xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B3B60] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Describe your requirement in ordinary language
              </span>
              <span className="text-[11px] text-[#64748B]">Optional Assistant</span>
            </div>

            <form onSubmit={handleAiAutoFill} className="space-y-3">
              <textarea
                rows={2}
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="e.g., I want to start a footwear retail shop in Bhopal, I need ₹3 Lakh support, and our family income is ₹2.5 Lakh per year."
                className="w-full p-3.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm bg-white outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
              />

              <div className="flex items-center justify-between">
                {aiSuccessMsg ? (
                  <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {aiSuccessMsg}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#64748B]">
                    Our parser will automatically extract your purpose, amount, income, and city into this form.
                  </span>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Populate Form Fields
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── 2. SINGLE COMPREHENSIVE INTAKE FORM ── */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── SECTION A: BENEFICIARY IDENTITY & PERSONAL DEMOGRAPHICS ── */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B3B60]">
                1. Beneficiary Identity & Personal Demographics
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Primary applicant profile used for Aadhaar KYC and state channelizing records.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Full Legal Name (as in Aadhaar / Official ID) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => {
                  setApplicantName(e.target.value);
                  if (errors.applicantName) setErrors((prev) => ({ ...prev, applicantName: null }));
                }}
                placeholder="Enter your full name as per Aadhaar"
                className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                  errors.applicantName
                    ? 'border-[#DC2626] bg-[#FEF2F2] focus:ring-2 focus:ring-[#DC2626]/20'
                    : 'border-[#CBD5E1] bg-white focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10'
                }`}
              />
              {errors.applicantName && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{errors.applicantName}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Gender <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0B3B60]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female (Special Women Subvention Eligible)</option>
                <option value="Transgender">Transgender</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#334155]">
                  Date of Birth
                </label>
                <span className="text-[10px] text-[#64748B]">Optional / Formats age</span>
              </div>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0B3B60]"
              />
            </div>

            {/* Age in Years */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Age (in Years) <span className="text-[10px] font-normal text-[#64748B]">(18–50 for entrepreneurship)</span>
              </label>
              <input
                type="number"
                min={16}
                max={99}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-mono font-medium outline-none focus:border-[#0B3B60]"
              />
            </div>

            {/* Social Category / Community Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Social Category / Community <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#0B3B60] bg-[#EFF6FF] text-xs sm:text-sm font-bold text-[#0B3B60] outline-none"
              >
                <option value="SC">Scheduled Caste (SC) — NSFDC Priority</option>
                <option value="OBC">Other Backward Classes (OBC) — NBCFDC Slabs</option>
                <option value="ST">Scheduled Tribe (ST) — NSTFDC Schemes</option>
                <option value="SafaiKaramchari">Safai Karamchari / Waste Worker (NSKFDC)</option>
                <option value="General">General / Other (PMEGP / Mudra / Stand-Up India)</option>
              </select>
            </div>
          </div>

          {/* Statutory Category Self-Declaration */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:bg-[#F1F5F9] transition-all">
              <input
                type="checkbox"
                checked={casteDeclared}
                onChange={(e) => setCasteDeclared(e.target.checked)}
                className="w-4 h-4 rounded text-[#0B3B60] accent-[#0B3B60] mt-0.5 shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#1E293B] block">
                  Statutory Community & Eligibility Declaration
                </span>
                <span className="text-[11px] text-[#475569] leading-relaxed block">
                  I hereby self-declare that the information provided is accurate and that I hold, or am eligible to obtain,
                  the required caste/community certificate from the competent revenue/welfare authority to avail targeted government concessional benefits.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* ── SECTION B: PURPOSE & REQUIREMENT (WITH CONDITIONAL FIELDS) ── */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
            <div className="w-8 h-8 rounded-xl bg-[#E8F8F2] text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B3B60]">
                2. Assistance Requirement & Activity Details
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Identify whether your primary need is business setup, higher education, or specialized equipment.
              </p>
            </div>
          </div>

          {/* Purpose Selector Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#334155]">
              Primary Purpose of Assistance <span className="text-[#DC2626]">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PURPOSE_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = purposeKey === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPurposeKey(opt.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-[#0B3B60] bg-[#EFF6FF] shadow-xs'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#0B3B60] text-white'
                              : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-[#0B3B60] text-white'
                              : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <h3
                        className={`text-xs sm:text-sm font-bold leading-snug ${
                          isSelected ? 'text-[#0B3B60]' : 'text-[#1E293B]'
                        }`}
                      >
                        {opt.title}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-[#64748B] leading-normal line-clamp-3">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                      <span className={isSelected ? 'text-[#0B3B60]' : 'text-[#94A3B8]'}>
                        {isSelected ? 'Selected ✓' : 'Select'}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#0B3B60] bg-[#0B3B60] text-white'
                            : 'border-[#CBD5E1]'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CONDITIONAL SUB-SECTION: BUSINESS FIELDS (SHOWN IF BUSINESS OR MICRO_FINANCE) ── */}
          {isBusinessPurpose && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#BFDBFE] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <h4 className="text-xs font-bold text-[#0B3B60] uppercase tracking-wide">
                  Enterprise Details (Required for Term Loan & Margin Money Matching)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#334155]">
                    Business Status <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBusinessStatus('new')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center min-h-[44px] ${
                        businessStatus === 'new'
                          ? 'bg-[#0B3B60] text-white border-[#0B3B60] shadow-2xs'
                          : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-slate-50'
                      }`}
                    >
                      New Enterprise (Greenfield / Setup)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusinessStatus('existing')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center min-h-[44px] ${
                        businessStatus === 'existing'
                          ? 'bg-[#0B3B60] text-white border-[#0B3B60] shadow-2xs'
                          : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-slate-50'
                      }`}
                    >
                      Existing Enterprise (Expansion / Modernization)
                    </button>
                  </div>
                </div>

                {/* Business Sector / Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#334155]">
                    Business Type / Sector <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={businessSector}
                    onChange={(e) => setBusinessSector(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0B3B60]"
                  >
                    {BUSINESS_SECTORS.map((sec) => (
                      <option key={sec.id} value={sec.label}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brief Business Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#334155]">
                  Proposed Business Activity / Machinery Requirement (Brief)
                </label>
                <input
                  type="text"
                  value={businessActivity}
                  onChange={(e) => setBusinessActivity(e.target.value)}
                  placeholder="e.g. Setting up a garment tailoring & embroidery shop, purchasing 2 industrial sewing machines"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0B3B60]"
                />
              </div>
            </div>
          )}

          {/* ── CONDITIONAL SUB-SECTION: EDUCATION FIELDS (SHOWN IF EDUCATION) ── */}
          {isEducationPurpose && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <h4 className="text-xs font-bold text-[#0B3B60] uppercase tracking-wide">
                  Academic Details (Required for NSFDC Educational Loan Scheme & Interest Subvention)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#334155]">
                    Course Level / Target Qualification <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0B3B60]"
                  >
                    <option value="12th_pass">12th Standard Passed (Seeking Undergraduate Degree / B.Tech / MBBS / B.Sc)</option>
                    <option value="graduate">Graduate (Seeking Post-Graduate / Masters / Professional Course)</option>
                    <option value="vocational">Vocational / Technical Diploma (ITI / Polytechnic)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#334155]">
                    Study Location <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStudyLocation('india')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center min-h-[44px] ${
                        studyLocation === 'india'
                          ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                          : 'bg-white text-[#475569] border-[#CBD5E1]'
                      }`}
                    >
                      Within India (Up to ₹20 Lakh)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudyLocation('abroad')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center min-h-[44px] ${
                        studyLocation === 'abroad'
                          ? 'bg-[#0B3B60] text-white border-[#0B3B60]'
                          : 'bg-white text-[#475569] border-[#CBD5E1]'
                      }`}
                    >
                      Study Abroad (Up to ₹50 Lakh)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CONDITIONAL SUB-SECTION: SANITATION FIELDS (SHOWN IF SANITATION) ── */}
          {isSanitationPurpose && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#E7F6F6] border border-[#0F8B8D]/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0F8B8D]" />
                <h4 className="text-xs font-bold text-[#0B696B] uppercase tracking-wide">
                  Sanitation Equipment Category (NSKFDC / Swachhta Udyami Yojana)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'mechanized_cleaning', label: 'Mechanized Suction & Jetting Equipment' },
                  { id: 'waste_management', label: 'Solid Waste Segregation & E-Garbage Vehicle' },
                  { id: 'sanitation_mart', label: 'Community Sanitation Facility / Bio-Toilet Unit' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSanitationProfile(item.id)}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                      sanitationProfile === item.id
                        ? 'bg-[#0B696B] text-white border-[#0B696B]'
                        : 'bg-white text-[#475569] border-[#CBD5E1]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION C: FINANCIAL SUPPORT & ECONOMIC PROFILE ── */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
            <div className="w-8 h-8 rounded-xl bg-[#FDF5E7] text-[#C77D02] flex items-center justify-center font-bold text-xs shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B3B60]">
                3. Financial Support & Household Income Threshold
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Accurate figures ensure your profile matches exact scheme loan limits, margin contributions, and interest ceilings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Required Financial Support Amount */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <label className="block text-xs font-bold text-[#334155]">
                  Required Financial Support Amount (₹) <span className="text-[#DC2626]">*</span>
                </label>
                <span className="text-xs font-bold font-mono text-[#0B3B60] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
                  ₹{Number(fundingAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">₹</span>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={fundingAmount}
                  onChange={(e) => {
                    setFundingAmount(e.target.value);
                    if (errors.fundingAmount) setErrors((prev) => ({ ...prev, fundingAmount: null }));
                  }}
                  placeholder="300000"
                  className={`w-full h-12 pl-8 pr-4 rounded-xl border text-sm sm:text-base font-mono font-bold outline-none transition-all ${
                    errors.fundingAmount
                      ? 'border-[#DC2626] bg-[#FEF2F2]'
                      : 'border-[#CBD5E1] bg-white focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10'
                  }`}
                />
              </div>
              {errors.fundingAmount && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{errors.fundingAmount}</p>
              )}

              {/* Amount Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Quick Select Amount:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AMOUNT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFundingAmount(preset.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fundingAmount === preset.value
                          ? 'bg-[#0B3B60] text-white shadow-2xs'
                          : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Annual Family Income */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <label className="block text-xs font-bold text-[#334155]">
                  Annual Household / Family Income (₹) <span className="text-[#DC2626]">*</span>
                </label>
                <span className="text-xs font-bold font-mono text-[#0B3B60] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
                  ₹{Number(familyIncome || 0).toLocaleString('en-IN')} / year
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">₹</span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={familyIncome}
                  onChange={(e) => {
                    setFamilyIncome(e.target.value);
                    if (errors.familyIncome) setErrors((prev) => ({ ...prev, familyIncome: null }));
                  }}
                  placeholder="250000"
                  className={`w-full h-12 pl-8 pr-4 rounded-xl border text-sm sm:text-base font-mono font-bold outline-none transition-all ${
                    errors.familyIncome
                      ? 'border-[#DC2626] bg-[#FEF2F2]'
                      : 'border-[#CBD5E1] bg-white focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10'
                  }`}
                />
              </div>
              {errors.familyIncome && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{errors.familyIncome}</p>
              )}

              {/* Income Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Quick Select Income Slab:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {INCOME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFamilyIncome(preset.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        familyIncome === preset.value
                          ? 'bg-[#0B3B60] text-white shadow-2xs'
                          : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Income Guidance Box */}
          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#1E40AF] leading-relaxed">
              <strong>Government Eligibility Note:</strong> For NSFDC and NBCFDC concessional lending schemes,
              the statutory income eligibility ceiling is <strong>₹3,00,000 per annum</strong>. Applicants within this limit qualify
              for standard concessional interest tiers (4%–6% p.a.). Special credit lines exist for higher brackets under Stand-Up India and PMEGP.
            </p>
          </div>
        </div>

        {/* ── SECTION D: OCCUPATION & EDUCATION STATUS ── */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
            <div className="w-8 h-8 rounded-xl bg-[#E8F8F2] text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B3B60]">
                4. Education Status & Present Occupation
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Provides necessary criteria for technical entrepreneurship, skill training, and educational loan tiers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Occupation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Current Occupation <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0B3B60]"
              >
                <option value="Self-Employed / Micro-Entrepreneur">Self-Employed / Micro-Entrepreneur</option>
                <option value="Daily Wage Earner / Informal Worker">Daily Wage Earner / Informal Worker</option>
                <option value="Traditional Artisan / Weaver">Traditional Artisan / Weaver / Craftsperson</option>
                <option value="Salaried / Private Sector Employee">Salaried / Private Sector Employee</option>
                <option value="Student / Aspiring Scholar">Student / Aspiring Scholar</option>
                <option value="Unemployed / Seeking Self-Employment">Unemployed / Seeking Self-Employment</option>
                <option value="Agriculture / Allied Cultivator">Agriculture / Allied Cultivator</option>
              </select>
            </div>

            {/* Education Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Highest Educational Qualification <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={educationStatus}
                onChange={(e) => setEducationStatus(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0B3B60]"
              >
                <option value="below_10th">Below 10th Standard (Elementary / Primary)</option>
                <option value="10th_pass">10th Standard Passed (Matriculation)</option>
                <option value="12th_pass">12th Standard Passed (Higher Secondary)</option>
                <option value="graduate">Graduate / Polytechnic Diploma (B.A. / B.Sc / B.Tech / Diploma)</option>
                <option value="post_graduate">Post-Graduate / Professional Degree (M.A. / M.Sc / M.Tech / MBA / Ph.D)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── SECTION E: LOCATION & JURISDICTION ── */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B3B60]">
                5. Location & Channel Partner Jurisdiction
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Used to route your scheme application to your state-authorized channelizing agency (SCA) and nearest lead bank branch.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* State */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                State / UT <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={stateName}
                onChange={(e) => {
                  setStateName(e.target.value);
                  if (errors.stateName) setErrors((prev) => ({ ...prev, stateName: null }));
                }}
                className={`w-full h-11 px-3 rounded-xl border text-xs sm:text-sm font-medium outline-none bg-white transition-all ${
                  errors.stateName ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1] focus:border-[#0B3B60]'
                }`}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.stateName && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{errors.stateName}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                District <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (errors.district) setErrors((prev) => ({ ...prev, district: null }));
                }}
                placeholder="e.g. Bhopal"
                className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                  errors.district ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1] bg-white focus:border-[#0B3B60]'
                }`}
              />
              {errors.district && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{errors.district}</p>
              )}
            </div>

            {/* City / Town / Village */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                City / Town / Village <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: null }));
                }}
                placeholder="e.g. Bhopal"
                className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                  errors.city ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1] bg-white focus:border-[#0B3B60]'
                }`}
              />
              {errors.city && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{errors.city}</p>
              )}
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#334155]">
                Pincode (6-Digits) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPincode(cleaned);
                  if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: null }));
                }}
                placeholder="462001"
                className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-mono font-bold outline-none transition-all ${
                  errors.pincode ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1] bg-white focus:border-[#0B3B60]'
                }`}
              />
              {errors.pincode && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{errors.pincode}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. FORM ACTION BAR & SUBMISSION CONTROLS ── */}
        <div className="bg-white rounded-3xl border border-[#CBD5E1] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#0B3B60] block">
              Stage 1 Intake Ready
            </span>
            <p className="text-[11px] text-[#64748B]">
              Submitting saves your verified profile under your account and generates matched schemes in Stage 2.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving & Matching...</span>
                </>
              ) : (
                <>
                  <span>SAVE PROFILE & CHECK ELIGIBILITY</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
