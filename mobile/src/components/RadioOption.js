import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';

export default function RadioOption({
  selected,
  onSelect,
  title,
  subtitle,
  badge,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onSelect}
      style={[
        styles.container,
        selected ? styles.selectedContainer : null,
        style,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.contentCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, selected ? styles.selectedTitle : null]}>
            {title}
          </Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={[styles.outerCircle, selected ? styles.selectedCircle : null]}>
        {selected ? <View style={styles.innerDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
    minHeight: 52,
  },
  selectedContainer: {
    borderColor: colors.teal,
    backgroundColor: colors.tealTint,
  },
  contentCol: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    ...typography.styles.bodyBold,
    color: colors.textPrimary,
  },
  selectedTitle: {
    color: colors.tealDark,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 3,
  },
  badge: {
    backgroundColor: colors.navyTint,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    ...typography.styles.captionBold,
    color: colors.navy,
    fontSize: 10,
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    borderColor: colors.teal,
    backgroundColor: colors.surface,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.teal,
  },
});
