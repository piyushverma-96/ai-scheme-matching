import React, { useState } from 'react';
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
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';

export default function DocumentChecklistScreen() {
  const { navigate, goBack, selectedScheme, t } = useApp();

  const [docsState, setDocsState] = useState({
    aadhaar: true,
    caste: true,
    income: true,
    dpr: false,
    bank: true,
  });

  const toggleDoc = (key) => {
    setDocsState({ ...docsState, [key]: !docsState[key] });
  };

  const checkedCount = Object.values(docsState).filter(Boolean).length;
  const totalDocs = Object.keys(docsState).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('docsTitle')} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('docsTitle')}</Text>
          <Text style={styles.subtitle}>{t('docsSubtitle')}</Text>

          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>
              📁 Readiness: {checkedCount} of {totalDocs} Documents Ready
            </Text>
          </View>
        </View>

        {/* Document Checklist Items */}
        <View style={styles.listSection}>
          <Checkbox
            checked={docsState.aadhaar}
            onToggle={() => toggleDoc('aadhaar')}
            title={t('docAadhaar')}
            subtitle={t('docAadhaarDesc')}
          />

          <Checkbox
            checked={docsState.caste}
            onToggle={() => toggleDoc('caste')}
            title={t('docCaste')}
            subtitle={t('docCasteDesc')}
          />

          <Checkbox
            checked={docsState.income}
            onToggle={() => toggleDoc('income')}
            title={t('docIncome')}
            subtitle={t('docIncomeDesc')}
          />

          <Checkbox
            checked={docsState.dpr}
            onToggle={() => toggleDoc('dpr')}
            title={t('docProject')}
            subtitle={t('docProjectDesc')}
          />

          <Checkbox
            checked={docsState.bank}
            onToggle={() => toggleDoc('bank')}
            title={t('docBank')}
            subtitle={t('docBankDesc')}
          />
        </View>

        {/* Verification Note */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={styles.disclaimerText}>
            {t('docsDisclaimerNote')}
          </Text>
        </View>

        {/* Actions */}
        <Button
          title="🚀 Generate Application Packet & Track →"
          variant="primary"
          size="lg"
          onPress={() => navigate('tracking')}
          style={{ marginTop: 16, marginBottom: 24 }}
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
  progressPill: {
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.2)',
  },
  progressPillText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
    fontSize: 11,
  },
  listSection: {
    marginBottom: 10,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 12,
    marginTop: 6,
  },
  disclaimerIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  disclaimerText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
});
