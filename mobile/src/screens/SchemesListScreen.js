import React, { useState } from 'react';
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
import { borderRadius } from '../theme/borderRadius';
import { useApp, DEMO_SCHEMES } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import SchemeCard from '../components/SchemeCard';
import Input from '../components/Input';

export default function SchemesListScreen() {
  const { setSelectedScheme, navigate, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'BUSINESS' | 'EDUCATION' | 'MICRO'

  const filteredSchemes = DEMO_SCHEMES.filter((s) => {
    if (activeCategory === 'BUSINESS' && s.scheme_type !== 'term_loan') return false;
    if (activeCategory === 'EDUCATION' && s.scheme_type !== 'education_loan') return false;
    if (activeCategory === 'MICRO' && s.scheme_type !== 'micro_finance') return false;

    if (searchQuery.trim()) {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.short_description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleSchemePress = (scheme) => {
    setSelectedScheme(scheme);
    navigate('scheme-details');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('navSchemes')} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Government Schemes Catalog</Text>
          <Text style={styles.subtitle}>
            Verified NSFDC & Ministry of Social Justice Concessional Credit Schemes.
          </Text>
        </View>

        {/* Search Input */}
        <Input
          placeholder="Search by scheme name or keywords..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          prefix="🔍"
          style={{ marginBottom: 12 }}
        />

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          {[
            { id: 'ALL', label: 'All Schemes' },
            { id: 'BUSINESS', label: 'Term Loans' },
            { id: 'EDUCATION', label: 'Higher Education' },
            { id: 'MICRO', label: 'Micro Credit' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.7}
              style={[
                styles.categoryPill,
                activeCategory === cat.id ? styles.categoryPillActive : null,
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  activeCategory === cat.id ? styles.categoryPillTextActive : null,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scheme Cards */}
        {filteredSchemes.map((scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            onPress={() => handleSchemePress(scheme)}
          />
        ))}
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
  header: {
    marginBottom: 14,
  },
  title: {
    ...typography.styles.h1,
    color: colors.navy,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  categoryPill: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: colors.tealTint,
    borderColor: colors.teal,
  },
  categoryPillText: {
    ...typography.styles.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  categoryPillTextActive: {
    color: colors.tealDark,
  },
});
