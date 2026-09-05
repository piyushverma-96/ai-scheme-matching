import React from 'react';
import MapLibrePartnerMap from './MapLibrePartnerMap';

/**
 * Backwards-compatible PartnerMap export using MapLibre GL JS & OpenStreetMap.
 */
export default function PartnerMap({
  userLat = 23.2350,
  userLng = 77.4000,
  partners = [],
  selectedPartner = null,
  onSelectPartner,
  height = '480px',
}) {
  // Normalize partner structures if necessary
  const normalizedPartners = partners.map((item) => {
    if (item.partner) {
      return {
        id: item.partner.id,
        name: item.partner.name,
        type: item.partner.partner_type || item.partner.type,
        partner_type: item.partner.partner_type || item.partner.type,
        address: item.partner.address,
        latitude: item.partner.latitude,
        longitude: item.partner.longitude,
        lat: item.partner.latitude,
        lng: item.partner.longitude,
        status: item.partner.status || 'Active',
        supported_schemes: item.partner.supported_schemes,
        distance_text: `${item.distance_km?.toFixed(1) || 1.0} km away`,
      };
    }
    return item;
  });

  const normalizedSelected = selectedPartner?.partner
    ? {
        id: selectedPartner.partner.id,
        name: selectedPartner.partner.name,
        type: selectedPartner.partner.partner_type || selectedPartner.partner.type,
        partner_type: selectedPartner.partner.partner_type || selectedPartner.partner.type,
        address: selectedPartner.partner.address,
        latitude: selectedPartner.partner.latitude,
        longitude: selectedPartner.partner.longitude,
        lat: selectedPartner.partner.latitude,
        lng: selectedPartner.partner.longitude,
        status: selectedPartner.partner.status || 'Active',
        supported_schemes: selectedPartner.partner.supported_schemes,
        distance_text: `${selectedPartner.distance_km?.toFixed(1) || 1.0} km away`,
      }
    : selectedPartner;

  return (
    <MapLibrePartnerMap
      partners={normalizedPartners}
      selectedPartner={normalizedSelected}
      onSelectPartner={onSelectPartner}
      height={height}
    />
  );
}
