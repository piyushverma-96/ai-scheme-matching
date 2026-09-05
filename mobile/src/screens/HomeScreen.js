import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { checkBackendHealth } from '../services/api';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import StatusCard from '../components/StatusCard';
import Button from '../components/Button';

export default function HomeScreen({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const { navigate, activeApplication, t, language } = useApp();
  const [healthData, setHealthData] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSystemHealth, setShowSystemHealth] = useState(false);

  const nav = onNavigate || navigate;

  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    const result = await checkBackendHealth();
    if (result.success) {
      setHealthData(result.data);
    } else {
      setHealthError(result.error);
    }
    setHealthLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealth();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = t('greetingMorning');
    if (hour >= 12 && hour < 17) timeGreeting = t('greetingAfternoon');
    if (hour >= 17) timeGreeting = t('greetingEvening');

    const name = isAuthenticated && user?.user_metadata?.full_name
      ? user.user_metadata.full_name
      : isAuthenticated && user?.email
      ? user.email.split('@')[0]
      : null;

    return name ? `${timeGreeting}, ${name}` : `${timeGreeting}, ${t('greetingGuest')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal]} />
        }
      >
        {/* User Greeting Section */}
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.greetingSubtext}>
            {t('tagline')}
          </Text>
        </View>

        {/* Primary Hero Section: Find My Scheme */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>NSFDC & Welfare Schemes</Text>
          </View>

          <Text style={styles.heroTitle}>{t('homeHeroTitle')}</Text>
          <Text style={styles.heroDesc}>{t('homeHeroDesc')}</Text>

          <View style={styles.heroActionsRow}>
            <Button
              title={`✨ ${t('homeHeroCTA')} →`}
              variant="primary"
              size="lg"
              onPress={() => nav('find-scheme')}
              style={styles.heroPrimaryBtn}
            />

            <TouchableOpacity
              onPress={() => nav('ai-input')}
              activeOpacity={0.75}
              style={styles.heroSecondaryBtn}
            >
              <Text style={styles.heroSecondaryText}>
                💬 {t('homeAiCTA')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Grid (4 Core Services) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActionsTitle')}</Text>

          <View style={styles.quickGrid}>
            {/* Action 1: EMI Calculator */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => nav('emi-calculator')}
              style={styles.gridItem}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.tealTint }]}>
                <Text style={styles.gridIcon}>🧮</Text>
              </View>
              <Text style={styles.gridTitle}>{t('qaEmi')}</Text>
              <Text style={styles.gridSub}>{t('qaEmiSub')}</Text>
            </TouchableOpacity>

            {/* Action 2: Partner Finder */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => nav('partner-finder')}
              style={styles.gridItem}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.navyTint }]}>
                <Text style={styles.gridIcon}>🏛️</Text>
              </View>
              <Text style={styles.gridTitle}>{t('qaPartner')}</Text>
              <Text style={styles.gridSub}>{t('qaPartnerSub')}</Text>
            </TouchableOpacity>

            {/* Action 3: Track Application */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => nav('tracking')}
              style={styles.gridItem}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.infoTint }]}>
                <Text style={styles.gridIcon}>📋</Text>
              </View>
              <Text style={styles.gridTitle}>{t('qaTrack')}</Text>
              <Text style={styles.gridSub}>{t('qaTrackSub')}</Text>
            </TouchableOpacity>

            {/* Action 4: Ask Assistant */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => nav('ai-assistant')}
              style={styles.gridItem}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.amberTint }]}>
                <Text style={styles.gridIcon}>💡</Text>
              </View>
              <Text style={styles.gridTitle}>{t('qaAssistant')}</Text>
              <Text style={styles.gridSub}>{t('qaAssistantSub')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Applications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('recentApplicationsTitle')}</Text>
            {activeApplication ? (
              <TouchableOpacity onPress={() => nav('tracking')}>
                <Text style={styles.viewAllText}>{t('viewDetails')} →</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {activeApplication ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => nav('tracking')}
              style={styles.applicationCard}
            >
              <View style={styles.appCardHeader}>
                <View>
                  <Text style={styles.appCode}>{activeApplication.application_number}</Text>
                  <Text style={styles.appSchemeName}>{activeApplication.scheme_name}</Text>
                </View>
                <StatusBadge status={activeApplication.status} />
              </View>

              <View style={styles.appDetailsRow}>
                <Text style={styles.appDetailText}>
                  💰 Loan Amount: ₹{Number(activeApplication.loan_amount).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.appDetailText}>
                  🏛️ {activeApplication.partner_name || 'Bhopal SCA'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyAppCard}>
              <Text style={styles.emptyAppTitle}>{t('noActiveApplications')}</Text>
              <Text style={styles.emptyAppDesc}>{t('noActiveAppDesc')}</Text>
            </View>
          )}
        </View>

        {/* Assistance / Trust Banner */}
        <View style={styles.assistBanner}>
          <View style={styles.assistTextCol}>
            <Text style={styles.assistTitle}>{t('needHelpTitle')}</Text>
            <Text style={styles.assistDesc}>{t('needHelpDesc')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => nav('ai-assistant')}
            activeOpacity={0.75}
            style={styles.assistBtn}
          >
            <Text style={styles.assistBtnText}>Ask Question →</Text>
          </TouchableOpacity>
        </View>

        {/* System & Database Connectivity Accordion (For Hackathon Review) */}
        <View style={styles.systemSection}>
          <TouchableOpacity
            onPress={() => setShowSystemHealth(!showSystemHealth)}
            activeOpacity={0.7}
            style={styles.systemToggleRow}
          >
            <Text style={styles.systemToggleText}>
              🔧 Technical Foundation Status ({healthData?.status === 'healthy' ? '🟢 Online' : '🟡 Verifying'})
            </Text>
            <Text style={styles.systemToggleArrow}>
              {showSystemHealth ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showSystemHealth ? (
            <View style={styles.systemDetailsWrapper}>
              <StatusCard
                title="Backend & Database Connectivity"
                loading={healthLoading}
                healthData={healthData}
                error={healthError}
              />
              <Button
                title="Re-test System Connectivity"
                variant="outline"
                size="sm"
                onPress={fetchHealth}
                loading={healthLoading}
              />
            </View>
          ) : null}
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
    paddingBottom: 24,
  },
  greetingHeader: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  greetingText: {
    ...typography.styles.h2,
    color: colors.navy,
  },
  greetingSubtext: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 20,
    ...shadows.card,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  heroBadgeText: {
    ...typography.styles.captionBold,
    color: '#D1E3F0',
    fontSize: 10,
  },
  heroTitle: {
    ...typography.styles.h1,
    color: colors.white,
    fontSize: 20,
    marginBottom: 6,
  },
  heroDesc: {
    ...typography.styles.body,
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroActionsRow: {
    flexDirection: 'column',
  },
  heroPrimaryBtn: {
    marginBottom: 8,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroSecondaryText: {
    ...typography.styles.captionBold,
    color: colors.white,
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.navy,
    marginBottom: 10,
  },
  viewAllText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 14,
    marginBottom: 10,
    ...shadows.subtle,
  },
  gridIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridIcon: {
    fontSize: 18,
  },
  gridTitle: {
    ...typography.styles.bodyBold,
    color: colors.navy,
    fontSize: 13,
  },
  gridSub: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  applicationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 16,
    ...shadows.subtle,
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appCode: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
    fontSize: 11,
  },
  appSchemeName: {
    ...typography.styles.bodyBold,
    color: colors.navy,
    marginTop: 2,
  },
  appDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  appDetailText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  emptyAppCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    alignItems: 'center',
  },
  emptyAppTitle: {
    ...typography.styles.bodyBold,
    color: colors.textSecondary,
  },
  emptyAppDesc: {
    ...typography.styles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  assistBanner: {
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.2)',
    padding: 16,
    marginBottom: 20,
  },
  assistTextCol: {
    marginBottom: 10,
  },
  assistTitle: {
    ...typography.styles.bodyBold,
    color: colors.tealDark,
  },
  assistDesc: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  assistBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xs,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  assistBtnText: {
    ...typography.styles.captionBold,
    color: colors.white,
    fontSize: 11,
  },
  systemSection: {
    marginTop: 10,
    marginBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  systemToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  systemToggleText: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
    fontSize: 11,
  },
  systemToggleArrow: {
    color: colors.textMuted,
    fontSize: 11,
  },
  systemDetailsWrapper: {
    marginTop: 8,
  },
});
