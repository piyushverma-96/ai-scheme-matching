import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';

export default function StatusCard({
  title = 'System Connectivity Status',
  loading = false,
  healthData,
  error,
}) {
  const isHealthy = healthData?.status === 'healthy' && healthData?.database_connected;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.navy} />
        ) : (
          <View
            style={[
              styles.badge,
              isHealthy ? styles.badgeSuccess : styles.badgeError,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isHealthy ? styles.badgeTextSuccess : styles.badgeTextError,
              ]}
            >
              {isHealthy ? 'ONLINE' : 'DEGRADED / OFFLINE'}
            </Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Connection Notice:</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      ) : healthData ? (
        <View style={styles.detailsContainer}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>FastAPI Service:</Text>
            <Text style={styles.itemValue}>{healthData.service} (v{healthData.version})</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Supabase Database:</Text>
            <Text
              style={[
                styles.itemValue,
                healthData.database_connected
                  ? styles.itemValueSuccess
                  : styles.itemValueError,
              ]}
            >
              {healthData.database_connected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Environment:</Text>
            <Text style={styles.itemValue}>{healthData.environment}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Problem Statement:</Text>
            <Text style={styles.itemValue}>PS {healthData.problem_statement_id}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 16,
    marginVertical: 10,
    ...shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.styles.captionBold,
    color: colors.navy,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: colors.successTint,
    borderColor: colors.successBorder,
  },
  badgeError: {
    backgroundColor: colors.errorTint,
    borderColor: colors.errorBorder,
  },
  badgeText: {
    ...typography.styles.captionBold,
    fontSize: 10,
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextError: {
    color: colors.error,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemLabel: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  itemValue: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
  },
  itemValueSuccess: {
    color: colors.success,
  },
  itemValueError: {
    color: colors.error,
  },
  errorBox: {
    backgroundColor: colors.errorTint,
    borderRadius: borderRadius.sm,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  errorTitle: {
    ...typography.styles.captionBold,
    color: colors.error,
  },
  errorMessage: {
    ...typography.styles.caption,
    color: colors.error,
    marginTop: 2,
  },
});
