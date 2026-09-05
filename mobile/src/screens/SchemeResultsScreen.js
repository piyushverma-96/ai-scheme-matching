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
import { borderRadius } from '../theme/borderRadius';
import { useApp, DEMO_SCHEMES } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import SchemeCard from '../components/SchemeCard';
import Button from '../components/Button';

export default function SchemeResultsScreen() {
  const { navigate, setSelectedScheme, formState, t } = useApp();

  // Filter schemes based on selected purpose
  const matchedSchemes = DEMO_SCHEMES.filter((s) => {
    if (formState.purpose === 'education') {
      return s.scheme_type === 'education_loan';
    }
    if (formState.purpose === 'business') {
      const loan = Number(formState.loan_amount || 300000);
      if (loan <= 140000) return s.scheme_type === 'micro_finance' || s.scheme_type === 'term_loan';
      return s.scheme_type === 'term_loan';
    }
    return true;
  });

  const schemesToRender = matchedSchemes.length > 0 ? matchedSchemes : DEMO_SCHEMES;

  const handleSelectScheme = (scheme) => {
    setSelectedScheme(scheme);
    navigate('scheme-details');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('resultsTitle')} showBack onBack={() => navigate('home')} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Summary */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('resultsTitle')}</Text>
          <Text style={styles.subtitle}>{t('resultsSubtitle')}</Text>

          {/* User Parameters Summary Pill */}
          <View style={styles.paramsPill}>
            <Text style={styles.paramsText}>
              👤 Purpose: {formState.purpose.toUpperCase()} · Loan: ₹{Number(formState.loan_amount || 300000).toLocaleString('en-IN')} · Income: ₹{Number(formState.annual_family_income || 300000).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Schemes List */}
        {schemesToRender.map((scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            onPress={() => handleSelectScheme(scheme)}
          />
        ))}

        {/* Refine Search CTA */}
        <View style={styles.refineBox}>
          <Text style={styles.refineTitle}>Need different parameters?</Text>
          <Text style={styles.refineSub}>
            You can modify loan amount, business type, or family income criteria.
          </Text>
          <Button
            title="← Modify Search Parameters"
            variant="outline"
            size="sm"
            onPress={() => navigate('find-scheme')}
            style={{ marginTop: 10 }}
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
  paramsPill: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  paramsText: {
    ...typography.styles.captionBold,
    color: colors.navy,
    fontSize: 11,
  },
  refineBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  refineTitle: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
  },
  refineSub: {
    ...typography.styles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
