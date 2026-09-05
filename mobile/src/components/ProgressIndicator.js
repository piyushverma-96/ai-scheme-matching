import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';

export default function ProgressIndicator({
  currentStep = 1,
  totalSteps = 4,
  title = '',
  style,
}) {
  const progressPct = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        {title ? <Text style={styles.titleText}>{title}</Text> : null}
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
  },
  titleText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  track: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.full,
  },
});
