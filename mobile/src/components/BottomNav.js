import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { currentScreen, navigate, t } = useApp();

  const tabs = [
    { id: 'home', label: t('navHome'), icon: '🏠' },
    { id: 'schemes', label: t('navSchemes'), icon: '📜' },
    { id: 'applications', label: t('navApplications'), icon: '📋' },
    { id: 'help', label: t('navHelp'), icon: '🛡️' },
  ];

  // If on splash, language, onboarding, login, or signup, do not render bottom nav
  const hiddenScreens = ['splash', 'language', 'onboarding', 'login', 'signup'];
  if (hiddenScreens.includes(currentScreen)) {
    return null;
  }

  const isActive = (tabId) => {
    if (tabId === 'home' && currentScreen === 'home') return true;
    if (tabId === 'schemes' && ['schemes', 'scheme-details', 'scheme-results', 'find-scheme'].includes(currentScreen)) return true;
    if (tabId === 'applications' && ['applications', 'tracking', 'documents'].includes(currentScreen)) return true;
    if (tabId === 'help' && ['help', 'ai-assistant', 'profile'].includes(currentScreen)) return true;
    return false;
  };

  return (
    <View style={styles.navContainer}>
      {tabs.map((tab) => {
        const active = isActive(tab.id);
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => navigate(tab.id)}
            activeOpacity={0.7}
            style={[styles.tabButton, active ? styles.activeTabButton : null]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.tabIcon, active ? styles.activeTabIcon : null]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.tabLabel,
                active ? styles.activeTabLabel : null,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1.2,
    borderTopColor: colors.borderStrong,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadows.subtle,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  activeTabButton: {
    backgroundColor: colors.tealTint,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.65,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    ...typography.styles.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  activeTabLabel: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
    fontSize: 11,
  },
});
