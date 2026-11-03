import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Btn, T } from '../../src/components/ui';
import Logo from '../../src/components/Logo';
import AuthBrand from '../../src/components/AuthBrand';
import PasswordStrength, { pwScore, RULES } from '../../src/components/PasswordStrength';
import DobPicker from '../../src/components/DobPicker';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import { errMsg } from '../../src/services/api';
import { spacing, fontSize, radius } from '../../src/theme';

export default function Signup() {
  const { theme, language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const { signup } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', date_of_birth: '' });
  const [show, setShow] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [terms, setTerms] = useState(false);
  const [termsErr, setTermsErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [emailBad, setEmailBad] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const pwOk = RULES.every(([t]) => t(form.password));
  const confirmOk = form.confirm && form.confirm === form.password;
  const valid = form.full_name.trim() && /\S+@\S+\.\S+/.test(form.email) && pwOk && confirmOk;

  const submit = async () => {
    if (!/\S+@\S+\.\S+/.test(form.email)) { setEmailBad(true); return; }
    if (!valid) { setError(t('complete_fields')); return; }
    if (!terms) { setTermsErr(true); return; }
    setBusy(true); setError(null);
    try {
      await signup({
        email: form.email.trim().toLowerCase(), password: form.password,
        full_name: form.full_name.trim(), date_of_birth: form.date_of_birth || undefined,
      });
      setDone(true);
      setTimeout(() => router.replace('/(tabs)'), 1200);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const inp = (err) => [s.input, { borderColor: err ? theme.error : theme.border, color: theme.text, backgroundColor: theme.card }];

  const form_ = (
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
          <T size="title" weight="700" style={{ marginTop: spacing.md }}>{t('account_created')}</T>
          <T size="small" color={theme.textSecondary} style={{ marginTop: 6 }}>{t('welcome_to_isoko')}</T>
        </View>
      ) : (
        <>
          <Text style={[s.title, { color: theme.text }]}>{t('signup_title')}</Text>
          <Text style={[s.sub, { color: theme.textSecondary }]}>{t('signup_sub')}</Text>

          {error && (
            <View style={[s.banner, { borderColor: theme.warning, backgroundColor: 'rgba(217,119,6,0.08)' }]}>
              <Ionicons name="warning" size={18} color={theme.warning} />
              <T size="small" color={theme.warning} style={{ flex: 1, marginLeft: 8 }}>{error}</T>
            </View>
          )}

          <Text style={[s.label, { color: theme.textSecondary }]}>{t('full_name')}</Text>
          <TextInput style={inp(false)} placeholder="Aline Uwase" placeholderTextColor={theme.placeholder}
            autoComplete="name" value={form.full_name} onChangeText={set('full_name')} />

          <Text style={[s.label, { color: theme.textSecondary, marginTop: spacing.sm }]}>{t('email')}</Text>
          <TextInput style={inp(emailBad)} placeholder="you@example.com" placeholderTextColor={theme.placeholder}
            keyboardType="email-address" autoCapitalize="none" autoComplete="email"
            value={form.email} onChangeText={v => { set('email')(v); setEmailBad(false); }} />
          {emailBad && <T size="caption" color={theme.error} style={{ marginTop: 4 }}>{t('enter_valid_email')}</T>}

          <Text style={[s.label, { color: theme.textSecondary, marginTop: spacing.sm }]}>{t('password')}</Text>
          <View>
            <TextInput style={[inp(false), { paddingRight: 48 }]} placeholder="••••••••" placeholderTextColor={theme.placeholder}
              secureTextEntry={!show} autoComplete="new-password" value={form.password}
              onChangeText={set('password')} onFocus={() => setPwFocus(true)} onBlur={() => setPwFocus(false)} />
            <TouchableOpacity onPress={() => setShow(!show)} style={s.eye}>
              <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <PasswordStrength password={form.password} showChecklist={pwFocus} />

          {pwOk && (
            <>
              <Text style={[s.label, { color: theme.textSecondary, marginTop: spacing.sm }]}>{t('confirm_password')}</Text>
              <TextInput style={inp(form.confirm && !confirmOk)} placeholder="••••••••" placeholderTextColor={theme.placeholder}
                secureTextEntry={!show} value={form.confirm} onChangeText={set('confirm')} />
              {form.confirm && !confirmOk && <T size="caption" color={theme.error} style={{ marginTop: 4 }}>{t('passwords_no_match')}</T>}
            </>
          )}

          <Text style={[s.label, { color: theme.textSecondary, marginTop: spacing.sm }]}>{t('dob_optional')}</Text>
          <DobPicker value={form.date_of_birth} onChange={set('date_of_birth')} />

          <TouchableOpacity onPress={() => { setTerms(!terms); setTermsErr(false); }}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
            <Ionicons name={terms ? 'checkbox' : 'square-outline'} size={22} color={termsErr ? theme.error : theme.primary} />
            <T size="small" color={termsErr ? theme.error : theme.text} style={{ marginLeft: 8, flex: 1 }}>
              {t('terms_agree')}
            </T>
          </TouchableOpacity>
          {termsErr && <T size="caption" color={theme.error} style={{ marginTop: 4 }}>{t('required')}</T>}

          <Btn title={t('create_account')} onPress={submit} loading={busy} disabled={!valid}
            style={{ marginTop: spacing.md }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
            <T size="small" color={theme.textSecondary}>{t('have_account')} </T>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <T size="small" color={theme.primary} weight="700">{t('login')}</T>
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
              <AuthBrand headline="Start trading the market. Without the risk." sub="Join 2,000+ Rwandans learning to trade safely." />
            </View>
            <View style={{ flex: 1 }}>{form_}</View>
          </View>
        ) : (
          <>
            <AuthBrand compact headline="Start trading. Without the risk." />
            {form_}
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
  sub: { fontSize: fontSize.body, marginTop: 4, marginBottom: spacing.md },
  banner: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.md },
  label: { fontSize: fontSize.bodySmall, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52, fontSize: fontSize.body },
  eye: { position: 'absolute', right: 14, top: 16 },
});
