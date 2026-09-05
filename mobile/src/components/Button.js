import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryContainer;
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'danger':
        return styles.dangerContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={isInteractive ? onPress : undefined}
      style={[
        styles.baseContainer,
        getSizeStyle(),
        getContainerStyle(),
        (disabled || loading) && styles.disabledContainer,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.teal}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 38,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  sizeLg: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  primaryContainer: {
    backgroundColor: colors.teal,
  },
  secondaryContainer: {
    backgroundColor: colors.navyTint,
    borderWidth: 1,
    borderColor: 'rgba(11, 37, 69, 0.15)',
  },
  outlineContainer: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  disabledContainer: {
    opacity: 0.55,
  },
  baseText: {
    ...typography.styles.button,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.navy,
  },
  outlineText: {
    color: colors.textPrimary,
  },
  ghostText: {
    color: colors.teal,
  },
  dangerText: {
    color: colors.white,
  },
});
