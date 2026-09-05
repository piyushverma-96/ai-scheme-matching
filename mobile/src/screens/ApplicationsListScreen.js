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
import { useApp, DEMO_APPLICATIONS } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export default function ApplicationsListScreen() {
  const { navigate, t } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('navApplications')} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('recentApplicationsTitle')}</Text>
          <Text style={styles.subtitle}>
            Track submitted requirement packets and view real-time stage progress.
          </Text>
        </View>

        {/* Application Cards List */}
        {DEMO_APPLICATIONS.map((app) => (
          <TouchableOpacity
            key={app.id}
            onPress={() => navigate('tracking')}
            activeOpacity={0.8}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.appCode}>{app.application_number}</Text>
                <Text style={styles.schemeName}>{app.scheme_name}</Text>
              </View>

              <StatusBadge status={app.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Loan Amount:</Text>
              <Text style={styles.metaValue}>
                ₹{Number(app.loan_amount).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Nodal Agency:</Text>
              <Text style={styles.metaValue}>{app.partner_name}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.trackLinkText}>View Live Audit Timeline →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* New Application CTA */}
        <View style={styles.newAppBox}>
          <Text style={styles.newAppTitle}>Need to apply for another requirement?</Text>
          <Text style={styles.newAppSub}>
            Find suitable schemes for education or other business activities.
          </Text>
          <Button
            title="✨ Find New Scheme →"
            variant="primary"
            size="md"
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 16,
    marginBottom: 14,
    ...shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appCode: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
    fontSize: 11,
  },
  schemeName: {
    ...typography.styles.h3,
    color: colors.navy,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  metaLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
  metaValue: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  trackLinkText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
  },
  newAppBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  newAppTitle: {
    ...typography.styles.captionBold,
    color: colors.navy,
  },
  newAppSub: {
    ...typography.styles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
