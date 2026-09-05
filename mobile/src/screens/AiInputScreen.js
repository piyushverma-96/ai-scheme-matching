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
import Input from '../components/Input';
import Button from '../components/Button';

export default function AiInputScreen() {
  const { navigate, goBack, t, formState, setFormState } = useApp();
  const [naturalText, setNaturalText] = useState(
    'Mujhe Bhopal me small business/dairy farm ke liye 3 lakh loan chahiye, family income 3 lakh hai.'
  );

  const exampleChips = [
    '₹3L for dairy farm in Bhopal (Income ₹3L)',
    '₹10L education loan for B.Tech in India',
    '₹1.4L for small tailoring & grocery shop',
  ];

  const handleUnderstand = () => {
    // Deterministic parsing / state update based on sample input
    if (naturalText.toLowerCase().includes('education') || naturalText.toLowerCase().includes('b.tech')) {
      setFormState({
        ...formState,
        purpose: 'education',
        loan_amount: '1000000',
        project_cost: '1111111',
        annual_family_income: '300000',
      });
    } else if (naturalText.toLowerCase().includes('1.4') || naturalText.toLowerCase().includes('micro')) {
      setFormState({
        ...formState,
        purpose: 'business',
        loan_amount: '140000',
        project_cost: '140000',
        annual_family_income: '200000',
      });
    } else {
      setFormState({
        ...formState,
        purpose: 'business',
        loan_amount: '300000',
        project_cost: '333333',
        annual_family_income: '300000',
        city: 'Bhopal',
      });
    }

    navigate('processing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('aiInputTitle')} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner */}
        <View style={styles.card}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>🤖 AI Requirement Assistant</Text>
          </View>

          <Text style={styles.title}>{t('aiInputTitle')}</Text>
          <Text style={styles.subtitle}>{t('aiInputSubtitle')}</Text>

          {/* Text Area */}
          <Input
            value={naturalText}
            onChangeText={setNaturalText}
            placeholder={t('aiInputPlaceholder')}
            multiline
            numberOfLines={4}
            style={{ marginTop: 12 }}
          />

          {/* Suggested Example Chips */}
          <Text style={styles.examplesLabel}>Sample Requirements (Tap to try):</Text>
          <View style={styles.chipsContainer}>
            {exampleChips.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setNaturalText(chip)}
                activeOpacity={0.7}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Disclaimer */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              ℹ️ {t('aiAssistNotice')}
            </Text>
          </View>

          {/* Action Button */}
          <Button
            title={`✨ ${t('understandRequirementBtn')} →`}
            variant="primary"
            size="lg"
            onPress={handleUnderstand}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Alternative Step Form Link */}
        <TouchableOpacity
          onPress={() => navigate('find-scheme')}
          activeOpacity={0.7}
          style={styles.switchLink}
        >
          <Text style={styles.switchLinkText}>
            Prefer standard step-by-step form? Tap here →
          </Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    ...shadows.subtle,
  },
  aiBadge: {
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  aiBadgeText: {
    ...typography.styles.captionBold,
    color: colors.navy,
    fontSize: 10,
  },
  title: {
    ...typography.styles.h2,
    color: colors.navy,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  examplesLabel: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 10,
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'column',
  },
  chip: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
  chipText: {
    ...typography.styles.caption,
    color: colors.navy,
    fontSize: 12,
  },
  noticeBox: {
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.sm,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.2)',
  },
  noticeText: {
    ...typography.styles.caption,
    color: colors.tealDark,
    lineHeight: 16,
    fontSize: 11,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  switchLinkText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
  },
});
