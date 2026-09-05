import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';
import Button from './Button';

export function LoadingState({
  title = 'Loading Information...',
  subtitle = 'Please wait while we fetch official records.',
  style,
}) {
  return (
    <View style={[styles.stateContainer, style]}>
      <ActivityIndicator size="large" color={colors.teal} style={styles.indicator} />
      <Text style={styles.stateTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function EmptyState({
  title = 'No Records Found',
  subtitle = 'There are no items matching your criteria at this moment.',
  actionTitle = null,
  onActionPress = null,
  icon = '📋',
  style,
}) {
  return (
    <View style={[styles.stateContainer, style]}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
      {actionTitle && onActionPress ? (
        <View style={styles.actionWrapper}>
          <Button title={actionTitle} variant="primary" size="sm" onPress={onActionPress} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  subtitle = 'Unable to connect to service. Please check your network and try again.',
  onRetry = null,
  retryTitle = 'Try Again',
  style,
}) {
  return (
    <View style={[styles.stateContainer, style]}>
      <View style={[styles.iconCircle, styles.errorIconCircle]}>
        <Text style={styles.iconText}>⚠️</Text>
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
      {onRetry ? (
        <View style={styles.actionWrapper}>
          <Button title={retryTitle} variant="outline" size="sm" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

export function SuccessState({
  title = 'Action Completed',
  subtitle = 'Your request has been successfully processed.',
  actionTitle = 'Continue',
  onActionPress = null,
  style,
}) {
  return (
    <View style={[styles.stateContainer, style]}>
      <View style={[styles.iconCircle, styles.successIconCircle]}>
        <Text style={styles.iconText}>✓</Text>
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
      {actionTitle && onActionPress ? (
        <View style={styles.actionWrapper}>
          <Button title={actionTitle} variant="primary" size="sm" onPress={onActionPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: 12,
  },
  indicator: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorIconCircle: {
    backgroundColor: colors.errorTint,
    borderColor: colors.errorBorder,
  },
  successIconCircle: {
    backgroundColor: colors.successTint,
    borderColor: colors.successBorder,
  },
  iconText: {
    fontSize: 22,
  },
  stateTitle: {
    ...typography.styles.h3,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 6,
  },
  stateSubtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  actionWrapper: {
    marginTop: 16,
    minWidth: 140,
  },
});
