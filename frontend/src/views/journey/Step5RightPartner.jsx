import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Phone,
  ShieldCheck,
  Navigation,
  ExternalLink,
  Info,
  Map,
  Compass,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Check,
  Clock,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { getNearbyPartners } from '../../api';
import MapLibrePartnerMap from '../../components/MapLibrePartnerMap';
import { getLocalizedScheme } from '../../data/mockData';

// Default Fallback Partners for instant offline rendering
const FALLBACK_ELIGIBLE_PARTNERS = [
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    name: 'State Bank of India — TT Nagar Lead Nodal Branch',
    partner_type: 'PSB',
    type: 'Bank',
    branch: 'TT Nagar Lead Nodal Desk, Bhopal',
    address: 'Plot 12, Main Road, TT Nagar, Bhopal, MP - 462003',
    pincode: '462003',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    latitude: 23.2356,
    longitude: 77.4012,
    lat: 23.2356,
    lng: 77.4012,
    status: 'Operational',
    distance_km: 0.14,
    distance_text: '0.14 km away',
    driving_duration_mins: 3.0,
    fund_utilization_percent: 92.5,
    fund_utilization_status: 'Satisfactory (92.5%)',
    overdue_status: 'Current / No Overdues',
    npa_status: 'Standard Asset',
    eligibility_status: 'Eligible',
    eligibility_reason: 'Lead Public Sector Bank branch empanelled for all 3 NSFDC credit schemes with 92.5% fund utilization and zero overdue defaults.',
    last_verified_at: '15/08/2026',
    supported_schemes: ['NSFDC Term Loan Scheme', 'Micro Credit Finance', 'Educational Loan Scheme (ELS)'],
    contact_person: 'Mr. Arvind Sharma (Lead District Manager Desk)',
    phone: '+91 755 2554101',
    email: 'sbi.ttnagar.nodal@sbi.co.in',
    operating_hours: '10:00 AM – 4:00 PM (Mon-Sat)',
    compatibility_factors: [
      'Authorized Channel Partner empanelled with NSFDC',
      'Branch is operational and actively accepting beneficiary applications',
      'Supports requested NSFDC loan scheme',
      'Satisfactory fund utilization: 92.5% (Threshold >= 40%)',
      'Clean track record: Zero prohibited overdue defaults',
      'Standard Asset classification verified under banking inspection',
      'Closest verified eligible branch to your location',
    ],
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    name: 'M.P. Rajya Sahakari Anusuchit Jati Vitta Nigam (SCA Head Office)',
    partner_type: 'SCA',
    type: 'State Channelizing Agency',
    branch: 'State Nodal Head Office, Shyamla Hills',
    address: 'Rajiv Gandhi Bhawan, 35 Shyamla Hills, Bhopal, MP - 462002',
    pincode: '462002',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    latitude: 23.2458,
    longitude: 77.3912,
    lat: 23.2458,
    lng: 77.3912,
    status: 'Operational',
    distance_km: 1.5,
    distance_text: '1.5 km away',
    driving_duration_mins: 7.0,
    fund_utilization_percent: 88.0,
    fund_utilization_status: 'Satisfactory (88.0%)',
    overdue_status: 'Current / No Overdues',
    npa_status: 'Standard Asset',
    eligibility_status: 'Eligible',
    eligibility_reason: 'Designated State Channelizing Agency for Madhya Pradesh under Ministry of Social Justice. Direct nodal coordinator.',
    last_verified_at: '15/08/2026',
    supported_schemes: ['NSFDC Term Loan Scheme', 'Mahila Samriddhi Yojana (MSY)', 'Educational Loan Scheme (ELS)'],
    contact_person: 'Shri R.K. Mehra (Managing Director / District Liaison)',
    phone: '+91 755 2661556',
    email: 'mpscfdc.bhopal@mp.gov.in',
    operating_hours: '10:00 AM – 5:00 PM (Mon-Fri)',
    compatibility_factors: [
      'Designated State Channelizing Agency (SCA) for Madhya Pradesh',
      'Branch is operational and actively accepting beneficiary applications',
      'Supports requested NSFDC loan scheme',
      'Satisfactory fund utilization: 88.0%',
      'Clean track record: Zero prohibited overdue defaults',
    ],
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    name: 'Central Bank of India — Habib Ganj Commercial Branch',
    partner_type: 'PSB',
    type: 'Bank',
    branch: 'Habib Ganj Commercial Branch',
    address: 'Near Habib Ganj Station, Commercial Complex, Bhopal, MP - 462016',
    pincode: '462016',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    latitude: 23.2189,
    longitude: 77.4332,
    lat: 23.2189,
    lng: 77.4332,
    status: 'Operational',
    distance_km: 3.8,
    distance_text: '3.8 km away',
    driving_duration_mins: 11.0,
    fund_utilization_percent: 81.0,
    fund_utilization_status: 'Satisfactory (81.0%)',
    overdue_status: 'Current / No Overdues',
    npa_status: 'Standard Asset',
    eligibility_status: 'Eligible',
    eligibility_reason: 'Active empanelled public sector bank supporting Term Loan and ELS education credit.',
    last_verified_at: '15/08/2026',
    supported_schemes: ['NSFDC Term Loan Scheme', 'Micro Credit Finance', 'Educational Loan Scheme (ELS)'],
    contact_person: 'Ms. Sunita Verma (Credit Officer)',
    phone: '+91 755 2465890',
    email: 'cbi.habibganj@centralbank.co.in',
    operating_hours: '10:00 AM – 4:30 PM (Mon-Sat)',
    compatibility_factors: [
      'Authorized Channel Partner empanelled with NSFDC',
      'Operational and accepting applications',
      'Supports requested NSFDC loan scheme',
    ],
  },
];

const FALLBACK_EXCLUDED_PARTNERS = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Malwa Regional Gramin Desk — TT Nagar',
    partner_type: 'RRB',
    distance_km: 0.45,
    distance_text: '0.45 km away',
    exclusion_reason: 'Partner authorization currently suspended due to overdue defaults (>90 days) exceeding operational limit. Excluded to prevent applicant loan delays.',
    last_verified_at: '10/08/2026',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000005',
    name: 'Annapurna Microfinance Pvt Ltd — MP Nagar Branch',
    partner_type: 'NBFC-MFI',
    distance_km: 3.3,
    distance_text: '3.3 km away',
    exclusion_reason: 'Scheme mismatch: This institution is authorized exclusively for Micro Credit Finance (Mahila Samriddhi). It does not handle Term Loan or Educational Loan Scheme.',
    last_verified_at: '10/08/2026',
  },
];

export default function Step5RightPartner({ onContinue }) {
  const { t, i18n } = useTranslation();
  const {
    selectedPartner,
    setSelectedPartner,
    nextJourneyStep,
    prevJourneyStep,
    selectedScheme,
    formData,
    saveJourneyProgress,
  } = useApp();

  const locScheme = getLocalizedScheme(selectedScheme, i18n.language);

  // Location state
  const [userLocation, setUserLocation] = useState({
    lat: formData?.latitude || 23.2350,
    lng: formData?.longitude || 77.4000,
    city: formData?.city || 'Bhopal',
  });

  // Dynamic API partner states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedPartner, setRecommendedPartner] = useState(FALLBACK_ELIGIBLE_PARTNERS[0]);
  const [eligiblePartners, setEligiblePartners] = useState(FALLBACK_ELIGIBLE_PARTNERS);
  const [excludedPartners, setExcludedPartners] = useState(FALLBACK_EXCLUDED_PARTNERS);
  const [activePartner, setActivePartner] = useState(FALLBACK_ELIGIBLE_PARTNERS[0]);
  const [routeRequestPartner, setRouteRequestPartner] = useState(null);

  // UI accordion & modal states
  const [showExcluded, setShowExcluded] = useState(true);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetailPartner, setSelectedDetailPartner] = useState(null);
  const [cityInput, setCityInput] = useState(userLocation.city);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // Keep a ref of selectedPartner to prevent unnecessary fetch triggers
  const selectedPartnerRef = useRef(selectedPartner);
  useEffect(() => {
    selectedPartnerRef.current = selectedPartner;
  }, [selectedPartner]);

  // Fetch partners from backend Geo-Spatial Partner Locator
  const fetchPartners = useCallback(
    async (lat, lng, cityQuery, forceResetSelection = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getNearbyPartners({
          latitude: lat,
          longitude: lng,
          city: cityQuery,
          scheme_id: selectedScheme?.id || 'nsfdc_term_loan',
          scheme_name: selectedScheme?.name,
        });

        if (res.data) {
          const data = res.data;

          // Process eligible partners
          const rawEligible = data.eligible_partners || data.ranked_partners || [];
          const formattedEligible = rawEligible.map((item) => {
            const p = item.partner || item;
            return {
              ...p,
              id: p.id,
              name: p.name,
              partner_type: p.partner_type || 'Channel Partner',
              type: p.partner_type || 'Channel Partner',
              branch: p.address || p.city,
              address: p.address,
              pincode: p.pincode,
              city: p.city,
              state: p.state,
              latitude: p.latitude,
              longitude: p.longitude,
              lat: p.latitude,
              lng: p.longitude,
              distance_km: item.distance_km != null ? item.distance_km : p.distance_km,
              distance_text: `${item.distance_km != null ? item.distance_km : (p.distance_km || 1.0)} km away`,
              driving_duration_mins: item.driving_duration_mins || 5.0,
              status: p.status || 'Operational',
              fund_utilization_percent: p.fund_utilization_percent,
              fund_utilization_status: p.fund_utilization_status,
              overdue_status: p.overdue_status,
              npa_status: p.npa_status,
              eligibility_status: p.eligibility_status || 'Eligible',
              eligibility_reason: p.eligibility_reason,
              last_verified_at: p.last_verified_at || '15/08/2026',
              supported_schemes: p.supported_schemes || [selectedScheme?.name || 'NSFDC Scheme'],
              contact_person: p.contact_person || 'Lead Nodal Officer',
              phone: p.phone || '+91 755 2554101',
              email: p.email || 'partner.desk@arthsetu.gov.in',
              operating_hours: p.operating_hours || '10:00 AM – 4:00 PM (Mon-Sat)',
              compatibility_factors: item.compatibility_factors || [
                'Authorized Channel Partner empanelled with NSFDC',
                'Branch is operational and actively accepting applications',
                'Satisfies fund utilization & overdue safety criteria',
              ],
            };
          });

          // Process excluded partners
          const rawExcluded = data.excluded_partners || [];
          const formattedExcluded = rawExcluded.map((ex) => ({
            id: ex.id,
            name: ex.name,
            partner_type: ex.partner_type || 'Financial Institution',
            distance_km: ex.distance_km,
            distance_text: `${ex.distance_km || 0.5} km away`,
            exclusion_reason: ex.exclusion_reason,
            last_verified_at: ex.last_verified_at || '10/08/2026',
          }));

          if (formattedEligible.length > 0) {
            setEligiblePartners(formattedEligible);
            const topPartner = formattedEligible[0];
            setRecommendedPartner(topPartner);

            const currSelected = selectedPartnerRef.current;
            const partnerStillEligible = currSelected && formattedEligible.some((p) => p.id === currSelected.id);

            if (forceResetSelection || !partnerStillEligible) {
              if (setSelectedPartner) setSelectedPartner(topPartner);
              setActivePartner(topPartner);
              setRouteRequestPartner(topPartner);
            } else {
              const matched = formattedEligible.find((p) => p.id === currSelected.id);
              setActivePartner(matched || topPartner);
            }
          } else {
            setEligiblePartners(FALLBACK_ELIGIBLE_PARTNERS);
            setRecommendedPartner(FALLBACK_ELIGIBLE_PARTNERS[0]);
            if (forceResetSelection || !selectedPartnerRef.current) {
              if (setSelectedPartner) setSelectedPartner(FALLBACK_ELIGIBLE_PARTNERS[0]);
              setActivePartner(FALLBACK_ELIGIBLE_PARTNERS[0]);
              setRouteRequestPartner(FALLBACK_ELIGIBLE_PARTNERS[0]);
            }
          }

          if (formattedExcluded.length > 0) {
            setExcludedPartners(formattedExcluded);
          } else {
            setExcludedPartners(FALLBACK_EXCLUDED_PARTNERS);
          }
        }
      } catch (err) {
        console.warn('Backend partner locator fetch error, falling back to verified dataset:', err);
        setEligiblePartners(FALLBACK_ELIGIBLE_PARTNERS);
        setRecommendedPartner(FALLBACK_ELIGIBLE_PARTNERS[0]);
        if (forceResetSelection || !selectedPartnerRef.current) {
          if (setSelectedPartner) setSelectedPartner(FALLBACK_ELIGIBLE_PARTNERS[0]);
          setActivePartner(FALLBACK_ELIGIBLE_PARTNERS[0]);
        }
        setExcludedPartners(FALLBACK_EXCLUDED_PARTNERS);
      } finally {
        setLoading(false);
      }
    },
    [selectedScheme, setSelectedPartner]
  );

  // Initial fetch on mount or when scheme changes
  useEffect(() => {
    fetchPartners(userLocation.lat, userLocation.lng, userLocation.city);
  }, [fetchPartners, userLocation.lat, userLocation.lng, userLocation.city]);

  // Handle location update from map or search input
  const handleLocationChange = useCallback(
    ({ lat, lng, city }) => {
      const cityName = city || 'Custom Location';
      setUserLocation((prev) => ({
        ...prev,
        lat: lat ?? prev.lat,
        lng: lng ?? prev.lng,
        city: cityName,
      }));
      setCityInput(cityName);
      fetchPartners(lat, lng, cityName, true);
    },
    [fetchPartners]
  );

  // Handle manual city input submit
  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const cleanCity = cityInput.trim();
    setUserLocation((prev) => ({ ...prev, city: cleanCity }));
    setIsEditingLocation(false);
    fetchPartners(null, null, cleanCity, true);
  };

  const isSelected = (partner) => {
    if (!partner) return false;
    const currentId = selectedPartner?.id || activePartner?.id;
    return currentId === partner.id;
  };

  const handleSelect = (partner) => {
    if (!partner) return;
    setActivePartner(partner);
    if (setSelectedPartner) {
      setSelectedPartner(partner);
    }
  };

  const handleTriggerDirections = (partner) => {
    if (!partner) return;
    setActivePartner(partner);
    setRouteRequestPartner({ ...partner, _ts: Date.now() });
    const mapEl = document.getElementById('partner-map-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleProceed = () => {
    const partnerToSave = selectedPartner || activePartner || recommendedPartner || eligiblePartners[0];
    if (setSelectedPartner) {
      setSelectedPartner(partnerToSave);
    }
    if (saveJourneyProgress) {
      saveJourneyProgress(6, null, selectedScheme?.id, partnerToSave?.id);
    }
    if (onContinue) {
      onContinue();
    } else if (nextJourneyStep) {
      nextJourneyStep();
    }
  };

  const openDetails = (partner) => {
    setSelectedDetailPartner(partner);
    setDetailsModalOpen(true);
  };

  const channelType = selectedScheme?.application_channel_type || 'channel_partner';
  const channelDetails = selectedScheme?.application_channel_details || null;
  const isPartnerChannel = channelType === 'channel_partner';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1F6] text-[#0B3B60] text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#0B3B60]" />
            <span>{t('journey_step5.stage_badge', 'Stage 5 · Channel Partner & Application Channel Locator')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B3B60] tracking-tight">
            {t('journey_step5.title', 'Find the Right Channel Partner Near You')}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {isPartnerChannel ? (
              <>
                {t('journey_step5.nearest_channel_intro', 'Nearest verified channelizing agency (SCA / Empanelled Bank / NBFC-MFI) with active operational status for')}{' '}
                <strong className="text-[#0B3B60]">{locScheme?.scheme_name || locScheme?.name || 'Selected Government Scheme'}</strong>.
              </>
            ) : (
              <>
                {t('journey_step5.direct_channel_intro', 'Official direct application channel designated for')}{' '}
                <strong className="text-[#0B3B60]">{locScheme?.scheme_name || locScheme?.name || 'Selected Government Scheme'}</strong>.
              </>
            )}
          </p>
        </div>

        {/* User Location Badge (displayed for partner-based channels) */}
        {isPartnerChannel && (
          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] shadow-2xs rounded-2xl px-3.5 py-2">
            <MapPin className="w-4 h-4 text-[#EF4444] shrink-0" />
            {isEditingLocation ? (
              <form onSubmit={handleLocationSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder={t('journey_step5.location_placeholder', 'Enter city or district...')}
                  className="text-xs px-2 py-1 border border-slate-300 rounded-lg outline-none focus:border-[#0B3B60]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-[#0B3B60] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                >
                  {t('journey_step5.btn_set', 'Set')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(false)}
                  className="text-slate-400 text-xs px-1"
                >
                  ✕
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#64748B]">{t('journey_step5.location_label', 'Location:')}</span>
                <span className="font-bold text-[#0B3B60]">{userLocation.city}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="text-[11px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                >
                  {t('journey_step5.btn_change', 'Change')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CONDITIONAL APPLICATION CHANNEL BRANCHING ────────────────────────────── */}
      {!isPartnerChannel ? (
        /* Branch A: Direct Government Portal / Department Office / District Authority */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-[#0B3B60] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0B3B60] bg-[#EFF6FF] px-3 py-1 rounded-full border border-[#BFDBFE] uppercase">
                  {channelType.replace('_', ' ')}
                </span>
                <span className="text-xs text-[#065F46] font-bold bg-[#E8F8F2] px-3 py-1 rounded-full border border-[#BBF7D0]">
                  {t('journey_step5.direct_official_channel', 'Direct Official Channel')}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {t('journey_step5.verified_official_channel', 'Verified Official Channel')}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
                {t('journey_step5.direct_channel_heading', 'Official Direct Application Channel')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('journey_step5.direct_channel_desc', 'This government scheme does not require an intermediary bank, SCA, or NBFC-MFI branch. You can apply directly through the designated government authority below.')}
              </p>
            </div>

            {/* Channel Details Card */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              {channelDetails?.portal_url && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800 text-sm">{t('journey_step5.portal_label', 'Designated Application Portal')}</strong>
                    <a
                      href={channelDetails.portal_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2563EB] hover:underline font-medium break-all"
                    >
                      {channelDetails.portal_url}
                    </a>
                  </div>
                </div>
              )}

              {channelDetails?.office_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800 text-sm">{t('journey_step5.office_label', 'Department Office / Authority')}</strong>
                    <p className="text-slate-600">{channelDetails.office_address}</p>
                  </div>
                </div>
              )}

              {channelDetails?.contact_info && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800 text-sm">{t('journey_step5.helpdesk_label', 'Helpdesk & Inquiries')}</strong>
                    <p className="text-slate-600">{channelDetails.contact_info}</p>
                  </div>
                </div>
              )}

              {!channelDetails && (
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#0B3B60] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800 text-sm">{t('journey_step5.nodal_portal_label', 'Ministry Nodal Portal')}</strong>
                    <p className="text-slate-600">
                      {t('journey_step5.nodal_portal_desc', 'Applications are processed via the Central Ministry of Social Justice and Empowerment single-window window portal (e-Anudaan / PM SURAJ).')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {t('journey_step5.fee_notice', 'Notice: No fee is charged for official scheme applications. Beware of unauthorized intermediaries.')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Branch B: Channel Partner Locator (SCA / Empanelled Bank / NBFC-MFI) */
        <>
          {/* ── Deterministic Multi-Gate Eligibility Engine Pipeline Banner ────────────────────────────── */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-3xl p-4 sm:p-5 text-xs shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#166534] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>{t('journey_step5.gate_engine_title', 'Deterministic Multi-Gate Eligibility Engine (Filter First → Rank Second)')}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                {t('journey_step5.zero_npa_guarantee', 'Zero High-NPA / Overdue Guarantee')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#BBF7D0] text-[#166534] font-bold">
                {t('journey_step5.gate_1', '1. Scheme Compatibility')}
              </span>
              <span className="text-[#16A34A]">→</span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#BBF7D0] text-[#166534] font-bold">
                {t('journey_step5.gate_2', '2. Active Authorization')}
              </span>
              <span className="text-[#16A34A]">→</span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#BBF7D0] text-[#166534] font-bold">
                {t('journey_step5.gate_3', '3. Fund Utilization (≥40%)')}
              </span>
              <span className="text-[#16A34A]">→</span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-[#BBF7D0] text-[#166534] font-bold">
                {t('journey_step5.gate_4', '4. Overdue & NPA Clearance')}
              </span>
              <span className="text-[#16A34A]">→</span>
              <span className="bg-[#15803D] text-white px-2.5 py-1 rounded-lg font-bold shadow-2xs">
                {t('journey_step5.gate_5', '5. Closest Eligible Partner')}
              </span>
            </div>
          </div>

          {/* ── 1. REAL INTERACTIVE MAPLIBRE GL MAP ────────────────────────────── */}
          <div id="partner-map-section" className="space-y-3">
            <MapLibrePartnerMap
              partners={eligiblePartners}
              selectedPartner={activePartner}
              routeRequestPartner={routeRequestPartner}
              onSelectPartner={handleSelect}
              onViewDetails={openDetails}
              selectedSchemeName={selectedScheme?.name}
              userLocation={userLocation}
              onLocationChange={handleLocationChange}
              height="500px"
            />
          </div>

          {/* ── 2. RECOMMENDED CHANNEL PARTNER CARD ────────────────────────────── */}
          {recommendedPartner && (
            <div
              className={`bg-white rounded-3xl p-6 sm:p-7 shadow-md space-y-5 relative overflow-hidden transition-all ${
                isSelected(recommendedPartner)
                  ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border border-slate-300 hover:border-slate-400'
              }`}
            >
              {/* Top Badge Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-2xs ${
                      isSelected(recommendedPartner)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0B3B60] text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {isSelected(recommendedPartner)
                        ? 'Recommended & Selected Desk ✓'
                        : 'Recommended Partner Desk'}
                    </span>
                  </span>

                  <span className="text-xs font-bold text-[#065F46] bg-[#D1FAE5] px-3 py-1 rounded-full border border-[#A7F3D0]">
                    {recommendedPartner.partner_type || recommendedPartner.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                  <span className="bg-[#E8F8F2] px-3 py-1 rounded-full border border-[#10B981]/30 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{recommendedPartner.distance_text}</span>
                  </span>
                </div>
              </div>

              {/* Main Info */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected(recommendedPartner)
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]'
                  }`}
                >
                  <Building2 className="w-7 h-7 stroke-[2]" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#0B3B60]">
                      {recommendedPartner.name}
                    </h3>
                    {isSelected(recommendedPartner) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                        <span>Active Application Desk</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#EF4444] shrink-0" />
                    <span>{recommendedPartner.address}</span>
                  </p>

                  {/* Operational Eligibility Pillars */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      {t('journey_step5.fund_utilization', 'Fund Utilization Rate:')} <strong>{recommendedPartner.fund_utilization_percent || 92.5}%</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {t('journey_step5.overdue_status', 'Overdue Status:')} <strong>{recommendedPartner.overdue_status || 'Current'}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                      {t('journey_step5.npa_status', 'Asset Classification:')} <strong>{recommendedPartner.npa_status || 'Standard Asset'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Why this partner matches */}
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <strong className="text-[#0B3B60] block font-bold uppercase tracking-wider text-[10px]">
                  {t('journey_step5.compliance_title', 'Eligibility & Inspection Checklist:')}
                </strong>
                <ul className="space-y-1 text-slate-600">
                  {(recommendedPartner.compatibility_factors || [
                    'Authorized Channel Partner empanelled with NSFDC',
                    'Branch is operational and actively accepting beneficiary applications',
                    'Satisfies fund-utilization, overdue, and NPA eligibility standards',
                    'Closest verified eligible branch to your location',
                  ]).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <span>{t('journey_step5.contact_label', 'Contact:')} <strong>{recommendedPartner.phone || '+91 755 2554101'}</strong></span>
                  <span>·</span>
                  <span>{t('journey_step5.hours_label', 'Hours:')} <strong>{recommendedPartner.operating_hours || '10 AM – 4 PM'}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerDirections(recommendedPartner)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0B3B60] hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openDetails(recommendedPartner)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0B3B60] hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {t('journey_step5.btn_audit_details', 'Audit Details')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect(recommendedPartner)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected(recommendedPartner)
                        ? 'bg-emerald-600 text-white cursor-default shadow-xs'
                        : 'bg-white border border-[#0B3B60] text-[#0B3B60] hover:bg-[#0B3B60] hover:text-white'
                    }`}
                  >
                    {isSelected(recommendedPartner) ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Selected Desk ✓</span>
                      </>
                    ) : (
                      <span>Switch Back to Recommended Desk</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── 3. ALL OTHER ELIGIBLE PARTNERS LIST ────────────────────────────── */}
          {eligiblePartners.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#0B3B60]">
                  {t('journey_step5.other_partners_title', 'Other Verified Eligible Partners')} ({eligiblePartners.length - 1})
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Select any partner below to route your application through their desk
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {eligiblePartners.slice(1).map((partner) => {
                  const partnerIsSelected = isSelected(partner);
                  return (
                    <div
                      key={partner.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(partner)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(partner);
                        }
                      }}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
                        partnerIsSelected
                          ? 'border-2 border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-[#E2E8F0] bg-white hover:border-[#0B3B60]/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            partnerIsSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-[#EFF6FF] text-[#2563EB]'
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-[#0B3B60]">
                              {partner.name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {partner.partner_type || partner.type}
                            </span>
                            {partnerIsSelected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                                <span>Currently Selected Desk</span>
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {t('journey_step5.fund_utilization', 'Fund Utilization:')} {partner.fund_utilization_percent || 88}%
                            </span>
                          </div>

                          <p className="text-xs text-[#64748B] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{partner.address}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#065F46] font-medium pt-0.5">
                            <span>
                              {t('journey_step5.status_label', 'Status:')} <strong>{partner.status || 'Operational'}</strong>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-[#2563EB]">
                              <Navigation className="w-3 h-3" />
                              <span>{partner.distance_text} (~{partner.driving_duration_mins || 5} mins drive)</span>
                            </span>
                            {partner.last_verified_at && (
                              <>
                                <span>·</span>
                                <span className="text-slate-500">
                                  Verified: {partner.last_verified_at}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerDirections(partner);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B3B60] hover:bg-slate-100 bg-slate-50 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Route</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetails(partner);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#0B3B60] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          {t('journey_step5.btn_details', 'Details')}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(partner);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            partnerIsSelected
                              ? 'bg-emerald-600 text-white shadow-xs cursor-default'
                              : 'bg-[#0B3B60] hover:bg-[#07263F] text-white shadow-xs'
                          }`}
                        >
                          {partnerIsSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selected Desk ✓</span>
                            </>
                          ) : (
                            <span>Select This Partner Desk</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 4. EXCLUDED PARTNERS AUDIT LIST ────────────────────────────── */}
          {excludedPartners.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowExcluded(!showExcluded)}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    {t('journey_step5.excluded_partners_title', 'Ineligible & Excluded Nearby Partners')} ({excludedPartners.length})
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <span>{showExcluded ? t('journey_step5.hide_audit_log', 'Hide Audit Log') : t('journey_step5.show_audit_log', 'Show Audit Log')}</span>
                  {showExcluded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showExcluded && (
                <div className="space-y-2.5 pt-2">
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {t('journey_step5.excluded_reason_desc', 'The following institutions are physically near your location but were filtered out before distance ranking because they violate mandatory operational criteria (e.g. pending overdues >90 days, low fund utilization, or scheme incompatibility):')}
                  </p>

                  {excludedPartners.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-white p-3.5 rounded-2xl border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1E293B]">{ex.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                            {t('journey_step5.excluded_badge', 'Excluded from Routing')}
                          </span>
                          <span className="text-[11px] text-[#64748B] font-medium">{ex.distance_text}</span>
                        </div>
                        <p className="text-[#B45309] text-[11px] leading-relaxed">
                          <strong>{t('journey_step5.excluded_reason_label', 'Exclusion Reason:')}</strong> {ex.exclusion_reason}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400 whitespace-nowrap self-start">
                        {t('journey_step5.audit_date_label', 'Audit Date:')} {ex.last_verified_at || '10/08/2026'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 5. TRANSPARENCY & AUDIT FOOTER ────────────────────────────── */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>{t('journey_step5.demo_footer', 'Demo Partner Data: Channel partner eligibility criteria simulated per NSFDC Master Guidelines & RBI NBFC inspection norms.')}</strong>
              </span>
            </div>
            <span className="font-semibold text-slate-500 whitespace-nowrap">
              {t('journey_step5.last_verified', 'Last Verified: 15/08/2026')}
            </span>
          </div>
        </>
      )}


      {/* ── 6. STEP NAVIGATION CONTROLS ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={prevJourneyStep}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('journey_step5.btn_back_impact', '← Back to Financial Impact')}</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
        >
          <span>{t('journey_step5.btn_proceed_guide', 'Proceed to Application Guide →')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── 7. PARTNER DETAILS MODAL ────────────────────────────── */}
      {detailsModalOpen && selectedDetailPartner && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                    {selectedDetailPartner.partner_type || selectedDetailPartner.type}
                  </span>
                  {isSelected(selectedDetailPartner) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      <span>Currently Selected Desk</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B3B60] mt-1.5">
                  {selectedDetailPartner.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Distance & Travel Duration Banner */}
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800">
              <div className="flex items-center gap-1.5 font-bold">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedDetailPartner.distance_text}</span>
                <span>·</span>
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>~{selectedDetailPartner.driving_duration_mins || 5} mins drive</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Verified: {selectedDetailPartner.last_verified_at || '15/08/2026'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#475569] divide-y divide-slate-100">
              <div className="pt-2">
                <strong>{t('journey_step5.modal_address', 'Address:')}</strong>
                <p className="text-slate-700 mt-0.5">{selectedDetailPartner.address}</p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <strong>{t('journey_step5.modal_fund_util', 'Fund Utilization:')}</strong>
                  <p className="text-emerald-700 font-bold">{selectedDetailPartner.fund_utilization_percent || 92.5}%</p>
                </div>
                <div>
                  <strong>{t('journey_step5.modal_overdue', 'Overdue Status:')}</strong>
                  <p className="text-emerald-700 font-bold">{selectedDetailPartner.overdue_status || 'Clean'}</p>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <strong>{t('journey_step5.modal_nodal_contact', 'Nodal Contact:')}</strong>
                  <p className="text-slate-800">{selectedDetailPartner.contact_person || 'Liaison Desk'}</p>
                </div>
                <div>
                  <strong>{t('journey_step5.modal_phone', 'Phone:')}</strong>
                  <p className="text-slate-800">{selectedDetailPartner.phone || '+91 755 2554101'}</p>
                </div>
              </div>

              <div className="pt-2">
                <strong>{t('journey_step5.modal_supported_schemes', 'Supported NSFDC Schemes:')}</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                  {Array.isArray(selectedDetailPartner.supported_schemes)
                    ? selectedDetailPartner.supported_schemes.map((s, i) => <li key={i}>{s}</li>)
                    : <li>{selectedDetailPartner.supported_schemes}</li>}
                </ul>
              </div>

              <div className="pt-2">
                <strong>{t('journey_step5.modal_audit_reason', 'Eligibility Audit Reason:')}</strong>
                <p className="text-slate-600 italic text-[11px] mt-0.5">
                  {selectedDetailPartner.eligibility_reason || 'Verified empanelled partner meeting all operational standards.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleTriggerDirections(selectedDetailPartner);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0B3B60] bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#0B3B60]" />
                <span>Get Directions on Map</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  {t('journey_step5.btn_close', 'Close')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelect(selectedDetailPartner);
                    setDetailsModalOpen(false);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected(selectedDetailPartner)
                      ? 'bg-emerald-600 text-white shadow-xs cursor-default'
                      : 'bg-[#0B3B60] hover:bg-[#07263F] text-white shadow-xs'
                  }`}
                >
                  {isSelected(selectedDetailPartner) ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Selected Desk ✓</span>
                    </>
                  ) : (
                    <span>Select This Partner Desk</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
