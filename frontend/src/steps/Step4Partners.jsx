import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  MapPin,
  Navigation,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getNearbyPartners, calculateRoute } from '../api';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import PartnerCard from '../components/PartnerCard';
import PartnerMap from '../components/PartnerMap';

export default function Step4Partners() {
  const { t } = useTranslation();
  const {
    formData,
    recommendResult,
    selectedScheme,
    selectedPartner,
    setSelectedPartner,
    setStep,
  } = useApp();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [searchCity, setSearchCity] = useState(formData.city || 'Bhopal');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'SCA' | 'PSB' | 'RRB' | 'NBFC_MFI'

  const activeScheme = selectedScheme || recommendResult?.best_match || {};
  const userLat = formData.latitude ? parseFloat(formData.latitude) : 23.2599;
  const userLng = formData.longitude ? parseFloat(formData.longitude) : 77.4126;

  const fetchPartners = async (cityOverride) => {
    setLoading(true);
    try {
      const res = await getNearbyPartners({
        latitude: userLat,
        longitude: userLng,
        city: cityOverride || searchCity,
        scheme_name: activeScheme.scheme_name || activeScheme.name || undefined,
        scheme_type: activeScheme.scheme_type || undefined,
      });

      const list = res.data.ranked_partners || [];
      setPartners(list);

      // Auto-select top compatible partner if none selected
      if (list.length > 0 && !selectedPartner) {
        handleSelectPartner(list[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch nearby partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [formData.city, activeScheme]);

  const handleSelectPartner = async (rankedItem) => {
    setSelectedPartner(rankedItem);

    // Calculate routing line between user and partner
    setRouteLoading(true);
    try {
      const res = await calculateRoute({
        start_lat: userLat,
        start_lng: userLng,
        end_lat: rankedItem.partner.latitude,
        end_lng: rankedItem.partner.longitude,
      });
      setRoutePoints(res.data.route_points || []);
    } catch {
      // Fallback: direct two-point line
      setRoutePoints([
        [userLat, userLng],
        [rankedItem.partner.latitude, rankedItem.partner.longitude],
      ]);
    } finally {
      setRouteLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    if (filterType === 'all') return true;
    return p.partner.partner_type === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0B3B60] uppercase tracking-wider">
              Step 4 · Channelizing Agency Locator
            </span>
            <StatusBadge status="verified" text="Multi-Factor Ranked" size="xs" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#0B3B60] font-bold tracking-tight">
            Select your Authorized Channelizing Partner
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568]">
            NSFDC loans are routed through authorized State Channelizing Agencies (SCAs) and empanelled bank branches.
          </p>
        </div>

        {activeScheme.scheme_name && (
          <div className="p-2.5 bg-[#EAF1F6] rounded-xl border border-[#0B3B60]/20 text-xs">
            <span className="text-[10px] text-[#6B7280] block font-semibold">Matched Scheme</span>
            <strong className="text-[#0B3B60]">{activeScheme.scheme_name}</strong>
          </div>
        )}
      </div>

      {/* Filter & City Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPartners(searchCity)}
            placeholder="Search by city (e.g. Bhopal, Indore)"
            className="w-full h-10 pl-9 pr-3 border border-[#CBD5E1] rounded-xl text-xs sm:text-sm outline-none focus:border-[#0B3B60]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 mr-1 hidden sm:inline">Type:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'SCA', label: 'SCAs' },
            { id: 'PSB', label: 'Banks' },
            { id: 'RRB', label: 'RRBs' },
            { id: 'NBFC_MFI', label: 'MFIs' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-base cursor-pointer ${
                filterType === f.id
                  ? 'bg-[#0B3B60] text-white shadow-xs'
                  : 'bg-[#F7F9FB] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#0B3B60] flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#0F8B8D]" />
            <span>Interactive Partner Map (OpenStreetMap)</span>
          </span>
          <span className="text-[11px] text-[#6B7280]">
            Click any pin to inspect & route
          </span>
        </div>

        <PartnerMap
          userLat={userLat}
          userLng={userLng}
          userCity={searchCity}
          partners={filteredPartners}
          selectedPartner={selectedPartner}
          routePoints={routePoints}
          onSelectPartner={handleSelectPartner}
          height="380px"
        />
      </div>

      {/* Ranked Partners List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#0B3B60]">
            Compatible Partner Agencies ({filteredPartners.length})
          </h3>
          <span className="text-xs text-[#6B7280]">
            Ranked by compatibility & proximity
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-xs text-[#6B7280]">
            Locating authorized Channelizing Agencies…
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] space-y-2">
            <p className="text-sm font-bold text-[#0B3B60]">No partner agencies found for this search.</p>
            <p className="text-xs text-gray-500">Try searching for state capital or checking all agency types.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.map((item) => (
              <PartnerCard
                key={item.partner.id}
                rankedPartner={item}
                isSelected={selectedPartner?.partner?.id === item.partner.id}
                onSelect={handleSelectPartner}
                onViewOnMap={handleSelectPartner}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="text-xs font-semibold text-[#6B7280] hover:text-[#0B3B60] transition-base cursor-pointer"
        >
          ← Back to EMI Calculator
        </button>

        <Button
          variant="primary"
          size="lg"
          disabled={!selectedPartner}
          onClick={() => setStep(5)}
          icon={ArrowRight}
        >
          Proceed to Document Checklist & Application →
        </Button>
      </div>
    </div>
  );
}
