import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  Navigation,
  Search,
  Crosshair,
  Compass,
  AlertCircle,
  Clock,
  Building2,
  CheckCircle2,
  ExternalLink,
  Layers,
  X,
  Loader2,
  Route as RouteIcon,
} from 'lucide-react';
import axios from 'axios';

// Standard OpenStreetMap Style for MapLibre GL JS (100% reliable, zero token required)
const OSM_STYLE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Default Bhopal coordinates (Central India)
const DEFAULT_CENTER = [77.4126, 23.2599]; // [lng, lat] for MapLibre

// Color tokens for partner types
const PARTNER_TYPE_COLORS = {
  'State Channelizing Agency': { bg: '#0B3B60', text: '#FFFFFF', label: 'SCA' },
  'SCA': { bg: '#0B3B60', text: '#FFFFFF', label: 'SCA' },
  'Bank': { bg: '#10B981', text: '#FFFFFF', label: 'PSB' },
  'PSB': { bg: '#10B981', text: '#FFFFFF', label: 'PSB' },
  'NBFC-MFI': { bg: '#0284C7', text: '#FFFFFF', label: 'NBFC-MFI' },
  'Cooperative': { bg: '#8B5CF6', text: '#FFFFFF', label: 'Co-op' },
};

function getPartnerBadge(type = '') {
  if (type.includes('Channelizing') || type.includes('SCA')) return PARTNER_TYPE_COLORS['SCA'];
  if (type.includes('Bank') || type.includes('PSB')) return PARTNER_TYPE_COLORS['Bank'];
  if (type.includes('MFI') || type.includes('NBFC')) return PARTNER_TYPE_COLORS['NBFC-MFI'];
  return PARTNER_TYPE_COLORS['Cooperative'] || { bg: '#0B3B60', text: '#FFFFFF', label: type };
}

// Calculate Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export default function MapLibrePartnerMap({
  partners = [],
  selectedPartner = null,
  onSelectPartner,
  onViewDetails,
  selectedSchemeName = '',
  height = 'clamp(340px, 50vh, 500px)',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // States
  const [userLocation, setUserLocation] = useState({
    lat: 23.2350,
    lng: 77.4000,
    city: 'Bhopal',
    status: 'prompt', // 'prompt' | 'granted' | 'denied' | 'error'
  });
  const [geoErrorMsg, setGeoErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [activePartner, setActivePartner] = useState(selectedPartner || partners[0]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Update active partner when prop changes
  useEffect(() => {
    if (selectedPartner && selectedPartner.id !== activePartner?.id) {
      setActivePartner(selectedPartner);
    }
  }, [selectedPartner]);

  // 1. Request Browser Geolocation on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            city: 'Current Device Location',
            status: 'granted',
          });
          setGeoErrorMsg(null);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 13,
              speed: 1.2,
            });
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
          setUserLocation((prev) => ({ ...prev, status: 'denied' }));
          setGeoErrorMsg('Location access is unavailable. You can search by city or pincode.');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setUserLocation((prev) => ({ ...prev, status: 'denied' }));
      setGeoErrorMsg('Location access is unavailable. You can search by city or pincode.');
    }
  }, []);

  // 2. Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const initialLng = userLocation?.lng || DEFAULT_CENTER[0];
      const initialLat = userLocation?.lat || DEFAULT_CENTER[1];

      // Create MapLibre instance with OpenStreetMap style
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: OSM_STYLE, // Direct reliable OSM raster style; works offline/online with 0 auth token
        center: [initialLng, initialLat],
        zoom: 12.5,
        attributionControl: false,
      });

      // Add Attribution Control with OSM credit
      map.addControl(
        new maplibregl.AttributionControl({
          compact: false,
          customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | Directions: HeiGIT openrouteservice',
        }),
        'bottom-right'
      );

      // Add Navigation Controls (Zoom & Rotation)
      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: false,
          showCompass: true,
          showZoom: true,
        }),
        'top-right'
      );

      map.on('load', () => {
        mapInstanceRef.current = map;
        setMapLoaded(true);
        // Add empty route source & line layer for navigation
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });

        // Background route casing (outer border)
        map.addLayer({
          id: 'route-casing',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0B3B60',
            'line-width': 7,
            'line-opacity': 0.9,
          },
        });

        // Inner glowing route line
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#2563EB',
            'line-width': 4,
            'line-opacity': 1,
          },
        });
      });

      map.on('error', (e) => {
        console.warn('MapLibre internal notice:', e?.error?.message || e);
      });

      return () => {
        markersRef.current.forEach((m) => m.remove());
        if (userMarkerRef.current) userMarkerRef.current.remove();
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize MapLibre GL:', err);
      setMapError('Map could not be loaded. Please check your internet connection.');
    }
  }, []);

  // 3. Render / Update User Marker on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create User Location DOM Element with pulsing ring
    const userEl = document.createElement('div');
    userEl.className = 'user-location-marker';
    userEl.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.25);
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2563EB;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 2;
        "></div>
      </div>
    `;

    const userMarker = new maplibregl.Marker({ element: userEl, anchor: 'center' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 15 }).setHTML(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #0B3B60; font-size: 12px;">● Your Location</strong>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748B;">${userLocation.city || 'Applicant Coordinates'}</p>
          </div>
        `)
      )
      .addTo(map);

    userMarkerRef.current = userMarker;
  }, [userLocation, mapLoaded]);

  // 4. Render / Update Partner Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    partners.forEach((partner) => {
      const isSelected = activePartner?.id === partner.id;
      const badge = getPartnerBadge(partner.type || partner.partner_type);

      // Create Custom Marker DOM Element
      const markerEl = document.createElement('div');
      markerEl.className = `partner-marker ${isSelected ? 'selected' : ''}`;
      markerEl.style.cursor = 'pointer';
      markerEl.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.2s ease;
          transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
          z-index: ${isSelected ? '20' : '10'};
        ">
          <div style="
            background: ${isSelected ? '#0B3B60' : badge.bg};
            color: ${badge.text};
            border: ${isSelected ? '3px solid #F59E0B' : '2px solid #FFFFFF'};
            border-radius: 20px;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: 700;
            box-shadow: ${isSelected ? '0 0 0 4px rgba(245, 158, 11, 0.3), 0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)'};
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span>📍</span>
            <span>${partner.name.length > 18 ? partner.name.slice(0, 16) + '…' : partner.name}</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid ${isSelected ? '#0B3B60' : badge.bg};
            margin-top: -1px;
          "></div>
        </div>
      `;

      // Marker click handler
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelectPartner(partner);
      });

      // Popup
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        partner.lat || partner.latitude,
        partner.lng || partner.longitude
      );

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(`
        <div style="font-family: sans-serif; padding: 6px; max-width: 220px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="background: #EFF6FF; color: #1E40AF; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700;">
              ${partner.type || partner.partner_type}
            </span>
            <span style="color: #10B981; font-weight: 700; font-size: 10px;">${dist} km away</span>
          </div>
          <strong style="color: #0B3B60; font-size: 12px; display: block; margin-bottom: 2px;">${partner.name}</strong>
          <p style="color: #64748B; margin: 0 0 6px 0; font-size: 10px; line-height: 1.3;">${partner.address}</p>
          <div style="color: #065F46; font-size: 9px; font-weight: 600;">Status: ${partner.status || 'Active & Empanelled'}</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
        .setLngLat([partner.lng || partner.longitude, partner.lat || partner.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [partners, activePartner, userLocation, mapLoaded]);

  // 5. Select a partner & focus on map
  const handleSelectPartner = useCallback(
    (partner) => {
      setActivePartner(partner);
      if (onSelectPartner) onSelectPartner(partner);

      const pLat = partner.lat || partner.latitude;
      const pLng = partner.lng || partner.longitude;

      if (mapInstanceRef.current && pLat && pLng) {
        mapInstanceRef.current.flyTo({
          center: [pLng, pLat],
          zoom: 13.8,
          speed: 1.2,
          curve: 1.42,
        });
      }
    },
    [onSelectPartner]
  );

  // 6. Search location by city, area or pincode (Nominatim OSM Geocoding)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      // 1. Try OSM Nominatim Geocoding API directly
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ', India'
      )}&limit=1`;
      const res = await axios.get(url, {
        headers: { 'Accept-Language': 'en' },
        timeout: 6000,
      });

      if (res.data && res.data.length > 0) {
        const item = res.data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);

        setUserLocation({
          lat: newLat,
          lng: newLng,
          city: item.display_name?.split(',')[0] || searchQuery,
          status: 'granted',
        });
        setGeoErrorMsg(null);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: [newLng, newLat],
            zoom: 13,
            speed: 1.3,
          });
        }
      } else {
        // Fallback common Indian city dictionary
        const cityDict = {
          bhopal: [77.4126, 23.2599, 'Bhopal, MP'],
          indore: [75.8577, 22.7196, 'Indore, MP'],
          jabalpur: [79.9864, 23.1815, 'Jabalpur, MP'],
          gwalior: [78.1828, 26.2183, 'Gwalior, MP'],
          delhi: [77.2090, 28.6139, 'New Delhi'],
          mumbai: [72.8777, 19.0760, 'Mumbai, MH'],
          '462001': [77.4080, 23.2680, 'Bhopal 462001'],
          '462003': [77.4012, 23.2356, 'TT Nagar 462003'],
          '462016': [77.4332, 23.2189, 'Habib Ganj 462016'],
          '462041': [77.4651, 23.2625, 'Ayodhya Nagar 462041'],
        };
        const queryClean = searchQuery.toLowerCase().trim();
        const found = Object.entries(cityDict).find(([k]) => queryClean.includes(k));

        if (found) {
          const [lng, lat, name] = found[1];
          setUserLocation({ lat, lng, city: name, status: 'granted' });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 13 });
          }
        } else {
          setSearchError(`No location found for "${searchQuery}". Please try another city or pincode.`);
        }
      }
} catch (err) {
      console.warn('Geocoding search failed:', err);
      setSearchError('Search service temporarily unavailable. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // 7. Calculate real driving route via backend proxy endpoint (ORS/HeiGIT)
  const handleGetDirections = async () => {
    if (!activePartner) return;
    setIsRouting(true);
    setRouteError(null);

    const startLng = Number(userLocation?.lng ?? 77.4000);
    const startLat = Number(userLocation?.lat ?? 23.2350);
    const endLat = Number(activePartner?.lat ?? activePartner?.latitude ?? 23.2356);
    const endLng = Number(activePartner?.lng ?? activePartner?.longitude ?? 77.4012);

    const straightDist = calculateDistance(startLat, startLng, endLat, endLng);
    const estDuration = Math.round((straightDist / 32) * 60 + 4);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      let finalDistance = straightDist;
      let finalDuration = estDuration;
      let routeGeoJSON = null;

      try {
        const res = await axios.post(`${apiUrl}/api/v1/partners/route`, {
          start_lat: startLat,
          start_lng: startLng,
          end_lat: endLat,
          end_lng: endLng,
        });

        if (res.data?.route_points?.length > 0) {
          finalDistance = res.data.distance_km;
          finalDuration = Math.round(res.data.duration_mins);
          // route_points are [lat, lng] -> MapLibre GeoJSON requires [lng, lat]
          routeGeoJSON = {
            type: 'LineString',
            coordinates: res.data.route_points.map((pt) => [pt[1], pt[0]]),
          };
        }
      } catch (proxyErr) {
        console.warn('Backend route proxy notice, drawing direct path:', proxyErr.message);
      }

      // Fallback straight-line polyline if proxy fails
      if (!routeGeoJSON) {
        routeGeoJSON = {
          type: 'LineString',
          coordinates: [
            [startLng, startLat],
            [(startLng * 2 + endLng) / 3, (startLat * 2 + endLat) / 3],
            [(startLng + endLng * 2) / 3, (startLat + endLat * 2) / 3],
            [endLng, endLat],
          ],
        };
      }

      // Update MapLibre GeoJSON Source
      if (mapInstanceRef.current) {
        const source = mapInstanceRef.current.getSource('route');
        if (source) {
          source.setData({
            type: 'Feature',
            geometry: routeGeoJSON,
          });
        }

        // Fit Bounds to show both start and end with comfortable padding
        const minLng = Math.min(startLng, endLng);
        const maxLng = Math.max(startLng, endLng);
        const minLat = Math.min(startLat, endLat);
        const maxLat = Math.max(startLat, endLat);

        mapInstanceRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: { top: 60, bottom: 180, left: 50, right: 50 },
            maxZoom: 14.5,
            duration: 1000,
          }
        );
      }

      setRouteInfo({
        distanceKm: finalDistance,
        durationMins: finalDuration,
        partnerName: activePartner.name,
      });
    } catch (err) {
      console.error('Failed to get directions:', err);
      setRouteError('Could not calculate driving directions. Showing direct distance.');
    } finally {
      setIsRouting(false);
    }
  };

  // 8. Recenter to user position
  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13,
        speed: 1.2,
      });
    }
  };

  if (mapError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-red-900">Map Loading Issue</h3>
        <p className="text-xs text-red-700 max-w-md mx-auto">{mapError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Reload Map
        </button>
      </div>
    );
  }

  const activeBadge = getPartnerBadge(activePartner?.type || activePartner?.partner_type);
  const activeDistance = activePartner
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        activePartner.lat || activePartner.latitude,
        activePartner.lng || activePartner.longitude
      )
    : 0;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B3B60] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#2563EB]" />
            <span>Interactive Channel Partner Locator</span>
          </h3>
          <p className="text-xs text-[#64748B]">
            Real interactive map with real-time navigation and channelizing agency nodal desks.
          </p>
        </div>

        {/* Live Map Engine Pill */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>MapLibre GL &amp; OpenStreetMap</span>
        </span>
      </div>

      {/* Geolocation Notice (if denied) */}
      {geoErrorMsg && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs text-amber-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{geoErrorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeoErrorMsg(null)}
            className="text-amber-500 hover:text-amber-700 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Map Canvas Wrapper */}
      <div
        className="relative w-full rounded-3xl overflow-hidden border border-[#CBD5E1] shadow-md bg-[#F1F5F9]"
        style={{ height }}
      >
        {/* Real MapLibre GL DOM Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* 1. Floating Search Bar Top Left */}
        <div className="absolute top-3.5 left-3.5 right-14 sm:right-auto sm:w-80 max-w-[calc(100%-60px)] z-10">
          <form onSubmit={handleSearch} className="relative shadow-md rounded-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, area or pincode"
              className="w-full h-10 pl-10 pr-20 bg-white/95 backdrop-blur-md rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-[#0B3B60] focus:ring-2 focus:ring-[#0B3B60]/10"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 min-h-[36px]"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Find</span>}
            </button>
          </form>

          {searchError && (
            <div className="mt-1.5 p-2 bg-red-500/90 text-white rounded-xl text-[11px] font-medium shadow-xs">
              {searchError}
            </div>
          )}
        </div>

        {/* 2. Quick Recenter / Locate Me Button (Top Right under nav controls) */}
        <div className="absolute top-28 right-2.5 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter on your location"
            className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-md flex items-center justify-center text-[#0B3B60] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Live Route Summary Pill (Top Center when route active) */}
        {routeInfo && (
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-10 bg-[#0B3B60]/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 text-xs animate-in slide-in-from-top-4 max-w-[calc(100vw-32px)]">
            <RouteIcon className="w-4 h-4 text-emerald-400" />
            <div className="flex items-center gap-2">
              <span className="font-bold">{routeInfo.distanceKm} km</span>
              <span className="text-white/60">·</span>
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Clock className="w-3 h-3" />
                <span>~{routeInfo.durationMins} mins drive</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setRouteInfo(null);
                if (mapInstanceRef.current) {
                  const source = mapInstanceRef.current.getSource('route');
                  if (source) source.setData({ type: 'FeatureCollection', features: [] });
                }
              }}
              className="text-white/70 hover:text-white ml-1 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 4. Subtle Bottom Sheet / Partner Panel */}
        {activePartner && (
          <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:left-auto sm:right-3.5 sm:w-96 max-w-[calc(100vw-28px)] z-10 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xl space-y-3.5 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  style={{ background: activeBadge.bg, color: activeBadge.text }}
                  className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                >
                  {activePartner.type || activePartner.partner_type || 'Channel Partner'}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[#0B3B60] mt-1 leading-snug">
                  {activePartner.name}
                </h4>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                {activeDistance} km away
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{activePartner.address}</span>
              </p>
              {activePartner.supported_schemes && (
                <p className="text-[11px] text-[#065F46] font-medium pt-0.5">
                  <strong>Schemes:</strong>{' '}
                  {Array.isArray(activePartner.supported_schemes)
                    ? activePartner.supported_schemes.slice(0, 2).join(', ')
                    : activePartner.supported_schemes}
                </p>
              )}
            </div>

            {/* Action Buttons: View Details & Get Directions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onViewDetails && onViewDetails(activePartner)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3B60] font-bold text-xs transition-colors cursor-pointer text-center"
              >
                View Details
              </button>

              <button
                type="button"
                onClick={handleGetDirections}
                disabled={isRouting}
                className="flex-1 py-2 px-3 rounded-xl bg-[#0B3B60] hover:bg-[#07263F] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isRouting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Routing…</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
