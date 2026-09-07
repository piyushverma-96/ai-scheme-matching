import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation & Views
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [schemeDetailModalOpen, setSchemeDetailModalOpen] = useState(false);
  const [selectedSchemeForDetail, setSelectedSchemeForDetail] = useState(null);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);

  // Authentication State
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // User-specific Persistent State
  const [userApplications, setUserApplications] = useState([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState([]);
  const [userDocuments, setUserDocuments] = useState([]);

  // 6-Step Journey Canonical State
  const [journeyStep, setJourneyStep] = useState(1); // 1 to 6

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__setJourneyStep = setJourneyStep;
      window.__setCurrentView = setCurrentView;
    }
  }, []);

  const defaultJourneyData = {
    applicantName: '',
    dob: '',
    age: '',
    gender: 'Male',
    purpose: 'Small Business / Entrepreneurship',
    purposeKey: 'business',
    businessStatus: 'new',
    businessSector: 'Retail / Wholesale Trade',
    businessActivity: '',
    courseLevel: 'undergraduate',
    studyLocation: 'india',
    sanitationProfile: 'mechanized_cleaning',
    fundingAmount: '300000',
    amount: 300000,
    amountFormatted: '₹3,00,000',
    familyIncome: '250000',
    incomeValue: 250000,
    education: 'Graduate / Diploma',
    educationStatus: 'graduate',
    occupation: 'Self-Employed / Micro-Entrepreneur',
    category: 'Scheduled Caste (SC)',
    categoryKey: 'SC',
    casteDeclared: true,
    state: 'Madhya Pradesh',
    stateName: 'Madhya Pradesh',
    district: 'Bhopal',
    city: 'Bhopal',
    pincode: '462001',
    areaType: 'Semi-Urban',
  };

  const [journeyFormData, setJourneyFormDataState] = useState(() => {
    try {
      const cached = localStorage.getItem('arthsetu_journey_form_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...defaultJourneyData, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read cached journey form data:', e);
    }
    return defaultJourneyData;
  });

  const setJourneyFormData = useCallback((dataOrFn) => {
    setJourneyFormDataState((prev) => {
      const next = typeof dataOrFn === 'function' ? dataOrFn(prev) : { ...prev, ...dataOrFn };
      try {
        localStorage.setItem('arthsetu_journey_form_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Step 1 Form & Requirement Fields (Aligned with Rule Engine)
  const [formData, setFormData] = useState({
    purpose: 'business',
    annual_family_income: '250000',
    loan_amount: '300000',
    project_cost: '333333',
    sc_caste_declared: true,
    education_status: 'graduate',
    study_location: 'india',
    gender: 'Male',
    city: 'Bhopal',
    latitude: 23.2599,
    longitude: 77.4126,
  });

  // Selected Scheme & Partner State
  const [selectedScheme, setSelectedScheme] = useState({
    id: 'nsfdc_term_loan',
    name: 'NSFDC Term Loan Scheme',
    shortName: 'Term Loan',
    category: 'National Scheduled Castes Finance & Development Corp',
    maxLimit: '₹50 Lakh',
    maxLimitVal: 5000000,
    interestRate: '8.0% p.a.',
    interestRateVal: 8.0,
    subsidy: '90% Project Cost Financing',
    subsidyVal: 90,
    tenure: 'Up to 7 Years (84 Months)',
    tenureMonths: 84,
    moratorium: '6 Months Moratorium',
    moratoriumMonths: 6,
  });

  const [selectedPartner, setSelectedPartner] = useState(null);

  // AI Assistant & Recommendation State
  const [aiInputText, setAiInputText] = useState('');
  const [aiExtractionResult, setAiExtractionResult] = useState(null);
  const [recommendResult, setRecommendResult] = useState(null);
  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [partners, setPartners] = useState([]);

  // EMI Calculator State
  const [emiConfig, setEmiConfig] = useState({
    amount: 300000,
    rate: 8.0,
    tenure: 60,
    moratoriumMonths: 6,
  });
  const [emiResult, setEmiResult] = useState(null);

  // ── 1. Fetch User Data from Supabase under RLS ────────────────────────────
  const fetchUserData = useCallback(async (activeUser) => {
    if (!activeUser) {
      setProfile(null);
      setUserApplications([]);
      setSavedSchemeIds([]);
      setUserDocuments([]);
      setJourneyStep(1);
      return;
    }

    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', activeUser.id)
        .maybeSingle();

      if (profileErr) {
        console.warn('Profile fetch notice:', profileErr.message);
      }

      if (profileData) {
        setProfile(profileData);
        setFormData((prev) => ({
          ...prev,
          annual_family_income: profileData.annual_family_income
            ? String(profileData.annual_family_income)
            : prev.annual_family_income,
          city: profileData.city || prev.city,
          gender: profileData.gender || prev.gender,
        }));
        setJourneyFormData((prev) => ({
          ...prev,
          applicantName: prev.applicantName || profileData.full_name || '',
          dob: prev.dob || profileData.date_of_birth || '',
          state: profileData.state || prev.state,
          stateName: profileData.state || prev.stateName,
          district: profileData.district || prev.district,
          city: profileData.city || prev.city,
          pincode: profileData.pincode || prev.pincode,
          educationStatus: profileData.education_status || prev.educationStatus,
          occupation: profileData.occupation || prev.occupation,
          familyIncome: profileData.annual_family_income ? String(profileData.annual_family_income) : prev.familyIncome,
        }));
      } else {
        setProfile(null);
        // New user without profile -> trigger complete profile modal
        setCompleteProfileOpen(true);
      }

      // 2. Fetch Journey Persistence
      const { data: journeyData } = await supabase
        .from('user_journey')
        .select('*')
        .eq('user_id', activeUser.id)
        .maybeSingle();

      if (journeyData) {
        if (journeyData.current_step) setJourneyStep(journeyData.current_step);
        if (journeyData.form_data && Object.keys(journeyData.form_data).length > 0) {
          setJourneyFormData((prev) => ({ ...prev, ...journeyData.form_data }));
        }
      } else {
        setJourneyStep(1);
      }

      // 3. Fetch Saved Schemes
      const { data: savedData } = await supabase
        .from('saved_schemes')
        .select('scheme_id')
        .eq('user_id', activeUser.id);

      if (savedData) {
        setSavedSchemeIds(savedData.map((s) => s.scheme_id));
      }

      // 4. Fetch User Applications
      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', activeUser.id)
        .order('created_at', { ascending: false });

      if (appData) {
        setUserApplications(appData);
      }

      // 5. Fetch User Documents
      const { data: docData } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', activeUser.id)
        .order('created_at', { ascending: false });

      if (docData) {
        setUserDocuments(docData);
      }
    } catch (err) {
      console.error('Error fetching user data from Supabase:', err);
    }
  }, []);

  // ── 2. Initialize & Listen to Supabase Auth State ─────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      const initialUser = initialSession?.user ?? null;
      setUser(initialUser);
      if (initialUser) {
        fetchUserData(initialUser).finally(() => setIsLoadingAuth(false));
      } else {
        setIsLoadingAuth(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      const authUser = newSession?.user ?? null;
      setUser(authUser);
      if (authUser) {
        await fetchUserData(authUser);
      } else {
        setProfile(null);
        setUserApplications([]);
        setSavedSchemeIds([]);
        setUserDocuments([]);
        setJourneyStep(1);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserData]);

  // ── 3. Profile Management ────────────────────────────────────────────────
  const saveProfile = async (profileData) => {
    if (!user) throw new Error('You must be logged in to save your profile.');

    const payload = {
      user_id: user.id,
      full_name: profileData.full_name,
      email: user.email,
      phone: profileData.phone || null,
      date_of_birth: profileData.date_of_birth || null,
      gender: profileData.gender || 'Male',
      state: profileData.state || 'Madhya Pradesh',
      district: profileData.district || 'Bhopal',
      city: profileData.city || 'Bhopal',
      pincode: profileData.pincode || '462003',
      education_status: profileData.education_status || 'Graduate / Diploma',
      occupation: profileData.occupation || 'Small Business / Trade',
      annual_family_income: profileData.annual_family_income || 250000,
      purpose: profileData.purpose || 'Business Expansion / Setup',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    setCompleteProfileOpen(false);

    // Sync to journey form data
    setJourneyFormData((prev) => ({
      ...prev,
      applicantName: data.full_name || prev.applicantName,
      dob: data.date_of_birth || prev.dob,
      state: data.state || prev.state,
      stateName: data.state || prev.stateName,
      district: data.district || prev.district,
      city: data.city || prev.city,
      pincode: data.pincode || prev.pincode,
      familyIncome: `₹${(data.annual_family_income / 100000).toFixed(1)} Lakh`,
      incomeValue: data.annual_family_income,
      education: data.education_status || prev.education,
      educationStatus: data.education_status || prev.educationStatus,
      occupation: data.occupation || prev.occupation,
      purpose: data.purpose || prev.purpose,
    }));

    return data;
  };

  // ── 4. Save Journey Progress ─────────────────────────────────────────────
  const saveJourneyProgress = async (stepNum, newFormData = null, schemeId = null, partnerId = null) => {
    const updatedStep = stepNum != null ? stepNum : journeyStep;
    const updatedFormData = newFormData || journeyFormData;

    setJourneyStep(updatedStep);
    if (newFormData) setJourneyFormData(newFormData);

    if (!user) return; // Unauthenticated users still see local state

    try {
      const payload = {
        user_id: user.id,
        current_step: updatedStep,
        form_data: updatedFormData,
        selected_scheme_id: schemeId || selectedScheme?.id || null,
        selected_partner_id: partnerId || selectedPartner?.id || null,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('user_journey').upsert(payload, { onConflict: 'user_id' });
    } catch (err) {
      console.warn('Journey auto-save notice:', err);
    }
  };

  // ── 5. Saved Schemes Toggle ──────────────────────────────────────────────
  const toggleSaveScheme = async (schemeId) => {
    const isCurrentlySaved = savedSchemeIds.includes(schemeId);
    const nextSaved = isCurrentlySaved
      ? savedSchemeIds.filter((id) => id !== schemeId)
      : [...savedSchemeIds, schemeId];

    setSavedSchemeIds(nextSaved);

    if (!user) return;

    try {
      if (isCurrentlySaved) {
        await supabase
          .from('saved_schemes')
          .delete()
          .match({ user_id: user.id, scheme_id: schemeId });
      } else {
        await supabase
          .from('saved_schemes')
          .insert({ user_id: user.id, scheme_id: schemeId });
      }
    } catch (err) {
      console.error('Failed to update saved scheme in database:', err);
    }
  };

  // ── 6. Applications Management ───────────────────────────────────────────
  const submitApplication = async (appPayload) => {
    if (!user) throw new Error('Please login to submit an official scheme application.');

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const appNum = `ARTH-2026-${randomDigits}`;

    const newApp = {
      user_id: user.id,
      application_number: appNum,
      scheme_name: appPayload.scheme_name || selectedScheme?.name || 'NSFDC Term Loan Scheme',
      partner_name: appPayload.partner_name || selectedPartner?.name || 'State Bank of India',
      applicant_name: profile?.full_name || appPayload.applicant_name || 'Beneficiary',
      applicant_phone: profile?.phone || appPayload.applicant_phone || null,
      applicant_email: user.email,
      loan_amount: appPayload.loan_amount || emiConfig.amount || 300000,
      purpose: appPayload.purpose || journeyFormData.purpose || 'Business',
      sc_caste_declared: true,
      status: 'Submitted',
      documents: appPayload.documents || [],
      timeline: [
        {
          id: crypto.randomUUID(),
          from_status: null,
          to_status: 'Submitted',
          remarks: 'Application packet registered and submitted by applicant on ArthSetu.',
          updated_by: 'Applicant',
          created_at: new Date().toISOString(),
        },
      ],
    };

    const { data, error } = await supabase
      .from('applications')
      .insert(newApp)
      .select()
      .single();

    if (error) throw error;
    setUserApplications((prev) => [data, ...prev]);
    return data;
  };

  // ── 7. Documents Management & Supabase Storage ───────────────────────────
  const uploadUserDocument = async (file, category, documentName) => {
    if (!user) throw new Error('Please login to upload documents.');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Upload to Supabase storage bucket 'documents'
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn('Storage upload error, recording document metadata:', uploadError.message);
    }

    // Insert document record in user_documents
    const docRecord = {
      user_id: user.id,
      category: category,
      document_name: documentName,
      file_path: filePath,
      file_url: null, // Private access via signed URL
      status: 'Uploaded',
    };

    const { data, error } = await supabase
      .from('user_documents')
      .insert(docRecord)
      .select()
      .single();

    if (error) throw error;
    setUserDocuments((prev) => [data, ...prev.filter((d) => d.category !== category)]);
    return data;
  };

  const deleteUserDocument = async (docId, filePath) => {
    if (!user) return;
    try {
      if (filePath) {
        await supabase.storage.from('documents').remove([filePath]);
      }
      await supabase.from('user_documents').delete().match({ id: docId, user_id: user.id });
      setUserDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  // ── 8. Authentication Actions ────────────────────────────────────────────
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Signout notice:', err);
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setUserApplications([]);
    setSavedSchemeIds([]);
    setUserDocuments([]);
    setJourneyStep(1);
    setCurrentView('home');
  };

  // ── 9. Navigation Helpers ────────────────────────────────────────────────
  const nextJourneyStep = () => {
    const nextStep = Math.min(6, journeyStep + 1);
    saveJourneyProgress(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevJourneyStep = () => {
    const prevStep = Math.max(1, journeyStep - 1);
    saveJourneyProgress(prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startJourney = (initialStep = 1) => {
    saveJourneyProgress(initialStep);
    setCurrentView('journey');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startWizard = (initialStep = 1, prefill = {}) => {
    if (Object.keys(prefill).length > 0) {
      setFormData((prev) => ({ ...prev, ...prefill }));
    }
    saveJourneyProgress(initialStep);
    setCurrentView('journey');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setView = (view) => navigateTo(view);

  const openSchemeDetail = (scheme) => {
    setSelectedSchemeForDetail(scheme);
    setCurrentView('scheme_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEmiCalculatorWithScheme = (scheme, navigateToStandalone = true) => {
    const s = scheme || {};
    const amount =
      s.recommended_loan_amount ||
      s.max_loan_amount ||
      s.max_amount ||
      (formData.loan_amount ? parseFloat(formData.loan_amount) : 500000);

    const rate =
      s.rate_beneficiary_min != null
        ? s.rate_beneficiary_min
        : (s.rate_min != null ? s.rate_min : 5.0);

    const tenure = (s.repayment_years || s.repayment_years_max || 5) * 12;
    const moratorium = s.moratorium_months || 3;

    setEmiConfig({
      amount: Number(amount) || 500000,
      rate: Number(rate) || 5.0,
      tenure: Number(tenure) || 60,
      moratoriumMonths: Number(moratorium) || 0,
    });

    setSelectedScheme(s);
    if (navigateToStandalone) {
      navigateTo('calculator');
    }
  };

  const resetAll = () => {
    setJourneyStep(1);
    setFormData({
      purpose: 'business',
      annual_family_income: '',
      loan_amount: '',
      project_cost: '',
      sc_caste_declared: true,
      education_status: 'not_applicable',
      study_location: 'india',
      gender: '',
      city: '',
      latitude: null,
      longitude: null,
    });
    setAiInputText('');
    setAiExtractionResult(null);
    setRecommendResult(null);
    setMatchedSchemes([]);
    setEmiResult(null);
    setPartners([]);
    setCurrentView('home');
  };

  return (
    <AppContext.Provider
      value={{
        // Auth State
        session,
        user,
        profile,
        isLoadingAuth,
        completeProfileOpen,
        setCompleteProfileOpen,
        saveProfile,
        logout,

        // User persistent data
        userApplications,
        setUserApplications,
        savedSchemeIds,
        setSavedSchemeIds,
        toggleSaveScheme,
        userDocuments,
        setUserDocuments,
        uploadUserDocument,
        deleteUserDocument,
        submitApplication,

        // Journey & Navigation
        currentView,
        setCurrentView,
        navigateTo,
        setView,
        journeyStep,
        setJourneyStep,
        nextJourneyStep,
        prevJourneyStep,
        startJourney,
        startWizard,
        saveJourneyProgress,
        journeyFormData,
        setJourneyFormData,

        // Modals & Drawers
        sidebarOpen,
        setSidebarOpen,
        aiAssistantOpen,
        setAiAssistantOpen,
        loginModalOpen,
        setLoginModalOpen,
        trackModalOpen,
        setTrackModalOpen,
        schemeDetailModalOpen,
        setSchemeDetailModalOpen,
        selectedSchemeForDetail,
        setSelectedSchemeForDetail,
        openSchemeDetail,
        openEmiCalculatorWithScheme,

        // Step 1 Form & Rule Engine
        formData,
        setFormData,
        aiInputText,
        setAiInputText,
        aiExtractionResult,
        setAiExtractionResult,
        recommendResult,
        setRecommendResult,
        matchedSchemes,
        setMatchedSchemes,
        selectedScheme,
        setSelectedScheme,
        emiConfig,
        setEmiConfig,
        emiResult,
        setEmiResult,
        partners,
        setPartners,
        selectedPartner,
        setSelectedPartner,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
