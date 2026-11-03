import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { spacing, fontSize } from '../theme';

export const RULES = [
  [p => p.length >= 8, 'At least 8 characters'],
  [p => /[a-zA-Z]/.test(p), 'Contains a letter'],
  [p => /\d/.test(p), 'Contains a number'],
];

export function pwScore(pw) {
  if (!pw) return 0;
  let s = RULES.filter(([t]) => t(pw)).length;
  if (pw.length >= 12 && /[^a-zA-Z0-9]/.test(pw)) s = 4;
  return Math.min(4, s + (s === 3 && pw.length >= 10 ? 1 : 0));
}

const BAR = ['#E7E5E4', '#B91C1C', '#D97706', '#F59E0B', '#15803D'];
const LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function PasswordStrength({ password, showChecklist }) {
  const { theme } = useSettings();
  const score = pwScore(password);
  if (!password) return null;
  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={[s.bar, { backgroundColor: i <= score ? BAR[score] : '#E7E5E4' }]} />
        ))}
        <Text style={[s.label, { color: BAR[score] }]}>{LABEL[score]}</Text>
      </View>
      {showChecklist && RULES.map(([t, l]) => {
        const ok = t(password);
        return (
          <View key={l} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={13} color={ok ? theme.success : theme.textMuted} />
            <Text style={[s.rule, { color: ok ? theme.success : theme.textMuted }]}>{l}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flex: 1, height: 4, borderRadius: 2, maxWidth: 40 },
  label: { fontSize: fontSize.caption, fontWeight: '700', marginLeft: 8 },
  rule: { fontSize: fontSize.caption, marginLeft: 6 },
});
