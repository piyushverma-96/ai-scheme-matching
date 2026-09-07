import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';
import { useApp } from '../context/AppContext';

export default function SplashScreen() {
  const { navigate, t } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Brand Center */}
        <View style={styles.brandCenter}>
          <View style={styles.emblemBadge}>
            <Text style={styles.emblemText}>U</Text>
          </View>

          <Text style={styles.title}>UdyamNex</Text>

          <View style={styles.taglineBox}>
            <Text style={styles.tagline}>
              {t('tagline')}
            </Text>
          </View>

          <Text style={styles.subtext}>
            {t('govSubtext')}
          </Text>
        </View>

        {/* Action Bottom */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            onPress={() => navigate('language')}
            activeOpacity={0.8}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
          >
            <Text style={styles.primaryButtonText}>
              Get Started / शुरू करें →
            </Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>
            Ministry of Social Justice & Empowerment · SIH PS 26092
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  brandCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemBadge: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  emblemText: {
    color: colors.white,
    fontSize: 38,
    fontWeight: 'bold',
  },
  title: {
    ...typography.styles.display,
    color: colors.white,
    fontSize: 32,
    letterSpacing: 0.5,
  },
  titleHi: {
    ...typography.styles.h2,
    color: '#94A3B8',
    marginTop: 2,
    fontSize: 18,
  },
  taglineBox: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tagline: {
    ...typography.styles.bodyBold,
    color: colors.white,
    textAlign: 'center',
    fontSize: 13,
  },
  subtext: {
    ...typography.styles.caption,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 280,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    ...typography.styles.button,
    color: colors.white,
    fontSize: 15,
  },
  versionText: {
    ...typography.styles.caption,
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
});
