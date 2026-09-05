import React, { createContext, useContext, useState } from 'react';
import { translations } from '../theme/i18n';

// Verified Demo / Seed Data for mobile screens
export const DEMO_SCHEMES = [
  {
    id: 'term-loan-nsfdc',
    name: 'Term Loan Scheme',
    name_hi: 'सावधि ऋण योजना',
    issuing_body: 'National Scheduled Castes Finance & Development Corporation (NSFDC)',
    scheme_type: 'term_loan',
    short_description: 'Financial assistance for income generating small businesses and micro-enterprises up to ₹50.00 Lakhs.',
    short_description_hi: 'आय सृजन गतिविधियों और सूक्ष्म उद्यमों की स्थापना हेतु ₹50.00 लाख तक की वित्तीय सहायता।',
    rate_beneficiary_min: 7.0,
    rate_beneficiary_max: 8.0,
    rate_note: '7.0% p.a. for loans up to ₹5.00 Lakh; 8.0% p.a. for loans above ₹5.00 Lakh. 0.5% rebate for women.',
    max_loan_amount: 5000000,
    financing_pct: 90,
    repayment_years_max: 10,
    repayment_note: 'Quarterly instalments over maximum 10 years including moratorium.',
    moratorium_months: 6,
    moratorium_note: 'Up to 6 months moratorium period on principal repayment.',
    max_income_eligibility: 300000,
    eligible_castes: ['SC'],
    eligible_purposes: ['business', 'dairy', 'transport', 'services', 'agriculture'],
    source_url: 'https://nsfdc.nic.in/en/term-loan',
    last_verified_at: '2026-09-05',
    data_confidence_label: 'Verified Master Data',
    why_matches: [
      'Annual family income within ₹3,00,000 ceiling',
      'Scheduled Caste (SC) category verified',
      'Project cost meets scale criteria (up to ₹50 Lakhs)',
      'Subsidized 8.0% interest rate vs 13.0% commercial',
    ],
  },
  {
    id: 'education-loan-nsfdc',
    name: 'Educational Loan Scheme (ELS)',
    name_hi: 'शैक्षणिक ऋण योजना',
    issuing_body: 'National Scheduled Castes Finance & Development Corporation (NSFDC)',
    scheme_type: 'education_loan',
    short_description: 'Concessional education loans for professional & technical higher education in India and abroad.',
    short_description_hi: 'भारत और विदेश में व्यावसायिक व तकनीकी उच्च शिक्षा हेतु रियायती शैक्षणिक ऋण।',
    rate_beneficiary_min: 4.0,
    rate_beneficiary_max: 4.0,
    rate_note: '4.0% p.a. with 0.5% special rebate for women beneficiaries (effective 3.5% p.a.).',
    max_loan_amount: 3000000,
    financing_pct: 90,
    repayment_years_max: 10,
    repayment_note: 'Repayment starts 6 months after course completion or getting employment.',
    moratorium_months: 6,
    moratorium_note: 'Course duration + 6 months post-study moratorium.',
    max_income_eligibility: 300000,
    eligible_castes: ['SC'],
    eligible_purposes: ['education', 'higher_studies'],
    source_url: 'https://nsfdc.nic.in/en/educational-loan-scheme-els',
    last_verified_at: '2026-09-05',
    data_confidence_label: 'Verified Master Data',
    why_matches: [
      'Higher education funding for accredited university/college',
      'Annual family income within ₹3,00,000 limit',
      'Ultra-concessional 4.0% interest rate',
      'Course duration + 6 months repayment moratorium',
    ],
  },
  {
    id: 'micro-credit-nsfdc',
    name: 'Micro Credit Finance (MCF)',
    name_hi: 'सूक्ष्म ऋण वित्त योजना',
    issuing_body: 'National Scheduled Castes Finance & Development Corporation (NSFDC)',
    scheme_type: 'micro_finance',
    short_description: 'Direct micro-credit for petty trade, artisanal crafts, tailoring, and micro-vendors.',
    short_description_hi: 'छोटे व्यापार, हस्तशिल्प, सिलाई और फेरीवालों के लिए सीधा सूक्ष्म ऋण।',
    rate_beneficiary_min: 5.0,
    rate_beneficiary_max: 5.0,
    rate_note: '5.0% p.a. fixed concessional rate.',
    max_loan_amount: 140000,
    financing_pct: 100,
    repayment_years_max: 3,
    repayment_note: '36 monthly instalments.',
    moratorium_months: 3,
    moratorium_note: '3 months moratorium on principal.',
    max_income_eligibility: 300000,
    eligible_castes: ['SC'],
    eligible_purposes: ['business', 'petty_trade', 'micro_shop'],
    source_url: 'https://nsfdc.nic.in/en/micro-credit-finance',
    last_verified_at: '2026-09-05',
    data_confidence_label: 'Verified Master Data',
    why_matches: [
      'Targeted for micro requirements up to ₹1,40,000',
      '100% project cost financing (zero margin money)',
      'Simplified documentation for self-help & individual artisans',
    ],
  },
];

export const DEMO_PARTNERS = [
  {
    id: 'sca-mp-bhopal',
    name: 'M.P. Rajya Sahakari Anusuchit Jati Vitta Nigam',
    type: 'SCA',
    type_label: 'State Channelizing Agency (SCA)',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'Rajiv Gandhi Bhawan, 35 Shyamla Hills, Bhopal, MP 462002',
    latitude: 23.2458,
    longitude: 77.3912,
    distance_km: 3.2,
    phone: '+91-755-2661842',
    email: 'contact@mpscfinance.mp.gov.in',
    contact_person: 'Shri R.K. Verma (Nodal Officer)',
    status: 'Operational',
    supported_schemes: ['Term Loan Scheme', 'Educational Loan Scheme', 'Micro Credit Finance'],
    source: 'NSFDC Official SCA Directory',
    last_verified_at: '2026-09-05',
    data_confidence_label: 'DEMO — Pending live verification',
  },
  {
    id: 'psb-pnb-bhopal',
    name: 'Punjab National Bank (Zonal Lead Bank)',
    type: 'PSB',
    type_label: 'Public Sector Bank (PSB)',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'PNB Zonal Office, Zone-1, Maharana Pratap Nagar, Bhopal 462011',
    latitude: 23.2312,
    longitude: 77.4321,
    distance_km: 5.8,
    phone: '+91-755-2554120',
    email: 'leadbank.bhopal@pnb.co.in',
    contact_person: 'Lead District Manager (LDM)',
    status: 'Operational',
    supported_schemes: ['Term Loan Scheme', 'Educational Loan Scheme'],
    source: 'SLBC Madhya Pradesh Directory',
    last_verified_at: '2026-09-05',
    data_confidence_label: 'DEMO — Pending live verification',
  },
  {
    id: 'rrb-mp-gramin',
    name: 'Madhya Pradesh Gramin Bank (Rural Branch)',
    type: 'RRB',
    type_label: 'Regional Rural Bank (RRB)',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    address: 'Berasia Road Branch, Karond, Bhopal 462038',
    latitude: 23.2680,
    longitude: 77.4080,
    distance_km: 8.4,
    phone: '+91-755-2740920',
    email: 'berasia.branch@mpgb.co.in',
    contact_person: 'Branch Manager',
    status: 'Operational',
    supported_schemes: ['Term Loan Scheme', 'Micro Credit Finance'],
    source: 'NABARD Empanelled Directory',
    last_verified_at: '2026-09-05',
    data_confidence_label: 'DEMO — Pending live verification',
  },
];

export const DEMO_APPLICATIONS = [
  {
    id: 'app-demo-001',
    application_number: 'ARTH-2024-89241',
    scheme_name: 'Term Loan Scheme',
    applicant_name: 'Ramesh Kumar',
    applicant_phone: '+919876543210',
    loan_amount: 300000,
    project_cost: 333333,
    purpose: 'business',
    partner_name: 'M.P. Rajya SC Finance Corp (Bhopal)',
    status: 'Under Review',
    created_at: '2026-09-02T10:15:00Z',
    updated_at: '2026-09-04T14:30:00Z',
    stages: [
      { name: 'Application Created', date: '2026-09-02', done: true, remarks: 'Requirement packet generated' },
      { name: 'Submitted', date: '2026-09-02', done: true, remarks: 'Submitted to ArthSetu digital portal' },
      { name: 'Under Review', date: '2026-09-04', done: true, current: true, remarks: 'Eligibility criteria verified with Tehsildar income ceiling' },
      { name: 'Documents Required', date: null, done: false, remarks: 'Pending partner document verification' },
      { name: 'Forwarded to Partner', date: null, done: false, remarks: 'To be forwarded to Bhopal SCA' },
      { name: 'Processing', date: null, done: false, remarks: 'Credit appraisal' },
      { name: 'Decision', date: null, done: false, remarks: 'Final sanction' },
    ],
  },
];

const AppContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, params) => key,
  currentScreen: 'splash',
  navigate: (screen, params) => {},
  goBack: () => {},
  screenParams: {},
  selectedScheme: null,
  setSelectedScheme: () => {},
  activeApplication: null,
  setActiveApplication: () => {},
  savedSchemeIds: [],
  toggleSaveScheme: (schemeId) => {},
  isSaved: (schemeId) => false,
  formState: {},
  setFormState: () => {},
});

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [navigationHistory, setNavigationHistory] = useState(['splash']);
  const [screenParams, setScreenParams] = useState({});
  const [selectedScheme, setSelectedScheme] = useState(DEMO_SCHEMES[0]);
  const [activeApplication, setActiveApplication] = useState(DEMO_APPLICATIONS[0]);
  const [savedSchemeIds, setSavedSchemeIds] = useState(['term-loan-nsfdc']);
  const [formState, setFormState] = useState({
    purpose: 'business',
    loan_amount: '300000',
    project_cost: '333333',
    annual_family_income: '300000',
    sc_caste_declared: true,
    gender: 'male',
    education_status: 'graduate',
    study_location: 'india',
    city: 'Bhopal',
  });

  const t = (key, params = {}) => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    if (typeof text === 'string' && params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
    }
    return text;
  };

  const navigate = (screen, params = {}) => {
    setScreenParams(params);
    setNavigationHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current screen
      const prevScreen = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('home');
    }
  };

  const toggleSaveScheme = (schemeId) => {
    setSavedSchemeIds((prev) =>
      prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId]
    );
  };

  const isSaved = (schemeId) => savedSchemeIds.includes(schemeId);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentScreen,
        navigate,
        goBack,
        screenParams,
        selectedScheme,
        setSelectedScheme,
        activeApplication,
        setActiveApplication,
        savedSchemeIds,
        toggleSaveScheme,
        isSaved,
        formState,
        setFormState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
