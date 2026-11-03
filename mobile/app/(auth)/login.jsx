import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Btn, T } from '../../src/components/ui';
import Logo from '../../src/components/Logo';
import AuthBrand from '../../src/components/AuthBrand';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import { errMsg } from '../../src/services/api';
import { spacing, fontSize, radius } from '../../src/theme';

export default function Login() {
  const { theme, language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [emailBad, setEmailBad] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [done, setDone] = useState(false);

  const lockLeft = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));

  const submit = async () => {
    if (Date.now() < lockedUntil) { setError(`Too many attempts. Wait ${lockLeft}s.`); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailBad(true); return; }
    setBusy(true); setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      setDone(true);
      setTimeout(() => router.replace('/(tabs)'), 900);
    } catch (e) {
      const n = fails + 1;
      setFails(n);
      if (n >= 5) { setLockedUntil(Date.now() + 60000); setError(t('too_many_attempts')); }
      else setError(errMsg(e, t('forgot_password')));
    } finally {
      setBusy(false);
    }
  };

  const inp = (err) => [s.input, { borderColor: err ? theme.error : theme.border, color: theme.text, backgroundColor: theme.card }];

  const form = (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.topRow}>
        <Logo size="sm" />
        <TouchableOpacity onPress={() => setLanguage(language === 'en' ? 'rw' : 'en')} style={[s.langChip, { borderColor: theme.border }]}>
          <T size="caption" weight="700">{language === 'en' ? 'RW' : 'EN'}</T>
        </TouchableOpacity>
      </View>

      {done ? (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons name="checkmark-circle" size={72} color={theme.success} />
          <T size="title" weight="700" style={{ marginTop: spacing.md }}>{t('welcome_back_toast')}</T>
        </View>
      ) : (
        <>
          <Text style={[s.title, { color: theme.text }]}>{t('login_title')}</Text>
          <Text style={[s.sub, { color: theme.textSecondary }]}>{t('login_sub')}</Text>

          {error && (
            <View style={[s.banner, { borderColor: theme.warning, backgroundColor: 'rgba(217,119,6,0.08)' }]}>
              <Ionicons name="warning" size={18} color={theme.warning} />
              <T size="small" color={theme.warning} style={{ flex: 1, marginLeft: 8 }}>{error}</T>
            </View>
          )}

          <Text style={[s.label, { color: theme.textSecondary }]}>{t('email')}</Text>
          <TextInput style={inp(emailBad)} placeholder="you@example.com" placeholderTextColor={theme.placeholder}
            keyboardType="email-address" autoCapitalize="none" autoComplete="email"
            value={email} onChangeText={v => { setEmail(v); setEmailBad(false); }} />
          {emailBad && <T size="caption" color={theme.error} style={{ marginTop: 4 }}>{t('enter_valid_email')}</T>}

          <Text style={[s.label, { color: theme.textSecondary, marginTop: spacing.sm }]}>{t('password')}</Text>
          <View>
            <TextInput style={[inp(false), { paddingRight: 48 }]} placeholder="••••••••" placeholderTextColor={theme.placeholder}
              secureTextEntry={!show} value={password} onChangeText={setPassword} onSubmitEditing={submit} />
            <TouchableOpacity onPress={() => setShow(!show)} style={s.eye}>
              <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
            <TouchableOpacity onPress={() => setRemember(!remember)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={remember ? 'checkbox' : 'square-outline'} size={20} color={theme.primary} />
              <T size="small" style={{ marginLeft: 6 }}>{t('remember_me')}</T>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot')}>
              <T size="small" color={theme.primary} weight="600">{t('forgot_password')}</T>
            </TouchableOpacity>
          </View>

          <Btn title={lockLeft > 0 ? `Locked (${lockLeft}s)` : t('login_title')} onPress={submit}
            loading={busy} disabled={lockLeft > 0} style={{ marginTop: spacing.lg }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
            <T size="small" color={theme.textSecondary}>{t('new_to_isoko')} </T>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <T size="small" color={theme.primary} weight="700">{t('create_account')}</T>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {wide ? (
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1.2 }}>
              <AuthBrand headline="Welcome back to the market." sub="Log in to continue your progress." />
            </View>
            <View style={{ flex: 1 }}>{form}</View>
          </View>
        ) : (
          <>
            <AuthBrand compact headline="Welcome back." />
            {form}
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, maxWidth: 440, width: '100%', alignSelf: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  langChip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  title: { fontSize: fontSize.headline, fontWeight: '800' },
  sub: { fontSize: fontSize.body, marginTop: 4, marginBottom: spacing.lg },
  banner: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.md },
  label: { fontSize: fontSize.bodySmall, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52, fontSize: fontSize.body },
  eye: { position: 'absolute', right: 14, top: 16 },
});
