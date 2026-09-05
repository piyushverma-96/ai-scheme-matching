import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import { useApp } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export default function SchemeDetailsScreen() {
  const { selectedScheme, navigate, goBack, t, isSaved, toggleSaveScheme } = useApp();
  const scheme = selectedScheme;

  if (!scheme) return null;

  const formatAmount = (num) => {
    if (!num) return 'N/A';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
    return `₹${Number(num).toLocaleString('en-IN')}`;
  };

  const saved = isSaved(scheme.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={scheme.name} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <StatusBadge status="Potentially Eligible" />
            <StatusBadge status="Verified Master Data" style={{ marginLeft: 6 }} />
          </View>

          <Text style={styles.schemeName}>{scheme.name}</Text>
          <Text style={styles.issuingBody}>{scheme.issuing_body}</Text>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Max Loan</Text>
              <Text style={styles.metricValue}>{formatAmount(scheme.max_loan_amount)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Interest Rate</Text>
              <Text style={styles.metricValue}>{scheme.rate_beneficiary_min}% - {scheme.rate_beneficiary_max}%</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Max Tenure</Text>
              <Text style={styles.metricValue}>{scheme.repayment_years_max} Yrs</Text>
            </View>
          </View>
        </View>

        {/* Section 1: About Scheme */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('aboutSchemeTitle')}</Text>
          <Text style={styles.bodyText}>{scheme.short_description}</Text>
          <Text style={[styles.bodyText, { marginTop: 8 }]}>
            Financing quantum: Up to {scheme.financing_pct}% of total project cost. Margin money requirement is kept minimal for SC beneficiaries.
          </Text>
        </View>

        {/* Section 2: Financial Terms & Repayment */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('financialTermsTitle')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest Slabs:</Text>
            <Text style={styles.detailValue}>{scheme.rate_note || `${scheme.rate_beneficiary_min}% p.a.`}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Moratorium Period:</Text>
            <Text style={styles.detailValue}>{scheme.moratorium_note || `${scheme.moratorium_months} Months`}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Repayment Terms:</Text>
            <Text style={styles.detailValue}>{scheme.repayment_note || 'Quarterly instalments'}</Text>
          </View>
        </View>

        {/* Section 3: Eligibility Criteria */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('whoCanApplyTitle')}</Text>

          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Beneficiary must belong to the Scheduled Caste (SC) community with valid certificate.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Annual family income must be up to ₹{Number(scheme.max_income_eligibility).toLocaleString('en-IN')} per annum.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Applicant must possess requisite experience, vocational skill, or training in the proposed enterprise.
            </Text>
          </View>
        </View>

        {/* Section 4: Required Documents Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('requiredDocsSummary')}</Text>
          <Text style={styles.bodyText}>
            Aadhaar Card, SC Caste Certificate, Annual Income Certificate, Detailed Project Report (DPR), and Bank Passbook.
          </Text>
          <TouchableOpacity
            onPress={() => navigate('documents')}
            activeOpacity={0.7}
            style={styles.docsLink}
          >
            <Text style={styles.docsLinkText}>View Master Document Checklist →</Text>
          </TouchableOpacity>
        </View>

        {/* Section 5: Official Verification Source */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('sourceVerificationTitle')}</Text>
          <Text style={styles.sourceText}>🏛️ {t('nodalBody')}</Text>
          <Text style={styles.sourceText}>📅 {t('verifiedOn')}: {scheme.last_verified_at || '2026-09-05'}</Text>
          <Text style={styles.sourceUrl}>🔗 Source: {scheme.source_url}</Text>
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title={`🧮 ${t('calculateRepayment')}`}
            variant="primary"
            size="lg"
            onPress={() => navigate('emi-calculator')}
            style={styles.actionBtn}
          />

          <Button
            title={`🏛️ ${t('findPartnerForSchemeCTA')}`}
            variant="secondary"
            size="lg"
            onPress={() => navigate('partner-finder')}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    marginBottom: 14,
    ...shadows.subtle,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  schemeName: {
    ...typography.styles.h1,
    color: colors.navy,
  },
  issuingBody: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: '80%',
    alignSelf: 'center',
  },
  metricLabel: {
    ...typography.styles.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    ...typography.styles.captionBold,
    color: colors.navy,
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 16,
    marginBottom: 12,
    ...shadows.subtle,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.navy,
    marginBottom: 8,
  },
  bodyText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  detailRow: {
    marginVertical: 4,
  },
  detailLabel: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
  },
  detailValue: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  bullet: {
    color: colors.teal,
    marginRight: 8,
    fontSize: 16,
    lineHeight: 18,
  },
  bulletText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  docsLink: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  docsLinkText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
  },
  sourceText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  sourceUrl: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  actionContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  actionBtn: {
    marginBottom: 10,
  },
});
