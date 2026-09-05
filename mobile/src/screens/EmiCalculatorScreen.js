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
import Input from '../components/Input';
import Button from '../components/Button';

export default function EmiCalculatorScreen() {
  const { navigate, goBack, selectedScheme, formState, t } = useApp();

  const defaultLoan = formState.loan_amount || (selectedScheme ? selectedScheme.max_loan_amount : 300000);
  const defaultRate = selectedScheme ? selectedScheme.rate_beneficiary_min : 7.0;
  const defaultTenure = selectedScheme ? Math.min(selectedScheme.repayment_years_max, 7) : 5;

  const [loanAmount, setLoanAmount] = useState(defaultLoan.toString());
  const [interestRate, setInterestRate] = useState(defaultRate.toString());
  const [tenureYears, setTenureYears] = useState(defaultTenure.toString());
  const [moratoriumMonths, setMoratoriumMonths] = useState('6');

  // Mathematical EMI Calculation Core
  const P = Number(loanAmount) || 0;
  const r = (Number(interestRate) || 0) / 12 / 100;
  const n = (Number(tenureYears) || 1) * 12;

  let emi = 0;
  if (P > 0 && r > 0 && n > 0) {
    emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  } else if (P > 0 && n > 0) {
    emi = Math.round(P / n);
  }

  const totalRepayment = emi * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  // Commercial Benchmark (13.0% Commercial MSME Loan)
  const rCommercial = 13.0 / 12 / 100;
  let commercialEmi = 0;
  if (P > 0 && rCommercial > 0 && n > 0) {
    commercialEmi = Math.round((P * rCommercial * Math.pow(1 + rCommercial, n)) / (Math.pow(1 + rCommercial, n) - 1));
  }
  const commercialTotalInterest = Math.max(0, commercialEmi * n - P);
  const savings = Math.max(0, commercialTotalInterest - totalInterest);

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('emiTitle')} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('emiTitle')}</Text>
          <Text style={styles.subtitle}>{t('emiSubtitle')}</Text>
        </View>

        {/* Inputs Card */}
        <View style={styles.card}>
          <Input
            label={t('loanAmountInput')}
            value={loanAmount}
            onChangeText={(t) => setLoanAmount(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            prefix="₹"
          />

          <View style={styles.twoColRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Input
                label={t('interestRateInput')}
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="decimal-pad"
                suffix="%"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Input
                label={t('tenureYearsInput')}
                value={tenureYears}
                onChangeText={(t) => setTenureYears(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                suffix="Yrs"
              />
            </View>
          </View>

          {/* Quick Tenure Buttons */}
          <View style={styles.tenurePillRow}>
            <Text style={styles.tenureLabel}>Quick Tenure:</Text>
            {['3', '5', '7', '10'].map((yr) => (
              <TouchableOpacity
                key={yr}
                onPress={() => setTenureYears(yr)}
                activeOpacity={0.7}
                style={[
                  styles.tenurePill,
                  tenureYears === yr ? styles.tenurePillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.tenurePillText,
                    tenureYears === yr ? styles.tenurePillTextActive : null,
                  ]}
                >
                  {yr} Yrs
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Output Financial Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Repayment Calculation Breakdown</Text>

          <View style={styles.emiHighlightBox}>
            <Text style={styles.emiLabel}>{t('monthlyEmiOutput')}</Text>
            <Text style={styles.emiValue}>₹{emi.toLocaleString('en-IN')} / mo</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Principal Borrowed:</Text>
            <Text style={styles.summaryValue}>₹{P.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('totalInterestOutput')}:</Text>
            <Text style={styles.summaryValue}>₹{totalInterest.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('totalRepaymentOutput')}:</Text>
            <Text style={[styles.summaryValue, { color: colors.navy }]}>
              ₹{totalRepayment.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Government Subvention Savings Banner */}
        {savings > 0 ? (
          <View style={styles.savingsBanner}>
            <View style={styles.savingsHeader}>
              <Text style={styles.savingsIcon}>🛡️</Text>
              <Text style={styles.savingsTitle}>{t('subventionSavingsBanner')}</Text>
            </View>
            <Text style={styles.savingsDesc}>
              {t('subventionSavingsDesc', {
                rate: interestRate,
                savings: savings.toLocaleString('en-IN'),
              })}
            </Text>
          </View>
        ) : null}

        {/* Disclaimer */}
        <Text style={styles.disclaimerText}>
          {t('estimatedDisclaimer')}
        </Text>

        {/* Action */}
        <Button
          title="🏛️ Find Authorized Partner Agency →"
          variant="primary"
          size="lg"
          onPress={() => navigate('partner-finder')}
          style={{ marginTop: 14, marginBottom: 20 }}
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
  twoColRow: {
    flexDirection: 'row',
  },
  tenurePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tenureLabel: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
    fontSize: 11,
    marginRight: 8,
  },
  tenurePill: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  tenurePillActive: {
    backgroundColor: colors.tealTint,
    borderColor: colors.teal,
  },
  tenurePillText: {
    ...typography.styles.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  tenurePillTextActive: {
    color: colors.tealDark,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    marginBottom: 14,
    ...shadows.subtle,
  },
  summaryTitle: {
    ...typography.styles.captionBold,
    color: colors.navy,
    marginBottom: 10,
  },
  emiHighlightBox: {
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(11, 37, 69, 0.15)',
  },
  emiLabel: {
    ...typography.styles.caption,
    color: colors.navy,
    fontSize: 11,
  },
  emiValue: {
    ...typography.styles.h1,
    color: colors.navy,
    fontSize: 24,
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    ...typography.styles.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    ...typography.styles.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  savingsBanner: {
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.25)',
    padding: 14,
    marginBottom: 14,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  savingsIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  savingsTitle: {
    ...typography.styles.bodyBold,
    color: colors.tealDark,
  },
  savingsDesc: {
    ...typography.styles.caption,
    color: colors.tealDark,
    lineHeight: 16,
  },
  disclaimerText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 4,
  },
});
