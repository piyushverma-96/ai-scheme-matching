/**
 * UdyamNex — Real Interactive Map Screen (MapLibre + OpenFreeMap OSM tiles)
 * ============================================================================
 * Map library  : @maplibre/maplibre-react-native
 * Tile source  : OpenFreeMap (https://openfreemap.org) — free, no key,
 *                vector tiles from OpenStreetMap, commercial use permitted.
 *                Attribution: © OpenMapTiles | Data from OpenStreetMap
 * Routing      : Backend proxy ? HeiGIT api.heigit.org/openrouteservice/v2/...
 *                ORS_API_KEY lives ONLY in backend/.env, never in this file.
 * Geocoding    : Backend proxy ? Nominatim (respects 1 req/sec rate limit)
 * Location     : expo-location (foreground permission, graceful denial fallback)
 *
 * REQUIRES a custom Development Build (expo-dev-client). Cannot run in Expo Go.
 * Build: npx expo run:android   or   npx expo run:ios
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import { useApp, DEMO_PARTNERS } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import { fetchRoute, geocodeQuery } from '../services/mapApi';

// OpenFreeMap public vector tile style — free, OSM-based, no API key needed.
// License: MIT | Map data: © OpenStreetMap contributors | © OpenMapTiles
// Attribution is handled automatically by MapLibre's built-in control.
const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Default map center (Bhopal, Madhya Pradesh — NSFDC hub)
const DEFAULT_CENTER = [77.4126, 23.2599]; // [lng, lat] for MapLibre
const DEFAULT_ZOOM = 12;

// Suppress missing token warning (we use OpenFreeMap which needs no token)
MapLibreGL.setAccessToken(null);

// -- Helpers ----------------------------------------------------------------

function buildPartnersGeoJSON(partners) {
  return {
    type: 'FeatureCollection',
    features: partners.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
      properties: {
        id: p.id,
        name: p.name,
        type: p.type,
        type_label: p.type_label,
        address: p.address,
        distance_km: p.distance_km,
        status: p.status,
        phone: p.phone,
        supported_schemes: JSON.stringify(p.supported_schemes),
        data_confidence_label: p.data_confidence_label || '',
      },
    })),
  };
}

function buildRouteGeoJSON(routePoints) {
  // routePoints from backend are [[lat, lng], ...] — convert to GeoJSON [lng, lat]
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: routePoints.map(([lat, lng]) => [lng, lat]),
        },
        properties: {},
      },
    ],
  };
}

// -- Main component ----------------------------------------------------------

export default function MapScreen() {
  const { navigate, goBack, screenParams, t } = useApp();
  const mapRef = useRef(null);
  const cameraRef = useRef(null);

  // Initial partner from navigation params, fallback to first partner
  const initialPartner =
    DEMO_PARTNERS.find((p) => p.id === screenParams?.selectedPartnerId) ||
    DEMO_PARTNERS[0];

  // -- State ----------------------------------------------------------------
  const [selectedPartner, setSelectedPartner] = useState(initialPartner);
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude }
  const [locationStatus, setLocationStatus] = useState('loading'); // 'loading' | 'granted' | 'denied' | 'error'
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distance_km, duration_mins, is_live_routing }
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [mapLoadError, setMapLoadError] = useState(false);

  // -- Geolocation on mount ------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationStatus('denied');
          return;
        }
        setLocationStatus('granted');
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        // Pan map to user location
        if (cameraRef.current) {
          cameraRef.current.flyTo([loc.coords.longitude, loc.coords.latitude], 800);
        }
      } catch (err) {
        console.warn('[MapScreen] Location error:', err.message);
        setLocationStatus('error');
      }
    })();
  }, []);

  // -- Fly to selected partner when it changes -----------------------------
  useEffect(() => {
    if (!selectedPartner || !cameraRef.current) return;
    cameraRef.current.flyTo(
      [selectedPartner.longitude, selectedPartner.latitude],
      600
    );
  }, [selectedPartner]);

  // -- Handle marker tap ---------------------------------------------------
  const onMarkerPress = useCallback((event) => {
    try {
      const features = event?.features;
      if (!features || features.length === 0) return;
      const props = features[0].properties;
      if (!props?.id) return;
      const partner = DEMO_PARTNERS.find((p) => p.id === props.id);
      if (partner) {
        setSelectedPartner(partner);
        // Clear any previous route when switching partners
        setRouteGeoJSON(null);
        setRouteInfo(null);
        setRouteError(null);
      }
    } catch (e) {
      console.warn('[MapScreen] Marker tap error:', e.message);
    }
  }, []);

  // -- Get Directions ------------------------------------------------------
  const handleGetDirections = useCallback(async () => {
    if (!selectedPartner) return;

    const originLat = userLocation?.latitude ?? DEFAULT_CENTER[1];
    const originLng = userLocation?.longitude ?? DEFAULT_CENTER[0];

    setIsLoadingRoute(true);
    setRouteError(null);
    setRouteGeoJSON(null);
    setRouteInfo(null);

    try {
      const result = await fetchRoute(
        originLat,
        originLng,
        selectedPartner.latitude,
        selectedPartner.longitude
      );

      setRouteInfo({
        distance_km: result.distance_km,
        duration_mins: result.duration_mins,
        is_live_routing: result.is_live_routing,
      });

      if (result.route_points && result.route_points.length >= 2) {
        setRouteGeoJSON(buildRouteGeoJSON(result.route_points));
        // Fit camera to show full route
        if (cameraRef.current && result.route_points.length > 0) {
          const lngs = result.route_points.map(([, lng]) => lng);
          const lats = result.route_points.map(([lat]) => lat);
          cameraRef.current.fitBounds(
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
            [60, 60, 250, 60]
          );
        }
      }
    } catch (err) {
      console.warn('[MapScreen] Route fetch error:', err?.userFriendlyMessage || err.message);
      setRouteError(
        err?.userFriendlyMessage ||
          'Could not fetch route. Check your internet connection and try again.'
      );
    } finally {
      setIsLoadingRoute(false);
    }
  }, [selectedPartner, userLocation]);

  // -- Search / geocode ----------------------------------------------------
  const handleSearch = useCallback(async () => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const geo = await geocodeQuery(searchText.trim());
      if (geo.found && geo.latitude && geo.longitude) {
        if (cameraRef.current) {
          cameraRef.current.flyTo([geo.longitude, geo.latitude], 600);
        }
        setSearchText('');
      } else {
        setSearchError(`No results for "${searchText}". Try a city or pincode.`);
      }
    } catch (err) {
      setSearchError('Search failed. Check your connection and try again.');
    } finally {
      setIsSearching(false);
    }
  }, [searchText]);

  // -- Formatted duration --------------------------------------------------
  function formatDuration(mins) {
    if (!mins) return '—';
    if (mins < 60) return `${Math.round(mins)} min`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  }

  // -- GeoJSON sources -----------------------------------------------------
  const partnersGeoJSON = buildPartnersGeoJSON(DEMO_PARTNERS);
  const userLocationGeoJSON = userLocation
    ? {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [userLocation.longitude, userLocation.latitude],
            },
            properties: {},
          },
        ],
      }
    : null;

  // -- Map error fallback --------------------------------------------------
  if (mapLoadError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <NavigationBar title={t('mapViewTitle')} showBack onBack={goBack} />
        <View style={styles.errorScreen}>
          <Text style={styles.errorIcon}>???</Text>
          <Text style={styles.errorTitle}>Map could not be loaded</Text>
          <Text style={styles.errorSub}>
            Please check your internet connection and try again.
          </Text>
          <Button
            title="Retry"
            variant="primary"
            size="md"
            onPress={() => setMapLoadError(false)}
            style={{ marginTop: 16 }}
          />
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  // -- Render ---------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('mapViewTitle')} showBack onBack={goBack} />

      <View style={styles.container}>
        {/* -- Map Container -- */}
        <View style={styles.mapWrapper}>
          <MapLibreGL.MapView
            ref={mapRef}
            style={styles.map}
            styleURL={OPENFREEMAP_STYLE_URL}
            logoEnabled={false}
            attributionEnabled={true}
            attributionPosition={{ bottom: 8, right: 8 }}
            onDidFailLoadingMap={() => setMapLoadError(true)}
          >
            {/* Camera */}
            <MapLibreGL.Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate: DEFAULT_CENTER,
                zoomLevel: DEFAULT_ZOOM,
              }}
              animationMode="flyTo"
              animationDuration={600}
            />

            {/* Partner markers */}
            <MapLibreGL.ShapeSource
              id="partnersSource"
              shape={partnersGeoJSON}
              onPress={onMarkerPress}
            >
              {/* Unselected marker circle */}
              <MapLibreGL.CircleLayer
                id="partnerCircles"
                filter={['!=', ['get', 'id'], selectedPartner?.id ?? '']}
                style={{
                  circleRadius: 14,
                  circleColor: colors.surface,
                  circleStrokeWidth: 2.5,
                  circleStrokeColor: colors.teal,
                  circleSortKey: 1,
                }}
              />
              {/* Selected marker circle */}
              <MapLibreGL.CircleLayer
                id="partnerCircleSelected"
                filter={['==', ['get', 'id'], selectedPartner?.id ?? '']}
                style={{
                  circleRadius: 18,
                  circleColor: colors.teal,
                  circleStrokeWidth: 3,
                  circleStrokeColor: colors.white,
                  circleSortKey: 2,
                }}
              />
              {/* Partner type emoji labels */}
              <MapLibreGL.SymbolLayer
                id="partnerLabels"
                style={{
                  textField: [
                    'case',
                    ['==', ['get', 'type'], 'SCA'], '??',
                    ['==', ['get', 'type'], 'PSB'], '??',
                    '??',
                  ],
                  textSize: 14,
                  textAllowOverlap: true,
                  textIgnorePlacement: true,
                  symbolSortKey: 3,
                }}
              />
              {/* Distance callout label */}
              <MapLibreGL.SymbolLayer
                id="partnerDistanceLabel"
                style={{
                  textField: ['concat', ['to-string', ['get', 'distance_km']], ' km'],
                  textSize: 10,
                  textColor: colors.navy,
                  textOffset: [0, 2.2],
                  textAnchor: 'top',
                  textAllowOverlap: false,
                  textFont: ['Open Sans Semibold'],
                  textHaloColor: colors.white,
                  textHaloWidth: 1.5,
                }}
              />
            </MapLibreGL.ShapeSource>

            {/* User location dot */}
            {userLocationGeoJSON && (
              <MapLibreGL.ShapeSource id="userSource" shape={userLocationGeoJSON}>
                <MapLibreGL.CircleLayer
                  id="userDotOuter"
                  style={{
                    circleRadius: 14,
                    circleColor: 'rgba(2, 132, 199, 0.15)',
                  }}
                />
                <MapLibreGL.CircleLayer
                  id="userDot"
                  style={{
                    circleRadius: 7,
                    circleColor: '#0284C7',
                    circleStrokeWidth: 2.5,
                    circleStrokeColor: colors.white,
                  }}
                />
              </MapLibreGL.ShapeSource>
            )}

            {/* Route line */}
            {routeGeoJSON && (
              <MapLibreGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
                <MapLibreGL.LineLayer
                  id="routeLine"
                  style={{
                    lineColor: colors.teal,
                    lineWidth: 4,
                    lineCap: 'round',
                    lineJoin: 'round',
                    lineOpacity: 0.85,
                  }}
                />
                {/* Route casing for contrast */}
                <MapLibreGL.LineLayer
                  id="routeLineCasing"
                  belowLayerID="routeLine"
                  style={{
                    lineColor: colors.white,
                    lineWidth: 7,
                    lineCap: 'round',
                    lineJoin: 'round',
                    lineOpacity: 0.6,
                  }}
                />
              </MapLibreGL.ShapeSource>
            )}
          </MapLibreGL.MapView>

          {/* -- Floating Search Bar -- */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, area or pincode"
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator
                size="small"
                color={colors.teal}
                style={styles.searchIcon}
              />
            ) : (
              <TouchableOpacity
                onPress={handleSearch}
                activeOpacity={0.7}
                style={styles.searchButton}
              >
                <Text style={styles.searchButtonText}>??</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search error */}
          {searchError ? (
            <View style={styles.searchErrorBanner}>
              <Text style={styles.searchErrorText}>{searchError}</Text>
              <TouchableOpacity onPress={() => setSearchError(null)}>
                <Text style={styles.bannerDismiss}>?</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Location denied banner */}
          {locationStatus === 'denied' && (
            <View style={styles.locationDeniedBanner}>
              <Text style={styles.locationDeniedText}>
                ?? Location access unavailable. Search by city or pincode above.
              </Text>
            </View>
          )}

          {/* Route error banner */}
          {routeError ? (
            <View style={styles.routeErrorBanner}>
              <Text style={styles.routeErrorText}>?? {routeError}</Text>
              <TouchableOpacity onPress={() => setRouteError(null)}>
                <Text style={styles.bannerDismiss}>?</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Zoom controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (cameraRef.current) {
                  cameraRef.current.zoomTo(
                    (cameraRef.current.state?.zoom ?? DEFAULT_ZOOM) + 1,
                    300
                  );
                }
              }}
            >
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (cameraRef.current) {
                  cameraRef.current.zoomTo(
                    Math.max(5, (cameraRef.current.state?.zoom ?? DEFAULT_ZOOM) - 1),
                    300
                  );
                }
              }}
            >
              <Text style={styles.zoomBtnText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Recenter button */}
          {userLocation && (
            <TouchableOpacity
              style={styles.recenterBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (cameraRef.current && userLocation) {
                  cameraRef.current.flyTo(
                    [userLocation.longitude, userLocation.latitude],
                    600
                  );
                }
              }}
            >
              <Text style={styles.recenterIcon}>?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* -- Bottom Sheet Partner Panel -- */}
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          {/* Partner header */}
          <View style={styles.sheetHeader}>
            <View style={styles.partnerTypeBadge}>
              <Text style={styles.partnerTypeBadgeText}>{selectedPartner.type}</Text>
            </View>
            <View style={styles.operationalBadge}>
              <Text style={styles.operationalText}>{selectedPartner.status}</Text>
            </View>
          </View>

          <Text style={styles.sheetTitle} numberOfLines={2}>
            {selectedPartner.name}
          </Text>
          <Text style={styles.sheetType}>{selectedPartner.type_label}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoItem}>
              ?? {selectedPartner.distance_km} km away
            </Text>
            {routeInfo && (
              <Text style={styles.infoItem}>
                ?? {formatDuration(routeInfo.duration_mins)}
                {!routeInfo.is_live_routing ? ' (est.)' : ''}
              </Text>
            )}
          </View>

          <Text style={styles.sheetAddress} numberOfLines={2}>
            {selectedPartner.address}
          </Text>

          {/* Route info bar */}
          {routeInfo && (
            <View style={styles.routeInfoBar}>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoValue}>
                  {routeInfo.distance_km.toFixed(1)} km
                </Text>
                <Text style={styles.routeInfoLabel}>Distance</Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoValue}>
                  {formatDuration(routeInfo.duration_mins)}
                </Text>
                <Text style={styles.routeInfoLabel}>Est. Time</Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Text
                  style={[
                    styles.routeInfoValue,
                    { color: routeInfo.is_live_routing ? colors.success : colors.amber },
                  ]}
                >
                  {routeInfo.is_live_routing ? 'Live' : 'Est.'}
                </Text>
                <Text style={styles.routeInfoLabel}>Routing</Text>
              </View>
            </View>
          )}

          {/* DEMO label */}
          {selectedPartner.data_confidence_label ? (
            <View style={styles.demoLabel}>
              <Text style={styles.demoLabelText}>
                ?? {selectedPartner.data_confidence_label}
              </Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Button
              title={isLoadingRoute ? '? Routing...' : '?? Get Directions'}
              variant="primary"
              size="md"
              onPress={handleGetDirections}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="?? Documents"
              variant="secondary"
              size="md"
              onPress={() => navigate('documents')}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>

          {/* Partner switcher pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.partnerSwitcher}
            contentContainerStyle={styles.partnerSwitcherContent}
          >
            {DEMO_PARTNERS.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  setSelectedPartner(p);
                  setRouteGeoJSON(null);
                  setRouteInfo(null);
                  setRouteError(null);
                }}
                activeOpacity={0.7}
                style={[
                  styles.partnerPill,
                  selectedPartner.id === p.id ? styles.partnerPillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.partnerPillText,
                    selectedPartner.id === p.id ? styles.partnerPillTextActive : null,
                  ]}
                  numberOfLines={1}
                >
                  {p.type === 'SCA' ? '?? ' : p.type === 'PSB' ? '?? ' : '?? '}
                  {p.name.split(' ').slice(0, 3).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

// -- Styles ------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },

  // Map
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Search bar (floating)
  searchBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...shadows.modal,
  },
  searchInput: {
    flex: 1,
    ...typography.styles.body,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    fontSize: 14,
  },
  searchIcon: {
    marginLeft: 6,
  },
  searchButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  searchButtonText: {
    fontSize: 16,
  },

  // Banners
  searchErrorBanner: {
    position: 'absolute',
    top: 68,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningTint,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadows.subtle,
  },
  searchErrorText: {
    flex: 1,
    ...typography.styles.caption,
    color: colors.amber,
    fontSize: 12,
  },
  locationDeniedBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: colors.infoTint,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadows.subtle,
  },
  locationDeniedText: {
    ...typography.styles.caption,
    color: colors.info,
    fontSize: 12,
    textAlign: 'center',
  },
  routeErrorBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorTint,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadows.subtle,
  },
  routeErrorText: {
    flex: 1,
    ...typography.styles.caption,
    color: colors.error,
    fontSize: 12,
  },
  bannerDismiss: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
    paddingLeft: 8,
    fontSize: 14,
  },

  // Zoom controls
  zoomControls: {
    position: 'absolute',
    right: 12,
    bottom: 70,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    ...shadows.card,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    fontSize: 20,
    color: colors.navy,
    fontWeight: '300',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  // Recenter button
  recenterBtn: {
    position: 'absolute',
    right: 12,
    bottom: 155,
    width: 36,
    height: 36,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  recenterIcon: {
    fontSize: 18,
    color: '#0284C7',
  },

  // Error screen
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    ...typography.styles.h2,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSub: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Bottom sheet
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderTopWidth: 1.2,
    borderColor: colors.borderStrong,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    ...shadows.modal,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  partnerTypeBadge: {
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(11,37,69,0.15)',
  },
  partnerTypeBadgeText: {
    ...typography.styles.captionBold,
    color: colors.navy,
    fontSize: 10,
  },
  operationalBadge: {
    backgroundColor: colors.successTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  operationalText: {
    ...typography.styles.captionBold,
    color: colors.success,
    fontSize: 10,
  },
  sheetTitle: {
    ...typography.styles.h3,
    color: colors.navy,
    lineHeight: 20,
  },
  sheetType: {
    ...typography.styles.caption,
    color: colors.tealDark,
    marginTop: 1,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 2,
  },
  infoItem: {
    ...typography.styles.captionBold,
    color: colors.textSecondary,
    fontSize: 12,
  },
  sheetAddress: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },

  // Route info bar
  routeInfoBar: {
    flexDirection: 'row',
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(14,102,85,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  routeInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  routeInfoValue: {
    ...typography.styles.bodyBold,
    color: colors.tealDark,
    fontSize: 14,
  },
  routeInfoLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  routeInfoDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(14,102,85,0.2)',
  },

  // DEMO label
  demoLabel: {
    backgroundColor: colors.warningTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  demoLabelText: {
    ...typography.styles.caption,
    color: colors.amber,
    fontSize: 10,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  // Partner switcher
  partnerSwitcher: {
    marginBottom: 4,
  },
  partnerSwitcherContent: {
    gap: 6,
    paddingRight: 4,
  },
  partnerPill: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 180,
  },
  partnerPillActive: {
    backgroundColor: colors.tealTint,
    borderColor: colors.teal,
  },
  partnerPillText: {
    ...typography.styles.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  partnerPillTextActive: {
    color: colors.tealDark,
  },
});
