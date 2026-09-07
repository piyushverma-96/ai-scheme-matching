import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BarChart3,
  Layers,
  Building2,
  GitBranch,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Edit,
} from 'lucide-react';
import {
  getAdminAnalytics,
  getAdminSchemes,
  toggleAdminSchemeStatus,
  getAdminPartners,
  createAdminPartner,
  updateAdminPartnerStatus,
  getAdminMappings,
  updateAdminMapping,
  getAdminApplications,
  updateAdminAppStatus,
} from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const formatINR = (num) =>
  num != null ? `₹${Number(Math.round(num)).toLocaleString('en-IN')}` : '—';

export default function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'schemes' | 'partners' | 'mappings' | 'applications'

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Schemes state
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);

  // Partners state
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [newPartnerModalOpen, setNewPartnerModalOpen] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: '',
    partner_type: 'SCA',
    address: '',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462001',
    latitude: 23.2599,
    longitude: 77.4126,
    status: 'Operational',
    supported_schemes: ['micro_finance', 'term_loan'],
    phone: '',
    email: '',
  });

  // Mappings state
  const [mappings, setMappings] = useState(null);
  const [mappingsLoading, setMappingsLoading] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appSearch, setAppSearch] = useState('');
  const [selectedAppForStatus, setSelectedAppForStatus] = useState(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    new_status: 'Under Review',
    remarks: 'Documents verified and found in order.',
    updated_by: 'State Channelizing Agency Officer',
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Initial load
  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'schemes') loadSchemes();
    if (activeTab === 'partners') loadPartners();
    if (activeTab === 'mappings') loadMappings();
    if (activeTab === 'applications') loadApplications();
  }, [activeTab]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await getAdminAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSchemes = async () => {
    setSchemesLoading(true);
    try {
      const res = await getAdminSchemes();
      setSchemes(res.data.schemes || []);
    } catch (err) {
      console.warn('Schemes fetch error:', err);
    } finally {
      setSchemesLoading(false);
    }
  };

  const handleToggleScheme = async (schemeId, currentActive) => {
    try {
      await toggleAdminSchemeStatus(schemeId, !currentActive);
      setSchemes((prev) =>
        prev.map((s) => (s.id === schemeId ? { ...s, is_active: !currentActive } : s))
      );
    } catch (err) {
      console.error('Failed to toggle scheme status:', err);
    }
  };

  const loadPartners = async () => {
    setPartnersLoading(true);
    try {
      const res = await getAdminPartners();
      setPartners(res.data.partners || []);
    } catch (err) {
      console.warn('Partners fetch error:', err);
    } finally {
      setPartnersLoading(false);
    }
  };

  const handlePartnerStatusChange = async (partnerId, newStatus) => {
    try {
      await updateAdminPartnerStatus(partnerId, newStatus);
      setPartners((prev) =>
        prev.map((p) => (p.id === partnerId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Failed to update partner status:', err);
    }
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    try {
      await createAdminPartner(newPartnerForm);
      setNewPartnerModalOpen(false);
      loadPartners();
      setNewPartnerForm({
        name: '',
        partner_type: 'SCA',
        address: '',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '462001',
        latitude: 23.2599,
        longitude: 77.4126,
        status: 'Operational',
        supported_schemes: ['micro_finance', 'term_loan'],
        phone: '',
        email: '',
      });
    } catch (err) {
      console.error('Failed to create partner:', err);
    }
  };

  const loadMappings = async () => {
    setMappingsLoading(true);
    try {
      const res = await getAdminMappings();
      setMappings(res.data);
    } catch (err) {
      console.warn('Mappings fetch error:', err);
    } finally {
      setMappingsLoading(false);
    }
  };

  const loadApplications = async (statusOverride, searchOverride) => {
    setAppsLoading(true);
    try {
      const params = {};
      const status = statusOverride !== undefined ? statusOverride : appStatusFilter;
      if (status && status !== 'all') params.status = status;
      const search = searchOverride !== undefined ? searchOverride : appSearch;
      if (search) params.search = search;

      const res = await getAdminApplications(params);
      setApplications(res.data || []);
    } catch (err) {
      console.warn('Applications fetch error:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleOpenStatusModal = (app) => {
    setSelectedAppForStatus(app);
    setStatusUpdateForm({
      new_status: app.status === 'Submitted' ? 'Under Review' : 'Forwarded to Partner',
      remarks: 'Application scrutinised and verified by State Channelizing Agency desk.',
      updated_by: 'SCA Loan Officer (Bhopal)',
    });
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppForStatus) return;
    setStatusUpdating(true);
    try {
      await updateAdminAppStatus(selectedAppForStatus.id, statusUpdateForm);
      setSelectedAppForStatus(null);
      loadApplications();
      loadAnalytics();
    } catch (err) {
      console.error('Failed to update application status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics & Health', icon: BarChart3 },
    { id: 'schemes', label: 'Schemes & Rules', icon: Layers },
    { id: 'partners', label: 'Channel Partners', icon: Building2 },
    { id: 'mappings', label: 'Scheme Mapping', icon: GitBranch },
    { id: 'applications', label: 'Applications & Status', icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0B3B60] via-[#0D4B7A] to-[#0B3B60] text-white p-6 rounded-2xl shadow-md space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EE] text-[#1A7F4E] uppercase tracking-wider">
                Government Officer Portal
              </span>
              <span className="text-xs text-blue-200 font-medium">
                MoSJE · NSFDC Governance
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              UdyamNex Administration & Monitoring Panel
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl">
              Centralized interface for managing verified NSFDC loan schemes, deterministic eligibility thresholds, State Channelizing Agencies (SCAs), and beneficiary application pipelines.
            </p>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1.5 shrink-0 bg-white/10 p-3 rounded-xl border border-white/20">
            <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
              Data Provenance
            </span>
            <span className="text-xs font-bold text-white font-mono">
              Audit: 2026-09-05
            </span>
            <span className="text-[10px] text-[#A3E635] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% Deterministic Rules</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] overflow-x-auto pb-1 max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-base cursor-pointer whitespace-nowrap min-h-[44px] ${
                isActive
                  ? 'bg-white text-[#0B3B60] border-t-2 border-x border-[#E5E7EB] border-t-[#0B3B60] shadow-2xs'
                  : 'text-[#4A5568] hover:text-[#0B3B60] hover:bg-[#F7F9FB]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B3B60]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Platform Analytics & Data Health ────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="p-12 text-center text-xs text-[#6B7280]">
              Loading system metrics and governance health…
            </div>
          ) : analytics ? (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="p-4 sm:p-5" className="border-l-4 border-l-[#0B3B60]">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Verified Schemes
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3B60] mt-1 font-mono">
                    {analytics.active_schemes} / {analytics.total_schemes}
                  </div>
                  <span className="text-[10px] text-[#1A7F4E] font-semibold mt-1 block">
                    100% Grounded in NSFDC Policy
                  </span>
                </Card>

                <Card padding="p-4 sm:p-5" className="border-l-4 border-l-[#0F8B8D]">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Channelizing Partners
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#0F8B8D] mt-1 font-mono">
                    {analytics.operational_partners} / {analytics.total_partners}
                  </div>
                  <span className="text-[10px] text-[#6B7280] mt-1 block">
                    SCAs, RRBs, Banks & MFIs
                  </span>
                </Card>

                <Card padding="p-4 sm:p-5" className="border-l-4 border-l-[#C77D02]">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Total Applications
                  </span>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C77D02] mt-1 font-mono">
                    {analytics.total_applications}
                  </div>
                  <span className="text-[10px] text-[#6B7280] mt-1 block">
                    Registered on UdyamNex
                  </span>
                </Card>

                <Card padding="p-4 sm:p-5" className="border-l-4 border-l-[#1A7F4E]">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Avg. Loan Requirement
                  </span>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-[#1A7F4E] mt-1 font-mono">
                    {formatINR(analytics.average_loan_amount)}
                  </div>
                  <span className="text-[10px] text-[#6B7280] mt-1 block font-mono">
                    Vol: {formatINR(analytics.total_loan_volume_requested)}
                  </span>
                </Card>
              </div>

              {/* Status Distribution Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                    <h3 className="font-serif text-lg font-bold text-[#0B3B60]">
                      Application Pipeline Distribution
                    </h3>
                    <span className="text-xs text-[#6B7280]">Stage-by-Stage Breakdown</span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(analytics.applications_by_status || {}).map(([st, count]) => {
                      const total = analytics.total_applications || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={st} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[#1C1C1C]">{st}</span>
                            <span className="text-[#0B3B60] font-mono">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0B3B60] rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Data Governance & Verification Health */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-[#0B3B60] pb-3 border-b border-[#E5E7EB]">
                    <ShieldCheck className="w-5 h-5 text-[#1A7F4E]" />
                    <h3 className="font-serif text-lg font-bold">
                      Data Quality & Integrity Health
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-[#E8F7EE] rounded-xl border border-[#1A7F4E]/30 space-y-1">
                      <strong className="text-[#1A7F4E] block">
                        Verified Primary Authority:
                      </strong>
                      <span className="text-[#1C1C1C] leading-snug">
                        {analytics.official_authority}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB] space-y-1">
                      <span className="text-[#6B7280] block text-[11px]">
                        Last Master Data Verification:
                      </span>
                      <strong className="text-[#0B3B60] font-mono">
                        {analytics.last_system_audit_date}
                      </strong>
                    </div>

                    <div className="p-3 bg-[#FEF9E7] rounded-xl border border-[#B8860B]/30 text-[#8B6508] space-y-1">
                      <strong>Governance Compliance: </strong>
                      <span className="leading-snug block">
                        All interest rates, loan limits, and SC eligibility criteria are validated against published NSFDC gazette notifications.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── TAB 2: Manage Schemes & Rules ──────────────────────────────────── */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0B3B60]">
                Official NSFDC Schemes & Deterministic Rules
              </h3>
              <p className="text-xs text-[#6B7280]">
                Inspect rule engine parameters, source links, and toggle active availability.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadSchemes} icon={RefreshCw}>
              Refresh
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAF1F6] text-[#0B3B60] font-bold border-b border-[#CBD5E1]">
                    <th className="p-3.5">Scheme Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Loan Limit</th>
                    <th className="p-3.5">Interest Rate</th>
                    <th className="p-3.5">Tenure</th>
                    <th className="p-3.5">Source & Verification</th>
                    <th className="p-3.5 text-center">Active Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {schemesLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Loading schemes…
                      </td>
                    </tr>
                  ) : (
                    schemes.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F7F9FB] transition-base">
                        <td className="p-3.5">
                          <div className="font-bold text-[#0B3B60]">{s.name}</div>
                          <div className="text-[11px] text-gray-500 max-w-xs truncate">
                            {s.short_description}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium capitalize">
                            {s.scheme_type?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#0B3B60]">
                          {formatINR(s.max_loan_amount)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#1A7F4E]">
                          {s.rate_beneficiary_min}% p.a.
                        </td>
                        <td className="p-3.5 font-mono">
                          {s.repayment_years_max} yrs ({s.moratorium_months}m grace)
                        </td>
                        <td className="p-3.5 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold text-gray-700">
                              {s.source_name}
                            </span>
                            <a
                              href={s.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0B3B60] hover:text-[#C77D02]"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Verified: {s.last_verified_at}
                          </div>
                          {s.needs_manual_verification && (
                            <span className="inline-block text-[9px] font-bold text-[#B8860B] bg-[#FEF9E7] px-1.5 py-0.5 rounded">
                              Flagged for verification
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleScheme(s.id, s.is_active)}
                            className="cursor-pointer"
                          >
                            {s.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F7EE] text-[#1A7F4E]">
                                <ToggleRight className="w-4 h-4" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                <ToggleLeft className="w-4 h-4" />
                                <span>Disabled</span>
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Manage Channel Partners ─────────────────────────────────── */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0B3B60]">
                State Channelizing Agencies & Empanelled Banks
              </h3>
              <p className="text-xs text-[#6B7280]">
                Manage operational branches, supported schemes, and contact coordinates.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setNewPartnerModalOpen(true)}
                icon={Plus}
              >
                Add Partner Agency
              </Button>
              <Button variant="secondary" size="sm" onClick={loadPartners} icon={RefreshCw}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAF1F6] text-[#0B3B60] font-bold border-b border-[#CBD5E1]">
                    <th className="p-3.5">Agency Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Supported Schemes</th>
                    <th className="p-3.5">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {partnersLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Loading partner agencies…
                      </td>
                    </tr>
                  ) : (
                    partners.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F7F9FB] transition-base">
                        <td className="p-3.5 font-bold text-[#0B3B60] max-w-xs">
                          {p.name}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF1F6] text-[#0B3B60]">
                            {p.partner_type}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-gray-800">{p.city}, {p.state}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[160px]">{p.address}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <div>{p.phone || '—'}</div>
                          <div className="text-gray-500 text-[10px]">{p.email || '—'}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.supported_schemes?.slice(0, 3).map((sc, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700"
                              >
                                {sc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={p.status}
                            onChange={(e) => handlePartnerStatusChange(p.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer outline-none ${
                              p.status === 'Operational'
                                ? 'bg-[#E8F7EE] text-[#1A7F4E] border-[#1A7F4E]/30'
                                : p.status === 'Active'
                                ? 'bg-[#EAF1F6] text-[#0B3B60] border-[#0B3B60]/30'
                                : 'bg-gray-100 text-gray-500 border-gray-300'
                            }`}
                          >
                            <option value="Operational">Operational</option>
                            <option value="Active">Active</option>
                            <option value="Temporarily Inactive">Temporarily Inactive</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Scheme-Partner Mapping ─────────────────────────────────── */}
      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0B3B60]">
                Scheme-to-Partner Routing Matrix
              </h3>
              <p className="text-xs text-[#6B7280]">
                Overview of Channelizing Agency coverage across verified scheme types.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadMappings} icon={RefreshCw}>
              Refresh Matrix
            </Button>
          </div>

          {mappingsLoading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              Loading routing matrix…
            </div>
          ) : mappings ? (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappings.schemes?.map((sc) => {
                  const matchingPartners = (mappings.partners || []).filter((p) =>
                    p.supported_schemes?.some((s) => s.toLowerCase().includes(sc.type.toLowerCase()) || s.toLowerCase().includes(sc.name.toLowerCase()))
                  );
                  return (
                    <div key={sc.id} className="p-4 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between border-b pb-2 border-[#CBD5E1]">
                        <h4 className="font-serif font-bold text-sm text-[#0B3B60]">
                          {sc.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#1A7F4E] bg-[#E8F7EE] px-2 py-0.5 rounded">
                          {matchingPartners.length} Agencies
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <span className="text-[11px] text-gray-500 font-semibold block">
                          Handling Partners:
                        </span>
                        {matchingPartners.map((mp) => (
                          <div
                            key={mp.id}
                            className="flex justify-between items-center text-[11px] text-gray-700 bg-white p-1.5 rounded border border-gray-200"
                          >
                            <span className="font-medium truncate max-w-[220px]">{mp.name}</span>
                            <span className="text-[10px] text-[#0B3B60] font-bold font-mono">
                              {mp.type} · {mp.city}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── TAB 5: Applications & Status Management ────────────────────────── */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0B3B60]">
                Beneficiary Scheme Applications
              </h3>
              <p className="text-xs text-[#6B7280]">
                Inspect registered applications and simulate official verification stage transitions.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => loadApplications()} icon={RefreshCw}>
              Refresh
            </Button>
          </div>

          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => {
                  setAppSearch(e.target.value);
                  loadApplications(undefined, e.target.value);
                }}
                placeholder="Search by app #, phone, or name..."
                className="w-full h-10 pl-9 pr-3 border border-[#E5E7EB] rounded-lg text-xs sm:text-sm outline-none focus:border-[#0B3B60]"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 mr-1">Status:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'Submitted', label: 'Submitted' },
                { id: 'Under Review', label: 'Under Review' },
                { id: 'Documents Required', label: 'Doc Required' },
                { id: 'Forwarded to Partner', label: 'Forwarded' },
                { id: 'Decision', label: 'Decision' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setAppStatusFilter(f.id);
                    loadApplications(f.id, undefined);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-base cursor-pointer ${
                    appStatusFilter === f.id
                      ? 'bg-[#0B3B60] text-white shadow-xs'
                      : 'bg-[#F7F9FB] text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAF1F6] text-[#0B3B60] font-bold border-b border-[#CBD5E1]">
                    <th className="p-3.5">Application #</th>
                    <th className="p-3.5">Applicant</th>
                    <th className="p-3.5">Scheme</th>
                    <th className="p-3.5">Loan Amount</th>
                    <th className="p-3.5">Assigned Agency</th>
                    <th className="p-3.5">Current Stage</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {appsLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Loading applications…
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No applications matching current search criteria.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#F7F9FB] transition-base">
                        <td className="p-3.5 font-mono font-bold text-[#0B3B60]">
                          {app.application_number}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{app.applicant_name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{app.applicant_phone}</div>
                        </td>
                        <td className="p-3.5 font-medium text-gray-800">
                          {app.scheme_name}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#1A7F4E]">
                          {formatINR(app.loan_amount)}
                        </td>
                        <td className="p-3.5 text-gray-600 max-w-[160px] truncate">
                          {app.partner_name || 'State Channelizing Agency'}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status="potentially_eligible" text={app.status} size="xs" />
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            className="px-3 py-1.5 bg-[#0B3B60] hover:bg-[#07263F] text-white text-xs font-semibold rounded-lg transition-base cursor-pointer shadow-2xs"
                          >
                            Update Stage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Update Prototype Application Status ─────────────────────── */}
      {selectedAppForStatus && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl space-y-4 border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#0B3B60]">
                  Advance Application Stage
                </h3>
                <span className="text-xs text-[#6B7280] font-mono">
                  {selectedAppForStatus.application_number} · {selectedAppForStatus.applicant_name}
                </span>
              </div>
              <button
                onClick={() => setSelectedAppForStatus(null)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B3B60] block mb-1">
                  Transition to Stage:
                </label>
                <select
                  value={statusUpdateForm.new_status}
                  onChange={(e) =>
                    setStatusUpdateForm({ ...statusUpdateForm, new_status: e.target.value })
                  }
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl font-semibold outline-none focus:border-[#0B3B60]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Documents Required">Documents Required</option>
                  <option value="Forwarded to Partner">Forwarded to Partner</option>
                  <option value="Processing">Processing</option>
                  <option value="Decision">Decision (Sanction Recommended)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0B3B60] block mb-1">
                  Officer Remarks / Audit Note:
                </label>
                <textarea
                  rows={3}
                  value={statusUpdateForm.remarks}
                  onChange={(e) =>
                    setStatusUpdateForm({ ...statusUpdateForm, remarks: e.target.value })
                  }
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                  placeholder="e.g. Caste certificate verified against Revenue Authority DB."
                />
              </div>

              <div>
                <label className="font-bold text-[#0B3B60] block mb-1">
                  Officer Designation:
                </label>
                <input
                  type="text"
                  value={statusUpdateForm.updated_by}
                  onChange={(e) =>
                    setStatusUpdateForm({ ...statusUpdateForm, updated_by: e.target.value })
                  }
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedAppForStatus(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="md" loading={statusUpdating}>
                  Save & Update Timeline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add New Channel Partner Agency ───────────────────────────── */}
      {newPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full max-w-[calc(100vw-32px)] max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl space-y-4 border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-[#0B3B60]">
                Register Channelizing Partner Agency
              </h3>
              <button
                onClick={() => setNewPartnerModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0B3B60] block mb-1">Agency Name *</label>
                <input
                  type="text"
                  required
                  value={newPartnerForm.name}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, name: e.target.value })}
                  placeholder="e.g. M.P. Rajya SC Finance Corporation Branch"
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0B3B60] block mb-1">Partner Type</label>
                  <select
                    value={newPartnerForm.partner_type}
                    onChange={(e) =>
                      setNewPartnerForm({ ...newPartnerForm, partner_type: e.target.value })
                    }
                    className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                  >
                    <option value="SCA">SCA (State Agency)</option>
                    <option value="PSB">PSB (Public Sector Bank)</option>
                    <option value="RRB">RRB (Regional Rural Bank)</option>
                    <option value="NBFC_MFI">NBFC-MFI</option>
                    <option value="Cooperative">Cooperative Bank</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B3B60] block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.city}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, city: e.target.value })}
                    className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B3B60] block mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={newPartnerForm.address}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, address: e.target.value })}
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0B3B60] block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPartnerForm.phone}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, phone: e.target.value })}
                    placeholder="0755-2441234"
                    className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0B3B60] block mb-1">Email</label>
                  <input
                    type="email"
                    value={newPartnerForm.email}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, email: e.target.value })}
                    placeholder="branch@agency.gov.in"
                    className="w-full p-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B3B60]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setNewPartnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="md">
                  Register Partner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
