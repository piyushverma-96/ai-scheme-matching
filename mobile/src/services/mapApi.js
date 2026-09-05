/**
 * ArthSetu Map API Service
 * ========================
 * All routing and geocoding calls go through the FastAPI backend.
 * The ORS (HeiGIT) API key NEVER leaves the backend — it is not in
 * this file and not in any Expo env var.
 *
 * Backend endpoints used:
 *   POST /api/v1/partners/route    ? HeiGIT driving-car directions (server-side key)
 *   GET  /api/v1/partners/geocode  ? Nominatim geocoding proxy
 *   GET  /api/v1/partners/nearby   ? Ranked partner list
 */

import { apiClient } from './api';

/**
 * Fetch a driving route between two coordinates via the backend proxy.
 * The backend calls HeiGIT (api.heigit.org) using the server-side ORS_API_KEY.
 * If no key is configured, the backend gracefully returns a straight-line
 * Haversine estimate with is_live_routing=false.
 *
 * @param {number} userLat
 * @param {number} userLng
 * @param {number} destLat
 * @param {number} destLng
 * @returns {Promise<{ distance_km: number, duration_mins: number, route_points: [number, number][], is_live_routing: boolean }>}
 */
export async function fetchRoute(userLat, userLng, destLat, destLng) {
  const response = await apiClient.post('/api/v1/partners/route', {
    start_lat: userLat,
    start_lng: userLng,
    end_lat: destLat,
    end_lng: destLng,
  });
  return response.data;
}

/**
 * Geocode a city/area/pincode string via the backend Nominatim proxy.
 * Respects Nominatim's 1-req/sec rate limit (enforced server-side).
 *
 * @param {string} query — e.g. "Bhopal", "462001", "Shyamla Hills"
 * @returns {Promise<{ found: boolean, latitude?: number, longitude?: number, display_name?: string }>}
 */
export async function geocodeQuery(query) {
  const response = await apiClient.get('/api/v1/partners/geocode', {
    params: { query },
  });
  return response.data;
}

/**
 * Fetch ranked nearby partners from the backend.
 * Ranking: scheme compatibility ? partner status ? data confidence ? distance.
 *
 * @param {number|null} lat
 * @param {number|null} lng
 * @param {string|null} city
 * @param {string|null} schemeType
 * @returns {Promise<{ ranked_partners: any[], best_partner: any }>}
 */
export async function fetchNearbyPartners({ lat, lng, city, schemeType } = {}) {
  const params = {};
  if (lat != null) params.latitude = lat;
  if (lng != null) params.longitude = lng;
  if (city) params.city = city;
  if (schemeType) params.scheme_type = schemeType;
  params.limit = 10;

  const response = await apiClient.get('/api/v1/partners/nearby', { params });
  return response.data;
}
