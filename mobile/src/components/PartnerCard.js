import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';

export default function PartnerCard({
  partner,
  onViewOnMap,
  onGetDirections,
  style,
}) {
  if (!partner) return null;

  const getTypeBadgeStyle = () => {
    switch (partner.type) {
      case 'SCA':
        return { bg: colors.tealTint, text: colors.tealDark, label: 'State Channelizing Agency' };
      case 'PSB':
        return { bg: colors.navyTint, text: colors.navy, label: 'Public Sector Bank' };
      case 'RRB':
        return { bg: colors.infoTint, text: colors.info, label: 'Regional Rural Bank' };
      default:
        return { bg: colors.backgroundAlt, text: colors.textSecondary, label: partner.type };
    }
  };

  const badge = getTypeBadgeStyle();

  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.name}>{partner.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.typeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {partner.distance_km != null ? (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {partner.distance_km} km
            </Text>
          </View>
        ) : null}
      </View>

      {/* Address */}
      <View style={styles.infoRow}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.addressText} numberOfLines={2}>
          {partner.address}
        </Text>
      </View>

      {/* Contact Person */}
      {partner.contact_person || partner.phone ? (
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📞</Text>
          <Text style={styles.contactText}>
            {partner.contact_person ? `${partner.contact_person} · ` : ''}
            {partner.phone}
          </Text>
        </View>
      ) : null}

      {/* Supported Schemes Chips */}
      {partner.supported_schemes && partner.supported_schemes.length > 0 ? (
        <View style={styles.schemesWrapper}>
          <Text style={styles.schemesLabel}>Supported Schemes:</Text>
          <View style={styles.chipsRow}>
            {partner.supported_schemes.map((schemeName, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{schemeName}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {onViewOnMap ? (
          <TouchableOpacity
            onPress={onViewOnMap}
            activeOpacity={0.7}
            style={styles.mapButton}
          >
            <Text style={styles.mapButtonText}>🗺️ View on Map</Text>
          </TouchableOpacity>
        ) : null}

        {onGetDirections ? (
          <TouchableOpacity
            onPress={onGetDirections}
            activeOpacity={0.7}
            style={styles.directionsButton}
          >
            <Text style={styles.directionsButtonText}>🧭 Get Directions</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 16,
    marginBottom: 14,
    ...shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    ...typography.styles.h3,
    color: colors.navy,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  typeText: {
    ...typography.styles.captionBold,
    fontSize: 10,
  },
  distanceBadge: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
  },
  icon: {
    fontSize: 12,
    marginRight: 6,
    marginTop: 2,
  },
  addressText: {
    ...typography.styles.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    flex: 1,
  },
  contactText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  schemesWrapper: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  schemesLabel: {
    ...typography.styles.captionBold,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.styles.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  mapButton: {
    flex: 1,
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(11, 37, 69, 0.15)',
  },
  mapButtonText: {
    ...typography.styles.captionBold,
    color: colors.navy,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 6,
  },
  directionsButtonText: {
    ...typography.styles.captionBold,
    color: colors.white,
  },
});
