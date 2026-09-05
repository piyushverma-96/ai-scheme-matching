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
import Button from '../components/Button';

export default function HelpTrustScreen() {
  const { navigate, goBack, t } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('helpTitle')} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('helpTitle')}</Text>
          <Text style={styles.subtitle}>
            Principles, Rule Engine Authority & Governance Policies
          </Text>
        </View>

        {/* Section 1: How It Works */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏛️ {t('howItWorksTitle')}</Text>
          <Text style={styles.cardBody}>{t('howItWorksDesc')}</Text>
        </View>

        {/* Section 2: Rule Engine Sole Authority */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ {t('ruleEngineTitle')}</Text>
          <Text style={styles.cardBody}>{t('ruleEngineDesc')}</Text>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>
              ✓ Verified against live NSFDC Gazettes (2026-09-05)
            </Text>
          </View>
        </View>

        {/* Section 3: Data Privacy & Protection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔒 Data Privacy & Beneficiary Protection</Text>
          <Text style={styles.cardBody}>
            We do not share your personal financial information with commercial credit bureaus or marketing third parties. Data is utilized strictly to evaluate scheme compatibility and provide direct navigation to authorized state nodal partners.
          </Text>
        </View>

        {/* Section 4: Official Disclaimers (CRITICAL MANDATE) */}
        <View style={[styles.card, styles.disclaimerCard]}>
          <View style={styles.disclaimerHeader}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.disclaimerTitle}>{t('officialDisclaimerTitle')}</Text>
          </View>
          <Text style={styles.disclaimerBody}>{t('officialDisclaimerDesc')}</Text>
        </View>

        {/* FAQ Quick Link */}
        <Button
          title="💬 Ask Assistant a Specific Question →"
          variant="primary"
          size="lg"
          onPress={() => navigate('ai-assistant')}
          style={{ marginTop: 10, marginBottom: 30 }}
        />
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
  header: {
    marginBottom: 16,
  },
  title: {
    ...typography.styles.h1,
    color: colors.navy,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    marginBottom: 14,
    ...shadows.subtle,
  },
  cardTitle: {
    ...typography.styles.h3,
    color: colors.navy,
    marginBottom: 8,
  },
  cardBody: {
    ...typography.styles.body,
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 13,
  },
  verifiedTag: {
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.2)',
  },
  verifiedTagText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
    fontSize: 10,
  },
  disclaimerCard: {
    borderColor: colors.warningBorder,
    backgroundColor: colors.warningTint,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  disclaimerTitle: {
    ...typography.styles.captionBold,
    color: colors.warningDark,
    fontSize: 13,
  },
  disclaimerBody: {
    ...typography.styles.body,
    color: colors.textPrimary,
    lineHeight: 19,
    fontSize: 12,
  },
});
