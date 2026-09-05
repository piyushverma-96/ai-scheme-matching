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
import { useApp } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export default function ApplicationTrackingScreen() {
  const { activeApplication, navigate, goBack, t } = useApp();
  const app = activeApplication;

  if (!app) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('trackTitle')} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Application Summary Card */}
        <View style={styles.headerCard}>
          <View style={styles.codeRow}>
            <View>
              <Text style={styles.codeLabel}>{t('appNumberLabel')}</Text>
              <Text style={styles.codeValue}>{app.application_number}</Text>
            </View>

            <StatusBadge status={app.status} />
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Scheme Name</Text>
              <Text style={styles.metaValue}>{app.scheme_name}</Text>
            </View>

            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Loan Amount</Text>
              <Text style={styles.metaValue}>₹{Number(app.loan_amount).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={[styles.metaRow, { marginTop: 8 }]}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Assigned Partner Agency</Text>
              <Text style={styles.metaValue}>{app.partner_name || 'Bhopal SCA'}</Text>
            </View>
          </View>
        </View>

        {/* Stage Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineHeading}>{t('timelineTitle')}</Text>

          <View style={styles.stagesWrapper}>
            {app.stages.map((stage, idx) => {
              const isLast = idx === app.stages.length - 1;

              return (
                <View key={idx} style={styles.stageItem}>
                  {/* Left Column: Line & Bullet */}
                  <View style={styles.bulletCol}>
                    <View
                      style={[
                        styles.stageBullet,
                        stage.done
                          ? styles.bulletDone
                          : stage.current
                          ? styles.bulletCurrent
                          : styles.bulletPending,
                      ]}
                    >
                      <Text style={styles.bulletText}>
                        {stage.done ? '✓' : idx + 1}
                      </Text>
                    </View>
                    {!isLast ? (
                      <View
                        style={[
                          styles.verticalLine,
                          stage.done ? styles.lineDone : styles.linePending,
                        ]}
                      />
                    ) : null}
                  </View>

                  {/* Right Column: Stage Details */}
                  <View style={styles.stageTextCol}>
                    <View style={styles.stageTitleRow}>
                      <Text
                        style={[
                          styles.stageName,
                          stage.current ? styles.stageNameCurrent : null,
                        ]}
                      >
                        {stage.name}
                      </Text>
                      {stage.date ? (
                        <Text style={styles.stageDate}>{stage.date}</Text>
                      ) : null}
                    </View>

                    {stage.remarks ? (
                      <Text style={styles.stageRemarks}>{stage.remarks}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Audit Verification Footnote */}
        <View style={styles.auditBox}>
          <Text style={styles.auditText}>
            🔒 Official Government Audit Trail. Application packet submitted directly under NSFDC Concessional Credit rules.
          </Text>
        </View>

        {/* Actions */}
        <Button
          title="💬 Ask Assistant About My Application"
          variant="outline"
          size="md"
          onPress={() => navigate('ai-assistant')}
          style={{ marginTop: 14, marginBottom: 24 }}
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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    marginBottom: 16,
    ...shadows.subtle,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  codeValue: {
    ...typography.styles.h2,
    color: colors.navy,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
  },
  metaValue: {
    ...typography.styles.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    ...shadows.subtle,
  },
  timelineHeading: {
    ...typography.styles.h3,
    color: colors.navy,
    marginBottom: 16,
  },
  stagesWrapper: {
    paddingLeft: 4,
  },
  stageItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  bulletCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 10,
  },
  stageBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bulletDone: {
    backgroundColor: colors.teal,
  },
  bulletCurrent: {
    backgroundColor: colors.warning,
  },
  bulletPending: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  bulletText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  verticalLine: {
    flex: 1,
    width: 2,
    marginVertical: 2,
  },
  lineDone: {
    backgroundColor: colors.teal,
  },
  linePending: {
    backgroundColor: colors.borderLight,
  },
  stageTextCol: {
    flex: 1,
    paddingBottom: 14,
  },
  stageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageName: {
    ...typography.styles.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  stageNameCurrent: {
    ...typography.styles.bodyBold,
    color: colors.navy,
  },
  stageDate: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  stageRemarks: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  auditBox: {
    marginTop: 14,
    paddingHorizontal: 8,
  },
  auditText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 11,
  },
});
