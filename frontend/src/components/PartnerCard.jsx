import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Navigation,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import Card from './Card';
import StatusBadge from './StatusBadge';

/**
 * Reusable Channelizing Partner Card
 * Requirements:
 *  - Partner Name & Type
 *  - Visible REQUIRED data_confidence_label badge ("Verified Master Data" vs "Prototype/Demo Data")
 *  - Distance in km & Travel Duration in mins
 *  - Address & Contact info
 *  - Multi-factor compatibility factors
 *  - Action to Select Partner / View Route
 */
export default function PartnerCard({
  rankedPartner,
  isSelected = false,
  onSelect,
  onViewOnMap,
  className = '',
}) {
  if (!rankedPartner) return null;

  const { partner, distance_km, driving_duration_mins, rank_score, compatibility_factors, is_best_available } =
    rankedPartner;

  const typeLabels = {
    SCA: 'State Channelizing Agency (SCA)',
    PSB: 'Public Sector Bank Branch (PSB)',
    RRB: 'Regional Rural Bank (RRB)',
    NBFC_MFI: 'Empanelled NBFC-MFI',
    Cooperative: 'Urban Cooperative Bank',
  };

  const isVerifiedMaster = partner.data_confidence_label === 'Verified Master Data';

  return (
    <Card
      accent={isSelected ? 'navy' : is_best_available ? 'amber' : 'none'}
      padding="p-5 sm:p-6"
      className={`transition-all space-y-4 hover:shadow-md relative ${
        isSelected ? 'ring-2 ring-[#0B3B60] bg-[#F7F9FB]' : 'bg-white'
      } ${className}`}
    >
      {/* Top Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Partner Type */}
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-[#EAF1F6] text-[#0B3B60]">
            {typeLabels[partner.partner_type] || partner.partner_type}
          </span>

          {/* REQUIRED DATA CONFIDENCE LABEL BADGE */}
          {isVerifiedMaster ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F7EE] text-[#1A7F4E] border border-[#1A7F4E]/30 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-[#1A7F4E]" />
              <span>Verified Master Data</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF9E7] text-[#B8860B] border border-[#B8860B]/30 shadow-2xs">
              <AlertTriangle className="w-3 h-3 text-[#B8860B]" />
              <span>Prototype/Demo Data</span>
            </span>
          )}

          {is_best_available && (
            <StatusBadge status="best_match" text="Top Recommended" size="xs" />
          )}
        </div>

        {/* Distance & Travel Time Tag */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0B3B60] bg-[#F3F4F6] px-2.5 py-1 rounded-lg">
          <Navigation className="w-3.5 h-3.5 text-[#0F8B8D]" />
          <span>{distance_km.toFixed(1)} km</span>
          {driving_duration_mins != null && (
            <span className="text-[#6B7280] font-sans font-normal text-[11px]">
              (~{Math.round(driving_duration_mins)} min drive)
            </span>
          )}
        </div>
      </div>

      {/* Partner Title & Address */}
      <div className="space-y-1">
        <h3 className="font-serif text-base sm:text-lg font-bold text-[#0B3B60] leading-snug">
          {partner.name}
        </h3>
        <p className="text-xs text-[#4A5568] flex items-start gap-1.5 leading-relaxed">
          <MapPin className="w-3.5 h-3.5 text-[#6B7280] shrink-0 mt-0.5" />
          <span>
            {partner.address}, {partner.city}, {partner.state} {partner.pincode ? `- ${partner.pincode}` : ''}
          </span>
        </p>
      </div>

      {/* Contact & Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6B7280] pt-1">
        {partner.phone && (
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 text-[#0F8B8D] shrink-0" />
            <span className="font-mono">{partner.phone}</span>
          </div>
        )}
        {partner.operating_hours && (
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
            <span className="truncate">{partner.operating_hours}</span>
          </div>
        )}
      </div>

      {/* Multi-Factor Compatibility Checklist */}
      {compatibility_factors && compatibility_factors.length > 0 && (
        <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#E5E7EB] space-y-1.5 text-xs">
          <span className="text-[10px] font-bold text-[#0B3B60] uppercase tracking-wider block">
            Why Selected for Your Application:
          </span>
          {compatibility_factors.map((factor, idx) => (
            <p key={idx} className="flex items-center gap-1.5 text-[11px] text-[#1C1C1C]">
              <CheckCircle2 className="w-3 h-3 text-[#1A7F4E] shrink-0" />
              <span>{factor}</span>
            </p>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#E5E7EB]">
        {onViewOnMap && (
          <button
            type="button"
            onClick={() => onViewOnMap(rankedPartner)}
            className="w-full py-2.5 px-3 bg-white hover:bg-[#EAF1F6] text-[#0B3B60] border border-[#0B3B60] text-xs font-semibold rounded-xl transition-base flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#0B3B60]" />
            <span>View Route on Map</span>
          </button>
        )}

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(rankedPartner)}
            className={`w-full py-2.5 px-3 font-bold text-xs rounded-xl shadow-xs transition-base flex items-center justify-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-[#1A7F4E] hover:bg-[#14643E] text-white'
                : 'bg-[#0B3B60] hover:bg-[#07263F] text-white'
            }`}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selected Agency</span>
              </>
            ) : (
              <>
                <span>Choose this Agency</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </Card>
  );
}
