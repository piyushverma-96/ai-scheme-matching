import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/borderRadius';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  prefix = null,
  suffix = null,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  rightAction = null,
  style,
  inputStyle,
}) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          error ? styles.inputContainerError : null,
          !editable ? styles.inputContainerDisabled : null,
        ]}
      >
        {prefix ? <Text style={styles.prefixText}>{prefix}</Text> : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          style={[
            styles.inputField,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
        />

        {suffix ? <Text style={styles.suffixText}>{suffix}</Text> : null}
        {rightAction ? (
          <View style={styles.rightActionWrapper}>{rightAction}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...typography.styles.captionBold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.borderStrong,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  multilineContainer: {
    minHeight: 96,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputContainerError: {
    borderColor: colors.error,
    backgroundColor: colors.errorTint,
  },
  inputContainerDisabled: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  inputField: {
    flex: 1,
    ...typography.styles.body,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  prefixText: {
    ...typography.styles.bodyBold,
    color: colors.textSecondary,
    marginRight: 6,
  },
  suffixText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginLeft: 6,
  },
  rightActionWrapper: {
    marginLeft: 8,
  },
  hintText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  errorText: {
    ...typography.styles.captionBold,
    color: colors.error,
    marginTop: 4,
  },
});
