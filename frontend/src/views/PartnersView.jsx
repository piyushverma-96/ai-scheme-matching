import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  MapPin,
  Building2,
  Navigation,
  Phone,
  CheckCircle2,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PARTNERS_DATA } from '../data/mockData';
import MapLibrePartnerMap from '../components/MapLibrePartnerMap';

export default function PartnersView() {
  const { navigateTo } = useApp();
  const [userLocation, setUserLocation] = useState({
    lat: 23.2350,
    lng: 77.4000,
    city: 'Bhopal',
  });
  const [selectedPartner, setSelectedPartner] = useState(PARTNERS_DATA[0]);

  const handleLocationChange = ({ lat, lng, city }) => {
    setUserLocation({ lat, lng, city });
    if (lat && lng && PARTNERS_DATA.length > 0) {
      let closest = PARTNERS_DATA[0];
      let minD = Infinity;
      PARTNERS_DATA.forEach((p) => {
        const pLat = Number(p.latitude || p.lat || 0);
        const pLng = Number(p.longitude || p.lng || 0);
        const d = Math.hypot(pLat - lat, pLng - lng);
        if (d < minD) {
          minD = d;
          closest = p;
        }
      });
      setSelectedPartner(closest);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer min-h-[44px] px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Empanelled Financial Institutions &amp; SCAs
        </span>
      </div>

      {/* Real Interactive MapLibre GL Map */}
      <MapLibrePartnerMap
        partners={PARTNERS_DATA}
        selectedPartner={selectedPartner}
        onSelectPartner={setSelectedPartner}
        userLocation={userLocation}
        onLocationChange={handleLocationChange}
        height="clamp(340px, 50vh, 500px)"
      />

      {/* Partner Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#0B3B60]">
          Empanelled Branch List
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNERS_DATA.map((partner) => (
            <div
              key={partner.id}
              onClick={() => setSelectedPartner(partner)}
              className={`bg-white rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                selectedPartner?.id === partner.id
                  ? 'border-[#0B3B60] ring-2 ring-[#0B3B60]/10 bg-[#EFF6FF]/20'
                  : 'border-[#E2E8F0] hover:border-[#0B3B60]/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5 stroke-[2]" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0B3B60]">
                      {partner.name}
                    </h4>
                    <span className="text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-md">
                      {partner.type || partner.partner_type}
                    </span>
                    <span className="text-[10px] font-bold bg-[#E8F8F2] text-[#10B981] px-2 py-0.5 rounded-md">
                      {partner.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    <span>{partner.address}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#F1F5F9]">
                <span className="text-xs font-bold text-[#64748B] font-mono">
                  {partner.distance_text}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPartner(partner);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#0B3B60] hover:bg-[#EFF6FF] text-[#0B3B60] text-xs font-bold transition-colors cursor-pointer min-h-[40px] flex items-center justify-center"
                >
                  View on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
