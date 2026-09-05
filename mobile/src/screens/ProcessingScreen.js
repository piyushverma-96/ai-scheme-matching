import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import { useApp } from '../context/AppContext';

export default function ProcessingScreen() {
  const { navigate, t } = useApp();
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStage(2), 700);
    const timer2 = setTimeout(() => setCurrentStage(3), 1500);
    const timer3 = setTimeout(() => navigate('scheme-results'), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const steps = [
    { id: 1, text: t('processingStep1') },
    { id: 2, text: t('processingStep2') },
    { id: 3, text: t('processingStep3') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.teal} style={styles.spinner} />

          <Text style={styles.title}>{t('processingTitle')}</Text>
          <Text style={styles.subtitle}>{t('processingWait')}</Text>

          <View style={styles.stepsList}>
            {steps.map((s) => {
              const isDone = currentStage > s.id;
              const isCurrent = currentStage === s.id;

              return (
                <View key={s.id} style={styles.stepItem}>
                  <View
                    style={[
                      styles.iconCircle,
                      isDone
                        ? styles.iconDone
                        : isCurrent
                        ? styles.iconCurrent
                        : styles.iconPending,
                    ]}
                  >
                    <Text style={styles.stepIconText}>
                      {isDone ? '✓' : isCurrent ? '•' : '○'}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.stepText,
                      isDone || isCurrent ? styles.stepTextActive : null,
                    ]}
                  >
                    {s.text}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.footnote}>
          <Text style={styles.footnoteText}>
            🔒 Rule Engine is the sole authority for eligibility decisions.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 24,
    alignItems: 'center',
    ...shadows.card,
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    ...typography.styles.h2,
    color: colors.navy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsList: {
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconDone: {
    backgroundColor: colors.successTint,
    borderWidth: 1,
    borderColor: colors.success,
  },
  iconCurrent: {
    backgroundColor: colors.tealTint,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  iconPending: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepIconText: {
    ...typography.styles.captionBold,
    fontSize: 12,
    color: colors.navy,
  },
  stepText: {
    ...typography.styles.body,
    color: colors.textMuted,
    fontSize: 13,
    flex: 1,
  },
  stepTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  footnote: {
    marginTop: 20,
    alignItems: 'center',
  },
  footnoteText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
