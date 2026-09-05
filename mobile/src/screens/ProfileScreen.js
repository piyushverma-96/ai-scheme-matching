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
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const { navigate, goBack, language, setLanguage, savedSchemeIds, t } = useApp();

  const handleLogout = async () => {
    await logout();
    navigate('home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('profileTitle')} showBack onBack={goBack} showProfile={false} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {isAuthenticated && user?.email
                ? user.email.charAt(0).toUpperCase()
                : '👤'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {isAuthenticated && user?.user_metadata?.full_name
                ? user.user_metadata.full_name
                : isAuthenticated && user?.email
                ? user.email.split('@')[0]
                : 'Beneficiary (Guest)'}
            </Text>
            <Text style={styles.userEmail}>
              {isAuthenticated && user?.email
                ? user.email
                : 'Guest Mode · Public Schemes'}
            </Text>
          </View>

          {!isAuthenticated ? (
            <TouchableOpacity
              onPress={() => navigate('login')}
              activeOpacity={0.7}
              style={styles.signInBtn}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Menu Section 1: Preferences */}
        <View style={styles.menuCard}>
          <Text style={styles.menuHeader}>Preferences & Saved</Text>

          <TouchableOpacity
            onPress={() => navigate('language')}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>🌐</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>{t('languagePreference')}</Text>
              <Text style={styles.menuSub}>
                Current: {language === 'en' ? 'English' : 'हिंदी (Hindi)'}
              </Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate('schemes')}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>⭐</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>{t('savedSchemes')}</Text>
              <Text style={styles.menuSub}>{savedSchemeIds.length} Saved Scheme(s)</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate('applications')}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>{t('recentApplicationsTitle')}</Text>
              <Text style={styles.menuSub}>1 Active Application Packet</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Section 2: Trust & Support */}
        <View style={styles.menuCard}>
          <Text style={styles.menuHeader}>Support & Governance</Text>

          <TouchableOpacity
            onPress={() => navigate('help')}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>🛡️</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>{t('helpAndSupport')}</Text>
              <Text style={styles.menuSub}>How recommendations work & official disclaimer</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate('documents')}
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>📁</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Master Document Checklist</Text>
              <Text style={styles.menuSub}>Required identity and revenue documents</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Action */}
        {isAuthenticated ? (
          <Button
            title={`🚪 ${t('signOut')}`}
            variant="danger"
            size="md"
            onPress={handleLogout}
            style={{ marginTop: 10, marginBottom: 30 }}
          />
        ) : (
          <Button
            title="🔐 Sign In to Save Application History"
            variant="primary"
            size="md"
            onPress={() => navigate('login')}
            style={{ marginTop: 10, marginBottom: 30 }}
          />
        )}
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 18,
    marginBottom: 16,
    ...shadows.subtle,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: colors.teal,
  },
  avatarText: {
    color: colors.tealDark,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...typography.styles.h3,
    color: colors.navy,
  },
  userEmail: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  signInBtn: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  signInBtnText: {
    ...typography.styles.captionBold,
    color: colors.white,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 16,
    marginBottom: 16,
    ...shadows.subtle,
  },
  menuHeader: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    ...typography.styles.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  menuSub: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
