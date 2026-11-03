import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Btn, T } from '../../src/components/ui';
import Logo from '../../src/components/Logo';
import PasswordStrength, { RULES } from '../../src/components/PasswordStrength';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import { errMsg } from '../../src/services/api';
import { spacing, fontSize, radius } from '../../src/theme';

export default function Reset() {
  const { theme } = useSettings();
  const { resetPassword } = useAuth();
  const params = useLocalSearchParams();
  const [token, setToken] = useState(params.token || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const valid = RULES.every(([t]) => t(password)) && token.trim();

  const submit = async () => {
    if (!valid) return;
    setBusy(true); setError(null);
    try {
      await resetPassword(token.trim(), password);
      setDone(true);
      setTimeout(() => router.replace('/(auth)/login'), 1500);
    } catch (e) {
      setError(errMsg(e, 'This link has expired'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
          <Logo size="md" style={{ marginBottom: spacing.xl }} />
          {done ? (
            <>
              <Ionicons name="checkmark-circle" size={64} color={theme.success} style={{ alignSelf: 'center' }} />
              <Text style={[s.title, { color: theme.text, textAlign: 'center', marginTop: spacing.md }]}>Password updated</Text>
              <T size="small" color={theme.textSecondary} style={{ textAlign: 'center' }}>Redirecting to log in…</T>
            </>
          ) : (
            <>
              <Text style={[s.title, { color: theme.text }]}>Set new password</Text>
              <TextInput style={[s.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
                placeholder="Reset token" placeholderTextColor={theme.placeholder}
                autoCapitalize="none" value={token} onChangeText={setToken} />
              <TextInput style={[s.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginTop: spacing.sm }]}
                placeholder="New password" placeholderTextColor={theme.placeholder}
                secureTextEntry value={password} onChangeText={setPassword} />
              <PasswordStrength password={password} showChecklist />
              {error && <T size="small" color={theme.error} style={{ marginTop: spacing.sm }}>{error}</T>}
              <Btn title="Save new password" onPress={submit} loading={busy} disabled={!valid} style={{ marginTop: spacing.md }} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.headline, fontWeight: '800', marginBottom: spacing.md },
  input: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52, fontSize: fontSize.body },
});
