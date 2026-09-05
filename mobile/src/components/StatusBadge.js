import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';

export default function StatusBadge({
  status = 'Submitted',
  size = 'md', // 'sm' | 'md'
  style,
}) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Draft':
        return {
          bg: colors.backgroundAlt,
          text: colors.textSecondary,
          border: colors.borderStrong,
          label: 'Draft',
        };
      case 'Submitted':
        return {
          bg: colors.infoTint,
          text: colors.info,
          border: colors.infoBorder,
          label: 'Submitted',
        };
      case 'Under Review':
        return {
          bg: colors.warningTint,
          text: colors.warning,
          border: colors.warningBorder,
          label: 'Under Review',
        };
      case 'Documents Required':
        return {
          bg: colors.warningTint,
          text: colors.warningDark,
          border: colors.warningBorder,
          label: 'Documents Required',
        };
      case 'Forwarded to Partner':
      case 'Forwarded':
        return {
          bg: colors.navyTint,
          text: colors.navy,
          border: 'rgba(11, 37, 69, 0.2)',
          label: 'Forwarded to Partner',
        };
      case 'Processing':
        return {
          bg: colors.tealTint,
          text: colors.teal,
          border: 'rgba(14, 102, 85, 0.25)',
          label: 'Processing',
        };
      case 'Approved':
      case 'Sanctioned':
      case 'Decision':
        return {
          bg: colors.successTint,
          text: colors.success,
          border: colors.successBorder,
          label: 'Decision / Sanction',
        };
      case 'Potentially Eligible':
        return {
          bg: colors.successTint,
          text: colors.success,
          border: colors.successBorder,
          label: 'Potentially Eligible',
        };
      case 'Verified Master Data':
        return {
          bg: colors.tealTint,
          text: colors.tealDark,
          border: 'rgba(14, 102, 85, 0.25)',
          label: 'Verified: 2026-09-05',
        };
      default:
        return {
          bg: colors.backgroundAlt,
          text: colors.textSecondary,
          border: colors.borderStrong,
          label: status,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: config.bg, borderColor: config.border },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: config.text },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    ...typography.styles.captionBold,
  },
  textSm: {
    fontSize: 10,
    lineHeight: 13,
  },
  textMd: {
    fontSize: 11,
    lineHeight: 15,
  },
});
