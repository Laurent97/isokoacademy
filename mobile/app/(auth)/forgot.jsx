import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Btn, T } from '../../src/components/ui';
import Logo from '../../src/components/Logo';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import { errMsg } from '../../src/services/api';
import { spacing, fontSize, radius } from '../../src/theme';

export default function Forgot() {
  const { theme } = useSettings();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const submit = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) return;
    setBusy(true);
    try {
      const r = await forgotPassword(email.trim().toLowerCase());
      setDone(r);
    } catch (e) {
      setDone({ error: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <Logo size="md" style={{ marginBottom: spacing.xl }} />
          {done ? (
            <>
              <Ionicons name="mail-open" size={48} color={theme.success} style={{ alignSelf: 'center', marginBottom: spacing.md }} />
              <Text style={[styles.title, { color: theme.text, textAlign: 'center' }]}>Check your inbox</Text>
              <T size="small" color={theme.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                {done.error || 'If that email exists, we sent a reset link.'}
              </T>
              {done.dev_reset_token && (
                <T size="caption" color={theme.primary} style={{ textAlign: 'center', marginTop: 12 }} selectable>
                  Dev token: {done.dev_reset_token}
                </T>
              )}
              <Btn title="Back to login" variant="secondary" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.lg }} />
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.text }]}>Reset password</Text>
              <Text style={[styles.sub, { color: theme.textSecondary }]}>Enter your email and we'll send a reset link</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
                placeholder="you@example.com" placeholderTextColor={theme.placeholder}
                keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}
              />
              <Btn title="Send reset link" onPress={submit} loading={busy} style={{ marginTop: spacing.md }} />
              <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} style={{ alignSelf: 'center', marginTop: spacing.md }}>
                <T size="small" color={theme.primary}>Back</T>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.headline, fontWeight: '800' },
  sub: { fontSize: fontSize.body, marginTop: 4, marginBottom: spacing.lg },
  input: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52, fontSize: fontSize.body },
});
