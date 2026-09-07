import axios from 'axios';
import i18n from './i18n';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const currentLang = i18n?.language || (typeof window !== 'undefined' && (localStorage.getItem('udyamnex_language') || localStorage.getItem('arthsetu_language'))) || 'en';
    config.headers['Accept-Language'] = currentLang;
  } catch {
    // Ignore storage errors
  }
  return config;
});

// ── Step 2 Verified Scheme & Deterministic Eligibility Rule Engine APIs ────
export const getSchemes = () => api.get('/schemes');
export const getSchemeById = (id) => api.get(`/schemes/${id}`);
export const checkEligibility = (body) => api.post('/eligibility/check', body);
export const matchSchemes = (body) => api.post('/schemes/match', body);
export const getBestMatch = (body) => api.post('/eligibility/best-match', body);

// ── Step 3 AI Intelligence Layer (NLU + RAG + Rule Engine + Explanation) ───
export const understandRequirement = (body) => {
  const currentLang = i18n?.language === 'hi' ? 'hindi' : 'english';
  return api.post('/ai/understand-requirement', {
    language: body.language || currentLang,
    ...body,
  });
};

export const askSchemeQuestion = (body) => {
  const currentLang = i18n?.language === 'hi' ? 'hindi' : 'english';
  return api.post('/ai/ask', {
    language: body.language || currentLang,
    ...body,
  });
};
export const refreshSchemeEmbeddings = () => api.post('/ai/embed-schemes');

// ── Step 4 Beneficiary Workflow APIs ──────────────────────────────────────
export const recommend = async (body) => {
  const payload = {
    purpose: body.purpose || body.project_type || 'business',
    annual_family_income:
      body.annual_family_income != null
        ? parseFloat(body.annual_family_income)
        : parseFloat(body.annual_income || 0),
    loan_amount:
      body.loan_amount != null
        ? parseFloat(body.loan_amount)
        : body.project_cost != null
        ? parseFloat(body.project_cost) * 0.9
        : 100000,
    project_cost:
      body.project_cost != null
        ? parseFloat(body.project_cost)
        : body.loan_amount != null
        ? parseFloat(body.loan_amount) / 0.9
        : 111111,
    sc_caste_declared: body.sc_caste_declared !== false,
    education_status: body.education_status || 'not_applicable',
    study_location: body.study_location || 'india',
    gender: body.gender || undefined,
  };

  try {
    const res = await api.post('/schemes/match', payload);
    return res;
  } catch {
    return api.post('/eligibility/check', payload);
  }
};

// ── Step 5 Partner Locator, Maps & Routing APIs ───────────────────────────
export const getNearbyPartners = (params) => api.get('/partners/nearby', { params });
export const getPartnerDetails = (id) => api.get(`/partners/${id}`);
export const calculateRoute = (body) => api.post('/partners/route', body);
export const geocodeLocation = (query) => api.get('/partners/geocode', { params: { query } });

// ── Step 5 Application Journey & Documents APIs ───────────────────────────
export const getSchemeDocuments = (schemeId, schemeName) =>
  api.get(`/schemes/${schemeId}/documents`, { params: { scheme_name: schemeName } });
export const createApplication = (body) => api.post('/applications', body);
export const trackApplication = (idOrNumber) => api.get(`/applications/${idOrNumber}`);
export const updateApplicationStatus = (idOrNumber, body) =>
  api.post(`/applications/${idOrNumber}/status`, body);

// ── Step 6 Administration & Governance APIs ──────────────────────────────
export const getAdminAnalytics = () => api.get('/admin/analytics');
export const getAdminSchemes = () => api.get('/admin/schemes');
export const toggleAdminSchemeStatus = (schemeId, isActive) =>
  api.patch(`/admin/schemes/${schemeId}/status`, { is_active: isActive });
export const getAdminPartners = () => api.get('/admin/partners');
export const createAdminPartner = (body) => api.post('/admin/partners', body);
export const updateAdminPartnerStatus = (partnerId, status) =>
  api.patch(`/admin/partners/${partnerId}/status`, { status });
export const getAdminMappings = () => api.get('/admin/mappings');
export const updateAdminMapping = (body) => api.post('/admin/mappings', body);
export const getAdminApplications = (params) => api.get('/admin/applications', { params });
export const updateAdminAppStatus = (idOrNumber, body) =>
  api.post(`/admin/applications/${idOrNumber}/status`, body);

// Legacy helpers
export const calculateEMI = (body) => api.post('/emi-calculate', body).catch(() => null);
export const getPartners = (params) => getNearbyPartners(params);
export const getGuidance = (schemeId) => getSchemeDocuments(schemeId);
export const updateApplication = (applicationId, body) => updateApplicationStatus(applicationId, body);

export default api;
