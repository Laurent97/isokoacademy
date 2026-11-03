import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { spacing, radius, fontSize, TOUCH_TARGET } from '../theme';

export const Screen = ({ children, padded = true, style }) => {
  const { theme } = useSettings();
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.background }, style]} edges={['top', 'left', 'right']}>
      <View style={[{ flex: 1 }, padded && { padding: spacing.md }]}>{children}</View>
    </SafeAreaView>
  );
};

export const Card = ({ children, style }) => {
  const { theme } = useSettings();
  return (
    <View style={[{
      backgroundColor: theme.card, borderRadius: radius.md, padding: spacing.md,
      borderWidth: 1, borderColor: theme.border,
      shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }, style]}>
      {children}
    </View>
  );
};

export const Btn = ({ title, onPress, variant = 'primary', disabled, loading, style, small }) => {
  const { theme } = useSettings();
  const bg = {
    primary: theme.primary, secondary: theme.primaryLight,
    success: theme.success, danger: theme.error, ghost: 'transparent',
  }[variant];
  const fg = variant === 'secondary' ? theme.primary : variant === 'ghost' ? theme.primary : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{
        backgroundColor: disabled ? theme.border : bg,
        minHeight: small ? 36 : TOUCH_TARGET,
        borderRadius: radius.sm,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: spacing.md,
        opacity: disabled ? 0.6 : 1,
      }, style]}
    >
      {loading
        ? <ActivityIndicator color={fg} />
        : <Text style={{ color: fg, fontSize: small ? fontSize.bodySmall : fontSize.body, fontWeight: '600' }}>{title}</Text>}
    </TouchableOpacity>
  );
};

export const ProgressBar = ({ value = 0, max = 100, color, height = 8, style }) => {
  const { theme } = useSettings();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View style={[{ height, backgroundColor: theme.border, borderRadius: height / 2, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color || theme.primary, borderRadius: height / 2 }} />
    </View>
  );
};

export const Pill = ({ label, color, bg, style }) => {
  const { theme } = useSettings();
  return (
    <View style={[{
      backgroundColor: bg || theme.primaryLight, borderRadius: radius.pill,
      paddingHorizontal: spacing.sm + 2, paddingVertical: 2, alignSelf: 'flex-start',
    }, style]}>
      <Text style={{ color: color || theme.primary, fontSize: fontSize.caption, fontWeight: '600' }}>{label}</Text>
    </View>
  );
};

export const OptionRow = ({ label, selected, correct, wrong, onPress, disabled }) => {
  const { theme } = useSettings();
  let border = theme.border, bg = theme.card;
  if (correct) { border = theme.success; bg = theme.success + '22'; }
  else if (wrong) { border = theme.error; bg = theme.error + '22'; }
  else if (selected) { border = theme.primary; bg = theme.primaryLight; }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        borderWidth: 2, borderColor: border, backgroundColor: bg,
        borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm,
        minHeight: TOUCH_TARGET, justifyContent: 'center',
      }}
    >
      <Text style={{ color: theme.text, fontSize: fontSize.body }}>{label}</Text>
    </TouchableOpacity>
  );
};

export const T = ({ children, size = 'body', color, weight, center, style }) => {
  const { theme } = useSettings();
  const sizes = { caption: fontSize.caption, body: fontSize.body, small: fontSize.bodySmall, title: fontSize.title, headline: fontSize.headline };
  return (
    <Text style={[{
      color: color || theme.text,
      fontSize: sizes[size] || fontSize.body,
      fontWeight: weight || '400',
      textAlign: center ? 'center' : 'left',
    }, style]}>
      {children}
    </Text>
  );
};
