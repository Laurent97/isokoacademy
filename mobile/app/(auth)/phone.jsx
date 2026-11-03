import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Btn, T } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import { errMsg } from '../../src/services/api';
import Logo from '../../src/components/Logo';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../../src/theme';

export default function Phone() {
  const { t } = useTranslation();
  const { theme } = useSettings();
  const { sendOTP } = useAuth();
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) { setError(t('error_generic')); return; }
    setBusy(true); setError(null);
    try {
      await sendOTP(`+250${digits.slice(-9)}`);
      router.push({ pathname: '/(auth)/otp', params: { phone: `+250${digits.slice(-9)}`, dob } });
    } catch (e) {
      setError(errMsg(e, t('error_generic')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Logo size="lg" style={{ alignSelf: 'center', marginBottom: spacing.xl }} />
          <Text style={[styles.title, { color: theme.text }]}>{t('phone_title')}</Text>
          <Text style={[styles.sub, { color: theme.textSecondary }]}>{t('phone_subtitle')}</Text>

          <View style={styles.phoneRow}>
            <View style={[styles.cc, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ color: theme.text, fontSize: fontSize.body }}>+250</Text>
            </View>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
              placeholder={t('phone_placeholder')}
              placeholderTextColor={theme.placeholder}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
            />
          </View>

          <Text style={[styles.sub, { color: theme.textSecondary, marginBottom: spacing.sm }]}>
            {t('dob_label')}
          </Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginBottom: spacing.lg }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.placeholder}
            keyboardType="numbers-and-punctuation"
            value={dob}
            onChangeText={setDob}
            maxLength={10}
          />

          {error && <T color={theme.error} style={{ marginBottom: spacing.md }}>{error}</T>}
          <Btn title={t('send_code')} onPress={submit} loading={busy} />
          <T size="caption" color={theme.textMuted} center style={{ marginTop: spacing.md }}>{t('dev_hint')}</T>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.headline, fontWeight: '800', marginBottom: spacing.sm },
  sub: { fontSize: fontSize.body, marginBottom: spacing.xl },
  phoneRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  cc: {
    minHeight: TOUCH_TARGET, paddingHorizontal: spacing.md, borderRadius: radius.sm,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1, minHeight: TOUCH_TARGET, borderWidth: 1, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, fontSize: fontSize.body,
  },
});
