import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';

export default function LanguageScreen() {
  const { language, setLanguage, navigate, t } = useApp();

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
  };

  const handleContinue = () => {
    navigate('onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🌐</Text>
          </View>
          <Text style={styles.title}>{t('chooseLanguageTitle')}</Text>
          <Text style={styles.subtitle}>{t('chooseLanguageSubtitle')}</Text>
        </View>

        {/* Language Options */}
        <View style={styles.optionsContainer}>
          {/* English Option */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleSelectLanguage('en')}
            style={[
              styles.optionCard,
              language === 'en' ? styles.selectedOptionCard : null,
            ]}
          >
            <View style={styles.optionTextCol}>
              <Text
                style={[
                  styles.optionTitle,
                  language === 'en' ? styles.selectedTitle : null,
                ]}
              >
                English
              </Text>
              <Text style={styles.optionSub}>Continue in English language</Text>
            </View>

            <View
              style={[
                styles.radioCircle,
                language === 'en' ? styles.selectedRadioCircle : null,
              ]}
            >
              {language === 'en' ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>

          {/* Hindi Option */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleSelectLanguage('hi')}
            style={[
              styles.optionCard,
              language === 'hi' ? styles.selectedOptionCard : null,
            ]}
          >
            <View style={styles.optionTextCol}>
              <Text
                style={[
                  styles.optionTitle,
                  language === 'hi' ? styles.selectedTitle : null,
                ]}
              >
                हिंदी (Hindi)
              </Text>
              <Text style={styles.optionSub}>हिंदी भाषा में आगे बढ़ें</Text>
            </View>

            <View
              style={[
                styles.radioCircle,
                language === 'hi' ? styles.selectedRadioCircle : null,
              ]}
            >
              {language === 'hi' ? <View style={styles.radioDot} /> : null}
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title={t('continue')}
            variant="primary"
            size="lg"
            onPress={handleContinue}
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
  header: {
    alignItems: 'center',
    paddingTop: 30,
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 102, 85, 0.2)',
  },
  iconText: {
    fontSize: 26,
  },
  title: {
    ...typography.styles.h1,
    color: colors.navy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.lg,
    padding: 18,
    marginBottom: 14,
    ...shadows.subtle,
  },
  selectedOptionCard: {
    borderColor: colors.teal,
    backgroundColor: colors.tealTint,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    ...typography.styles.h3,
    color: colors.textPrimary,
  },
  selectedTitle: {
    color: colors.tealDark,
  },
  optionSub: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioCircle: {
    borderColor: colors.teal,
    backgroundColor: colors.surface,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
  },
  footer: {
    paddingBottom: 16,
  },
});
