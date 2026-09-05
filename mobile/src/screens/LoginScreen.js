import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows } from '../theme/borderRadius';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Input from '../components/Input';
import Button from '../components/Button';
import NavigationBar from '../components/NavigationBar';

export default function LoginScreen({ onNavigate }) {
  const { login, loading } = useAuth();
  const { navigate, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const nav = onNavigate || navigate;

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const result = await login(email.trim(), password);
    if (result.success) {
      nav('home');
    } else {
      setErrorMessage(
        result.error || 'Authentication failed. Please check your credentials.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar showBack onBack={() => nav('home')} showProfile={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header Banner */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('loginTitle')}</Text>
            <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label={t('emailLabel')}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. entrepreneur@arthsetu.gov.in"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label={t('passwordLabel')}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            <View style={styles.forgotRow}>
              <Text style={styles.guestHint}>
                {t('guestNotice')}
              </Text>
            </View>

            <Button
              title={t('signInButton')}
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
              <TouchableOpacity onPress={() => nav('signup')}>
                <Text style={styles.linkText}>{t('createAccountButton')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trust Footnote */}
          <View style={styles.trustBox}>
            <Text style={styles.trustText}>
              🔒 Protected with Supabase Authentication. Your credentials and identity are encrypted.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    ...typography.styles.h1,
    color: colors.navy,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    padding: 20,
    ...shadows.subtle,
  },
  forgotRow: {
    marginBottom: 16,
  },
  guestHint: {
    ...typography.styles.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  submitButton: {
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: colors.errorTint,
    borderRadius: borderRadius.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  errorText: {
    ...typography.styles.captionBold,
    color: colors.error,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  linkText: {
    ...typography.styles.captionBold,
    color: colors.tealDark,
  },
  trustBox: {
    marginTop: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  trustText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 11,
  },
});
