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
import ProgressIndicator from '../components/ProgressIndicator';
import RadioOption from '../components/RadioOption';
import Checkbox from '../components/Checkbox';
import Input from '../components/Input';
import Button from '../components/Button';

export default function FindSchemeScreen() {
  const { navigate, goBack, t, formState, setFormState } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate('processing');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar
        title={t('findSchemeTitle')}
        showBack
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Step Progress */}
        <ProgressIndicator
          currentStep={step}
          totalSteps={totalSteps}
          title={
            step === 1
              ? 'Requirement'
              : step === 2
              ? 'Loan Amount'
              : step === 3
              ? 'Family Income'
              : 'Beneficiary Info'
          }
        />

        {/* STEP 1: Purpose Selection */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('step1Title')}</Text>

            <RadioOption
              selected={formState.purpose === 'business'}
              onSelect={() => setFormState({ ...formState, purpose: 'business' })}
              title={t('purposeBusiness')}
              subtitle={t('purposeBusinessDesc')}
              badge="High Subsidies"
            />

            <RadioOption
              selected={formState.purpose === 'education'}
              onSelect={() => setFormState({ ...formState, purpose: 'education' })}
              title={t('purposeEducation')}
              subtitle={t('purposeEducationDesc')}
              badge="4.0% Interest"
            />

            <RadioOption
              selected={formState.purpose === 'agriculture'}
              onSelect={() => setFormState({ ...formState, purpose: 'agriculture' })}
              title={t('purposeAgriculture')}
              subtitle={t('purposeAgricultureDesc')}
            />

            <RadioOption
              selected={formState.purpose === 'sanitation'}
              onSelect={() => setFormState({ ...formState, purpose: 'sanitation' })}
              title={t('purposeSanitation')}
              subtitle={t('purposeSanitationDesc')}
            />

            {/* Alternative natural language prompt */}
            <TouchableOpacity
              onPress={() => navigate('ai-input')}
              activeOpacity={0.75}
              style={styles.aiAlternativeCard}
            >
              <Text style={styles.aiAlternativeIcon}>💡</Text>
              <View style={styles.aiAlternativeTextCol}>
                <Text style={styles.aiAlternativeTitle}>Prefer to describe in plain words?</Text>
                <Text style={styles.aiAlternativeSub}>Speak or type your requirement in English/Hindi →</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Funding Amount */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('step2Title')}</Text>

            <Input
              label={t('loanAmountLabel')}
              value={formState.loan_amount}
              onChangeText={(text) => {
                const loan = text.replace(/[^0-9]/g, '');
                const cost = loan ? Math.round(Number(loan) / 0.9).toString() : '';
                setFormState({ ...formState, loan_amount: loan, project_cost: cost });
              }}
              placeholder="e.g. 300000"
              keyboardType="number-pad"
              prefix="₹"
              hint="Up to 90% to 100% of project cost is financed under NSFDC schemes."
            />

            <Input
              label={t('projectCostLabel')}
              value={formState.project_cost}
              onChangeText={(text) =>
                setFormState({ ...formState, project_cost: text.replace(/[^0-9]/g, '') })
              }
              placeholder="e.g. 333333"
              keyboardType="number-pad"
              prefix="₹"
              hint="Includes equipment, capital machinery, working capital, or academic fees."
            />

            {/* Quick Amount Suggestion Chips */}
            <View style={styles.chipsSection}>
              <Text style={styles.chipsLabel}>Common Slabs:</Text>
              <View style={styles.chipsRow}>
                {[
                  { label: '₹1 Lakh (Micro)', amount: '100000', cost: '100000' },
                  { label: '₹3 Lakh (Term)', amount: '300000', cost: '333333' },
                  { label: '₹5 Lakh', amount: '500000', cost: '555555' },
                  { label: '₹10 Lakh', amount: '1000000', cost: '1111111' },
                ].map((chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() =>
                      setFormState({
                        ...formState,
                        loan_amount: chip.amount,
                        project_cost: chip.cost,
                      })
                    }
                    activeOpacity={0.7}
                    style={styles.chipButton}
                  >
                    <Text style={styles.chipButtonText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: Annual Family Income */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('step3Title')}</Text>

            <Input
              label={t('familyIncomeLabel')}
              value={formState.annual_family_income}
              onChangeText={(text) =>
                setFormState({
                  ...formState,
                  annual_family_income: text.replace(/[^0-9]/g, ''),
                })
              }
              placeholder="e.g. 300000"
              keyboardType="number-pad"
              prefix="₹"
              hint={t('incomeHint')}
            />

            <View style={styles.incomeNoticeBox}>
              <Text style={styles.noticeIcon}>ℹ️</Text>
              <Text style={styles.noticeText}>
                As per Ministry of Social Justice guidelines, standard welfare subvention schemes apply for annual family incomes up to ₹3,00,000 per annum.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 4: Beneficiary Details */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>{t('step4Title')}</Text>

            <Checkbox
              checked={formState.sc_caste_declared}
              onToggle={() =>
                setFormState({
                  ...formState,
                  sc_caste_declared: !formState.sc_caste_declared,
                })
              }
              title={t('scCasteLabel')}
              subtitle="Required for NSFDC concession eligibility. You will need to produce a valid Tehsildar caste certificate."
            />

            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionLabel}>{t('genderLabel')}</Text>
              <View style={styles.genderRow}>
                {[
                  { id: 'male', label: t('genderMale') },
                  { id: 'female', label: `${t('genderFemale')} (0.5% Rebate)` },
                  { id: 'other', label: t('genderOther') },
                ].map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setFormState({ ...formState, gender: g.id })}
                    activeOpacity={0.7}
                    style={[
                      styles.genderPill,
                      formState.gender === g.id ? styles.genderPillActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        formState.gender === g.id ? styles.genderPillTextActive : null,
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <Input
                label="City / District"
                value={formState.city}
                onChangeText={(city) => setFormState({ ...formState, city })}
                placeholder="e.g. Bhopal"
                hint="Used to locate nearest authorized State Channelizing Agency or bank branch."
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {step > 1 ? (
            <Button
              title={`← ${t('back')}`}
              variant="outline"
              size="lg"
              onPress={handleBack}
              style={{ flex: 1, marginRight: 8 }}
            />
          ) : null}

          <Button
            title={step === totalSteps ? `${t('submit')} & Evaluate →` : `${t('next')} →`}
            variant="primary"
            size="lg"
            onPress={handleNext}
            style={{ flex: 1, marginLeft: step > 1 ? 8 : 0 }}
          />
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  stepContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    marginBottom: 20,
    ...shadows.subtle,
  },
  stepHeading: {
    ...typography.styles.h2,
    color: colors.navy,
    marginBottom: 16,
  },
  aiAlternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.md,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(11, 37, 69, 0.15)',
  },
  aiAlternativeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  aiAlternativeTextCol: {
    flex: 1,
  },
  aiAlternativeTitle: {
    ...typography.styles.captionBold,
    color: colors.navy,
  },
  aiAlternativeSub: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  chipsSection: {
    marginTop: 10,
  },
  chipsLabel: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipButtonText: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  incomeNoticeBox: {
    flexDirection: 'row',
    backgroundColor: colors.infoTint,
    borderRadius: borderRadius.sm,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.infoBorder,
  },
  noticeIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  noticeText: {
    ...typography.styles.caption,
    color: colors.info,
    flex: 1,
    lineHeight: 16,
  },
  sectionLabel: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genderPill: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  genderPillActive: {
    backgroundColor: colors.tealTint,
    borderColor: colors.teal,
  },
  genderPillText: {
    ...typography.styles.captionBold,
    color: colors.textSecondary,
    fontSize: 12,
  },
  genderPillTextActive: {
    color: colors.tealDark,
  },
  buttonRow: {
    flexDirection: 'row',
  },
});
