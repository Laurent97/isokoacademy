import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Pill } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import api, { errMsg } from '../../src/services/api';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../../src/theme';

export default function Coach() {
  const { t } = useTranslation();
  const { theme } = useSettings();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState(null);
  const scroll = useRef(null);

  useEffect(() => {
    api.get('/ai/usage').then(({ data }) => setUsage(data)).catch(() => {});
  }, []);

  const send = async (text = input) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setBusy(true);
    try {
      const { data } = await api.post('/ai/chat', { message: msg });
      setMessages(m => [...m, { role: 'coach', text: data.response }]);
      setUsage(u => u ? { ...u, calls_remaining: data.calls_remaining } : u);
    } catch (e) {
      setMessages(m => [...m, { role: 'coach', text: errMsg(e, t('error_generic')), error: true }]);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const quick = async (kind) => {
    if (busy) return;
    const labels = { study_plan: t('study_plan'), explain_lesson: t('explain_lesson'), review_trade: t('review_trade') };
    setMessages(m => [...m, { role: 'user', text: labels[kind] }]);
    setBusy(true);
    try {
      const url = kind === 'study_plan' ? '/ai/study-plan' : kind === 'review_trade' ? '/ai/trade-review' : '/ai/explain';
      const body = kind === 'explain' ? { text: 'key trading concepts' } : {};
      const { data } = await api.post(url, body);
      setMessages(m => [...m, { role: 'coach', text: data.response }]);
      setUsage(u => u ? { ...u, calls_remaining: data.calls_remaining } : u);
    } catch (e) {
      setMessages(m => [...m, { role: 'coach', text: errMsg(e), error: true }]);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}
        keyboardVerticalOffset={90}>
        <View style={{ padding: spacing.md, paddingBottom: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <T size="headline" weight="800">{t('coach_title')}</T>
              <T size="caption" color={theme.textMuted}>{t('coach_subtitle')}</T>
            </View>
            {usage && <Pill label={t('calls_left', { n: usage.calls_remaining })} />}
          </View>
        </View>

        <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
          {/* quick actions */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' }}>
            {[['study_plan', 'calendar'], ['explain_lesson', 'bulb'], ['review_trade', 'analytics']].map(([k, icon]) => (
              <TouchableOpacity key={k} onPress={() => quick(k)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: theme.primaryLight, borderRadius: radius.pill,
                  paddingHorizontal: spacing.md, height: 36,
                }}>
                <Ionicons name={icon} size={16} color={theme.primary} />
                <T size="small" color={theme.primary} weight="600">{t(k === 'study_plan' ? 'study_plan' : k === 'review_trade' ? 'review_trade' : 'explain_lesson')}</T>
              </TouchableOpacity>
            ))}
          </View>

          {messages.map((m, i) => (
            <View key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', marginBottom: spacing.sm,
            }}>
              <View style={{
                backgroundColor: m.role === 'user' ? theme.primary : (m.error ? theme.error + '22' : theme.surface),
                borderRadius: radius.md, padding: spacing.md,
                borderWidth: m.role === 'coach' ? 1 : 0, borderColor: theme.border,
              }}>
                <T color={m.role === 'user' ? '#fff' : m.error ? theme.error : theme.text} size="small">
                  {m.text}
                </T>
              </View>
            </View>
          ))}
          {busy && <T color={theme.textMuted} size="small">{t('loading')}</T>}
        </ScrollView>

        {/* input */}
        <View style={{
          flexDirection: 'row', gap: spacing.sm, padding: spacing.md,
          borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.card,
        }}>
          <TextInput
            style={{
              flex: 1, minHeight: TOUCH_TARGET, borderWidth: 1, borderColor: theme.border,
              borderRadius: radius.pill, paddingHorizontal: spacing.md,
              color: theme.text, backgroundColor: theme.surface,
            }}
            placeholder={t('coach_placeholder')}
            placeholderTextColor={theme.placeholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
          />
          <TouchableOpacity onPress={() => send()} disabled={busy || !input.trim()}
            style={{
              width: TOUCH_TARGET, height: TOUCH_TARGET, borderRadius: TOUCH_TARGET / 2,
              backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
              opacity: busy || !input.trim() ? 0.5 : 1,
            }}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
