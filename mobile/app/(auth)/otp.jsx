import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Btn, T } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import { errMsg } from '../../src/services/api';
import Logo from '../../src/components/Logo';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../../src/theme';

export default function Otp() {
  const { t } = useTranslation();
  const { theme } = useSettings();
  const { verifyOTP, sendOTP } = useAuth();
  const { phone, dob } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const input = useRef(null);

  const submit = async (value = code) => {
    if (value.length !== 6) return;
    setBusy(true); setError(null);
    try {
      await verifyOTP(phone, value, dob);
      router.replace('/(tabs)');
    } catch (e) {
      setError(errMsg(e, t('error_generic')));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try { await sendOTP(phone); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Logo size="md" style={{ alignSelf: 'center', marginBottom: spacing.xl }} />
          <Text style={[styles.title, { color: theme.text }]}>{t('otp_title')}</Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>{t('otp_subtitle', { phone })}</Text>

          <TextInput
            ref={input}
            style={[styles.codeInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
            placeholder="••••••"
            placeholderTextColor={theme.placeholder}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(v) => { setCode(v.replace(/\D/g, '')); if (v.length === 6) submit(v); }}
            autoFocus
          />

          {error && <T color={theme.error} style={{ marginBottom: spacing.md }}>{error}</T>}
          <Btn title={t('verify')} onPress={() => submit()} loading={busy} disabled={code.length !== 6} />

          <TouchableOpacity onPress={resend} style={{ marginTop: spacing.lg, minHeight: TOUCH_TARGET, justifyContent: 'center' }}>
            <T color={theme.primary} center>{t('resend')}</T>
          </TouchableOpacity>
          <T size="caption" color={theme.textMuted} center>{t('dev_hint')}</T>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.headline, fontWeight: '800', marginBottom: spacing.sm },
  sub: { fontSize: fontSize.body, marginBottom: spacing.xl },
  codeInput: {
    minHeight: 64, borderWidth: 1, borderRadius: radius.sm, textAlign: 'center',
    fontSize: 28, letterSpacing: 12, marginBottom: spacing.lg,
  },
});
