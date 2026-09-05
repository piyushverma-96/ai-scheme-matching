import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import StatusBadge from './StatusBadge';

export default function SchemeCard({
  scheme,
  onPress,
  isSaved = false,
  onToggleSave,
  showWhyMatches = true,
  style,
}) {
  if (!scheme) return null;

  const formatAmount = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    return `₹${Number(num).toLocaleString('en-IN')}`;
  };

  return (
    <View style={[styles.card, style]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{scheme.name}</Text>
          <Text style={styles.issuingBody}>{scheme.issuing_body}</Text>
        </View>

        <StatusBadge status="Potentially Eligible" size="sm" />
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {scheme.short_description}
      </Text>

      {/* Financial Parameters Matrix */}
      <View style={styles.matrixContainer}>
        <View style={styles.matrixCol}>
          <Text style={styles.matrixLabel}>Interest Rate</Text>
          <Text style={styles.matrixValue}>
            {scheme.rate_beneficiary_min === scheme.rate_beneficiary_max
              ? `${scheme.rate_beneficiary_min}% p.a.`
              : `${scheme.rate_beneficiary_min}% - ${scheme.rate_beneficiary_max}% p.a.`}
          </Text>
        </View>

        <View style={styles.matrixDivider} />

        <View style={styles.matrixCol}>
          <Text style={styles.matrixLabel}>Max Loan Limit</Text>
          <Text style={styles.matrixValue}>
            {formatAmount(scheme.max_loan_amount)}
          </Text>
        </View>

        <View style={styles.matrixDivider} />

        <View style={styles.matrixCol}>
          <Text style={styles.matrixLabel}>Max Tenure</Text>
          <Text style={styles.matrixValue}>
            {scheme.repayment_years_max} Years
          </Text>
        </View>
      </View>

      {/* Why This Matches Section */}
      {showWhyMatches && scheme.why_matches && scheme.why_matches.length > 0 ? (
        <View style={styles.whyMatchesContainer}>
          <Text style={styles.whyMatchesTitle}>Criteria Met:</Text>
          {scheme.why_matches.slice(0, 3).map((factor, idx) => (
            <View key={idx} style={styles.factorRow}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.factorText}>{factor}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Action Footer */}
      <View style={styles.footerRow}>
        <View style={styles.verifiedTag}>
          <Text style={styles.verifiedText}>Verified: {scheme.last_verified_at || '2026-09-05'}</Text>
        </View>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.75}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>View Scheme →</Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    ...typography.styles.h3,
    color: colors.navy,
  },
  issuingBody: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  description: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  matrixContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  matrixCol: {
    flex: 1,
    alignItems: 'center',
  },
  matrixDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: '80%',
    alignSelf: 'center',
  },
  matrixLabel: {
    ...typography.styles.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  matrixValue: {
    ...typography.styles.captionBold,
    color: colors.navy,
    fontSize: 12,
  },
  whyMatchesContainer: {
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.sm,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.15)',
  },
  whyMatchesTitle: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
    marginBottom: 4,
    fontSize: 11,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  checkIcon: {
    color: colors.tealDark,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  factorText: {
    ...typography.styles.caption,
    color: colors.tealDark,
    flex: 1,
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  verifiedTag: {
    paddingVertical: 2,
  },
  verifiedText: {
    ...typography.styles.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  ctaButton: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  ctaButtonText: {
    ...typography.styles.captionBold,
    color: colors.white,
  },
});
