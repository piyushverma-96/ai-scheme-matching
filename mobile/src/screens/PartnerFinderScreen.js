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
import { useApp, DEMO_PARTNERS } from '../context/AppContext';
import NavigationBar from '../components/NavigationBar';
import BottomNav from '../components/BottomNav';
import PartnerCard from '../components/PartnerCard';
import Input from '../components/Input';
import Button from '../components/Button';

export default function PartnerFinderScreen() {
  const { navigate, goBack, formState, t } = useApp();
  const [searchCity, setSearchCity] = useState(formState.city || 'Bhopal');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'SCA' | 'PSB' | 'RRB'

  const filteredPartners = DEMO_PARTNERS.filter((p) => {
    if (activeFilter !== 'ALL' && p.type !== activeFilter) return false;
    if (searchCity.trim()) {
      return (
        p.city.toLowerCase().includes(searchCity.toLowerCase()) ||
        p.name.toLowerCase().includes(searchCity.toLowerCase()) ||
        p.address.toLowerCase().includes(searchCity.toLowerCase())
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title={t('partnerFinderTitle')} showBack onBack={goBack} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('partnerFinderTitle')}</Text>
          <Text style={styles.subtitle}>{t('partnerFinderSubtitle')}</Text>
        </View>

        {/* Search Bar */}
        <Input
          placeholder={t('searchCityPlaceholder')}
          value={searchCity}
          onChangeText={setSearchCity}
          prefix="🔍"
          style={{ marginBottom: 12 }}
        />

        {/* Agency Type Filters */}
        <View style={styles.filtersRow}>
          {[
            { id: 'ALL', label: t('filterAll') },
            { id: 'SCA', label: t('filterSca') },
            { id: 'PSB', label: t('filterPsb') },
            { id: 'RRB', label: t('filterRrb') },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              activeOpacity={0.7}
              style={[
                styles.filterPill,
                activeFilter === f.id ? styles.filterPillActive : null,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === f.id ? styles.filterPillTextActive : null,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Switch Banner */}
        <TouchableOpacity
          onPress={() => navigate('map')}
          activeOpacity={0.75}
          style={styles.mapSwitchCard}
        >
          <Text style={styles.mapSwitchIcon}>🗺️</Text>
          <View style={styles.mapSwitchTextCol}>
            <Text style={styles.mapSwitchTitle}>View Interactive City Map</Text>
            <Text style={styles.mapSwitchSub}>Inspect partner locations and driving routes on Leaflet/OSM →</Text>
          </View>
        </TouchableOpacity>

        {/* Partner Cards List */}
        {filteredPartners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            onViewOnMap={() => navigate('map', { selectedPartnerId: partner.id })}
            onGetDirections={() => navigate('map', { selectedPartnerId: partner.id })}
          />
        ))}

        {filteredPartners.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Partner Found in "{searchCity}"</Text>
            <Text style={styles.emptySub}>
              Try searching for State Capital (e.g. Bhopal, Indore, Delhi) or check state nodal directory.
            </Text>
            <Button
              title="Reset to Bhopal"
              variant="outline"
              size="sm"
              onPress={() => setSearchCity('Bhopal')}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : null}

        {/* Next Step CTA */}
        <Button
          title="📋 Proceed to Required Documents Checklist →"
          variant="primary"
          size="lg"
          onPress={() => navigate('documents')}
          style={{ marginTop: 10, marginBottom: 24 }}
        />
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
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: colors.tealTint,
    borderColor: colors.teal,
  },
  filterPillText: {
    ...typography.styles.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  filterPillTextActive: {
    color: colors.tealDark,
  },
  mapSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 37, 69, 0.15)',
    padding: 12,
    marginBottom: 14,
  },
  mapSwitchIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  mapSwitchTextCol: {
    flex: 1,
  },
  mapSwitchTitle: {
    ...typography.styles.captionBold,
    color: colors.navy,
  },
  mapSwitchSub: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    ...typography.styles.bodyBold,
    color: colors.textPrimary,
  },
  emptySub: {
    ...typography.styles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
