import React, { useState } from 'react';
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
import Button from '../components/Button';

export default function OnboardingScreen() {
  const { navigate, t } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: '📜',
      title: t('onboard1Title'),
      desc: t('onboard1Desc'),
      pill: 'Step 1: Verified Schemes',
    },
    {
      icon: '📊',
      title: t('onboard2Title'),
      desc: t('onboard2Desc'),
      pill: 'Step 2: Transparent Math',
    },
    {
      icon: '🏛️',
      title: t('onboard3Title'),
      desc: t('onboard3Desc'),
      pill: 'Step 3: Authorized Partners',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('home');
    }
  };

  const handleSkip = () => {
    navigate('home');
  };

  const current = slides[currentSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar with Skip */}
        <View style={styles.topBar}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {currentSlide + 1} / {slides.length}
            </Text>
          </View>

          {currentSlide < slides.length - 1 ? (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>
          ) : <View />}
        </View>

        {/* Slide Content */}
        <View style={styles.contentSection}>
          <View style={styles.pillTag}>
            <Text style={styles.pillText}>{current.pill}</Text>
          </View>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{current.icon}</Text>
          </View>

          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.desc}>{current.desc}</Text>
        </View>

        {/* Bottom Navigation & Indicator */}
        <View style={styles.bottomSection}>
          {/* Progress Dots */}
          <View style={styles.dotsRow}>
            {slides.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  currentSlide === idx ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <Button
            title={
              currentSlide === slides.length - 1
                ? t('getStarted')
                : `${t('next')} →`
            }
            variant="primary"
            size="lg"
            onPress={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  stepBadge: {
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBadgeText: {
    ...typography.styles.captionBold,
    color: colors.navy,
    fontSize: 11,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
  },
  contentSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pillTag: {
    backgroundColor: colors.tealTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.2)',
  },
  pillText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
    fontSize: 11,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    ...typography.styles.h1,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 320,
  },
  desc: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.teal,
  },
});
