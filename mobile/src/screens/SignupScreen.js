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

export default function SignupScreen({ onNavigate }) {
  const { signup, loading } = useAuth();
  const { navigate, t } = useApp();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const nav = onNavigate || navigate;

  const handleSignup = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const result = await signup(email.trim(), password, fullName.trim(), phone.trim());
    if (result.success) {
      setSuccessMessage('Account registered successfully! Please check your email to confirm or sign in directly.');
      setTimeout(() => nav('login'), 2000);
    } else {
      setErrorMessage(result.error || 'Registration failed. Please verify your details.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar showBack onBack={() => nav('login')} showProfile={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('signupTitle')}</Text>
            <Text style={styles.subtitle}>{t('signupSubtitle')}</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✓ {successMessage}</Text>
              </View>
            ) : null}

            <Input
              label={t('fullNameLabel')}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Ramesh Kumar"
              autoCapitalize="words"
            />

            <Input
              label={t('phoneLabel')}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 98765 43210"
              keyboardType="phone-pad"
            />

            <Input
              label={t('emailLabel')}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. applicant@arthsetu.gov.in"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label={t('passwordLabel')}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              secureTextEntry
              hint="Must contain letters and numbers for account security."
            />

            <Button
              title={t('createAccountButton')}
              variant="primary"
              size="lg"
              onPress={handleSignup}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => nav('login')}>
                <Text style={styles.linkText}>{t('signInButton')}</Text>
              </TouchableOpacity>
            </View>
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
  submitButton: {
    marginTop: 8,
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
  successBox: {
    backgroundColor: colors.successTint,
    borderRadius: borderRadius.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  successText: {
    ...typography.styles.captionBold,
    color: colors.success,
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
});
