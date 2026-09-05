import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function NavigationBar({
  title = null,
  showBack = false,
  onBack = null,
  showLanguageToggle = true,
  showProfile = true,
  style,
}) {
  const { language, setLanguage, navigate, goBack } = useApp();
  const { user, isAuthenticated } = useAuth();

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleProfilePress = () => {
    navigate('profile');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={[styles.headerContainer, style]}>
        {/* Left Section: Back button or Logo */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBack || goBack}
              activeOpacity={0.7}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigate('home')}
              activeOpacity={0.8}
              style={styles.logoRow}
            >
              <View style={styles.emblemBadge}>
                <Text style={styles.emblemText}>अ</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>ArthSetu</Text>
                <Text style={styles.brandTagline}>Right Scheme. Right Partner.</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Title (when in sub-screen) */}
        {title && showBack ? (
          <View style={styles.centerTitleWrapper}>
            <Text style={styles.screenTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : null}

        {/* Right Section: Language Toggle + Profile */}
        <View style={styles.rightSection}>
          {showLanguageToggle ? (
            <TouchableOpacity
              onPress={handleLanguageToggle}
              activeOpacity={0.7}
              style={styles.langButton}
              accessibilityRole="button"
              accessibilityLabel="Switch language"
            >
              <Text style={styles.langText}>
                {language === 'en' ? 'हिंदी' : 'EN'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {showProfile ? (
            <TouchableOpacity
              onPress={handleProfilePress}
              activeOpacity={0.7}
              style={styles.profileAvatar}
              accessibilityRole="button"
              accessibilityLabel="User profile"
            >
              <Text style={styles.avatarText}>
                {isAuthenticated && user?.email
                  ? user.email.charAt(0).toUpperCase()
                  : '👤'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: colors.navy,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emblemText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  brandTitle: {
    ...typography.styles.h3,
    color: colors.white,
    fontSize: 15,
  },
  brandTagline: {
    ...typography.styles.caption,
    color: '#94A3B8',
    fontSize: 9,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 8,
  },
  backArrow: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  backText: {
    ...typography.styles.captionBold,
    color: colors.white,
  },
  centerTitleWrapper: {
    flex: 1,
    paddingHorizontal: 8,
  },
  screenTitle: {
    ...typography.styles.captionBold,
    color: colors.white,
    fontSize: 13,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  langText: {
    ...typography.styles.captionBold,
    color: colors.white,
    fontSize: 11,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
