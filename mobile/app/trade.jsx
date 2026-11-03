import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Btn, Pill } from '../src/components/ui';
import { useSettings } from '../src/context/SettingsContext';
import api, { errMsg } from '../src/services/api';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../src/theme';

const LOTS = [0.01, 0.05, 0.1, 0.5, 1.0];

export default function TradeTicket() {
  const { t } = useTranslation();
  const { theme } = useSettings();
  const { symbol = 'EUR/USD' } = useLocalSearchParams();
  const [side, setSide] = useState('buy');
  const [lots, setLots] = useState(0.01);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [journal, setJournal] = useState('');
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [emotion, setEmotion] = useState(null); // calm | chasing | angry
  const [warnings, setWarnings] = useState([]);

  const decimals = symbol === 'USD/JPY' || symbol === 'XAU/USD' ? 3 : 5;
  const pipDec = symbol === 'USD/JPY' || symbol === 'XAU/USD' ? 2 : 4;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/simulator/price?symbol=${encodeURIComponent(symbol)}`);
        setQuote(data);
      } catch (e) { /* keep modal usable */ }
    })();
  }, [symbol]);

  const price = quote ? (side === 'buy' ? quote.ask : quote.bid) : null;

  // R:R preview
  const rr = (() => {
    const s = parseFloat(sl), p = parseFloat(tp);
    if (!price || !s || !p) return null;
    const risk = Math.abs(price - s), rew = Math.abs(p - price);
    return risk > 0 ? (rew / risk).toFixed(2) : null;
  })();

  const submit = async () => {
    // Emotion check-in (curriculum L3.2): block impulsive trades
    if (emotion !== 'calm') {
      setError(emotion
        ? 'You said you are not calm. Take a break - do not trade while emotional.'
        : 'Complete the emotion check-in first.');
      return;
    }
    setBusy(true); setError(null);
    try {
      const { data } = await api.post('/simulator/orders', {
        symbol, side, lot_size: lots, type: 'market',
        stop_loss: sl ? Number(sl) : undefined,
        take_profit: tp ? Number(tp) : undefined,
        journal_entry: journal || undefined,
      });
      if (data.warnings?.length) setWarnings(data.warnings);
      else (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
      if (data.warnings?.length) setTimeout(() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')), 4000);
    } catch (e) {
      setError(errMsg(e, t('error_generic')));
    } finally {
      setBusy(false);
    }
  };

  const input = {
    borderWidth: 1, borderColor: theme.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, minHeight: TOUCH_TARGET,
    color: theme.text, backgroundColor: theme.card, fontSize: fontSize.body,
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: `${t('new_trade')} · ${symbol}` }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView>
          {/* side toggle */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {['buy', 'sell'].map(s => (
              <TouchableOpacity key={s} onPress={() => setSide(s)}
                style={{
                  flex: 1, minHeight: TOUCH_TARGET, borderRadius: radius.sm,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: side === s ? (s === 'buy' ? theme.success : theme.error) : theme.surface,
                  borderWidth: 1, borderColor: side === s ? 'transparent' : theme.border,
                }}>
                <T weight="800" color={side === s ? '#fff' : theme.text}>{t(s)}</T>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={{ marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between' }}>
            <T color={theme.textSecondary}>{symbol}</T>
            <T weight="700">{price ? price.toFixed(decimals) : '...'}</T>
          </Card>

          {/* lots */}
          <T size="small" color={theme.textSecondary} style={{ marginBottom: spacing.sm }}>{t('lot_size')}</T>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' }}>
            {LOTS.map(l => (
              <TouchableOpacity key={l} onPress={() => setLots(l)}
                style={{
                  paddingHorizontal: spacing.md, minHeight: 40, justifyContent: 'center',
                  borderRadius: radius.sm, borderWidth: 1,
                  backgroundColor: lots === l ? theme.primary : theme.surface,
                  borderColor: lots === l ? theme.primary : theme.border,
                }}>
                <T weight="600" color={lots === l ? '#fff' : theme.text}>{l}</T>
              </TouchableOpacity>
            ))}
          </View>

          <T size="small" color={theme.textSecondary}>{t('stop_loss')}</T>
          <TextInput style={[input, { marginBottom: spacing.sm, marginTop: 4 }]}
            placeholder={price ? (side === 'buy' ? price - 20 * 10 ** -pipDec : price + 20 * 10 ** -pipDec).toFixed(decimals) : ''}
            placeholderTextColor={theme.placeholder}
            keyboardType="decimal-pad" value={sl} onChangeText={setSl} />

          <T size="small" color={theme.textSecondary}>{t('take_profit')}</T>
          <TextInput style={[input, { marginBottom: spacing.sm, marginTop: 4 }]}
            placeholder={price ? (side === 'buy' ? price + 40 * 10 ** -pipDec : price - 40 * 10 ** -pipDec).toFixed(decimals) : ''}
            placeholderTextColor={theme.placeholder}
            keyboardType="decimal-pad" value={tp} onChangeText={setTp} />

          {rr && <Pill label={t('risk_reward', { rr })} style={{ marginBottom: spacing.sm }} />}

          <T size="small" color={theme.textSecondary}>{t('journal_label')}</T>
          <TextInput
            style={[input, { marginTop: 4, marginBottom: spacing.lg, minHeight: 80, textAlignVertical: 'top', paddingTop: spacing.sm }]}
            multiline value={journal} onChangeText={setJournal}
            placeholderTextColor={theme.placeholder} />

          {/* emotion check-in — required before every order (L3.2) */}
          <T size="small" color={theme.textSecondary} style={{ marginBottom: spacing.sm }}>How do you feel right now?</T>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {[['calm', '😌'], ['chasing', '😤'], ['angry', '😡']].map(([k, emoji]) => (
              <TouchableOpacity key={k} onPress={() => setEmotion(k)}
                style={{
                  flex: 1, minHeight: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: emotion === k ? (k === 'calm' ? theme.success : theme.warning) : theme.surface,
                  borderWidth: 1, borderColor: theme.border,
                }}>
                <T weight="600" color={emotion === k ? '#fff' : theme.text}>{emoji} {k}</T>
              </TouchableOpacity>
            ))}
          </View>

          {warnings.map((w, i) => (
            <Card key={i} style={{ marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: theme.warning }}>
              <T size="small" color={theme.warning}>{w.message}</T>
            </Card>
          ))}
          {error && <T color={theme.error} style={{ marginBottom: spacing.sm }}>{error}</T>}
          <Btn
            title={t('place_order', { side: t(side) })}
            variant={side === 'buy' ? 'success' : 'danger'}
            onPress={submit} loading={busy} disabled={!price}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
