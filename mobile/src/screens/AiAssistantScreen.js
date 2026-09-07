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
import { useApp } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import Input from '../components/Input';
import Button from '../components/Button';

export default function AiAssistantScreen() {
  const { navigate, goBack, t } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Namaste! I am the UdyamNex Scheme Assistant. I can help you understand NSFDC guidelines, eligibility thresholds, required documents, or how to reach channel partners.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    { q: t('q1'), a: 'For small business & dairy farming up to ₹50 Lakhs, the NSFDC Term Loan Scheme offers 7.0% to 8.0% p.a. with up to 10 years repayment and 6 months moratorium.' },
    { q: t('q2'), a: 'The standard annual family income ceiling for NSFDC concessional schemes is ₹3,00,000 per annum (rural and urban areas alike).' },
    { q: t('q3'), a: 'Women beneficiaries receive a 0.5% interest rate rebate on NSFDC Term Loans and Educational Loans (reducing the rate to 3.5% for education).' },
    { q: t('q4'), a: 'You can reach the M.P. Rajya SC Finance Corporation at Shyamla Hills, Bhopal, or apply through nominated Public Sector Banks (PNB, SBI).' },
  ];

  const handleSend = (textToSend = null) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      // Find matching response or provide grounded fallback
      const match = suggestedQuestions.find(
        (sq) => sq.q.toLowerCase() === query.toLowerCase()
      );
      let reply = match
        ? match.a
        : 'Under NSFDC gazette guidelines, applicants belonging to the Scheduled Caste community with annual family income up to ₹3 Lakhs are eligible for concessional credit across Term Loans, Education Loans, and Micro-credit. Please consult your nearest State Channelizing Agency for formal sanction.';

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'assistant', text: reply },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('assistantTitle')} showBack onBack={goBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header Banner */}
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>💡 {t('assistantTitle')}</Text>
            <Text style={styles.headerSub}>{t('assistantSubtitle')}</Text>
          </View>

          {/* Suggested Questions Section */}
          <View style={styles.suggestedSection}>
            <Text style={styles.suggestedTitle}>{t('suggestedQuestionsTitle')}:</Text>
            {suggestedQuestions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSend(item.q)}
                activeOpacity={0.7}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>{item.q} →</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message Thread */}
          <View style={styles.chatThread}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.assistantMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              );
            })}

            {isTyping ? (
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <Text style={styles.assistantMessageText}>Analyzing official NSFDC guidelines...</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <Input
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('askPlaceholder')}
            style={{ flex: 1, marginBottom: 0, marginRight: 8 }}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            activeOpacity={0.75}
            style={styles.sendButton}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Legal disclaimer */}
        <View style={styles.footnote}>
          <Text style={styles.footnoteText}>{t('assistantDisclaimer')}</Text>
        </View>
      </KeyboardAvoidingView>

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
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 37, 69, 0.15)',
    padding: 14,
    marginBottom: 14,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.navy,
  },
  headerSub: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  suggestedSection: {
    marginBottom: 16,
  },
  suggestedTitle: {
    ...typography.styles.captionBold,
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    ...shadows.subtle,
  },
  suggestionText: {
    ...typography.styles.caption,
    color: colors.tealDark,
    fontSize: 12,
  },
  chatThread: {
    paddingVertical: 8,
  },
  messageBubble: {
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
    maxWidth: '85%',
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    alignSelf: 'flex-start',
    ...shadows.subtle,
  },
  userBubble: {
    backgroundColor: colors.teal,
    alignSelf: 'flex-end',
  },
  messageText: {
    ...typography.styles.body,
    fontSize: 13,
    lineHeight: 19,
  },
  assistantMessageText: {
    color: colors.textPrimary,
  },
  userMessageText: {
    color: colors.white,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sendButton: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    ...typography.styles.captionBold,
    color: colors.white,
  },
  footnote: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  footnoteText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
});
