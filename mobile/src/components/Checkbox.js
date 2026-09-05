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

export default function Checkbox({
  checked,
  onToggle,
  title,
  subtitle,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={[
        styles.container,
        checked ? styles.checkedContainer : null,
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked ? styles.checkedBox : null]}>
        {checked ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>

      <View style={styles.contentCol}>
        <Text style={[styles.title, checked ? styles.checkedTitle : null]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 8,
  },
  checkedContainer: {
    borderColor: colors.teal,
    backgroundColor: colors.tealTint,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: colors.surface,
  },
  checkedBox: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  checkMark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentCol: {
    flex: 1,
  },
  title: {
    ...typography.styles.bodyBold,
    color: colors.textPrimary,
  },
  checkedTitle: {
    color: colors.tealDark,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
