import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Btn, Pill } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import api, { errMsg } from '../../src/services/api';
import { spacing, fontSize } from '../../src/theme';

export default function Wallet() {
  const { t } = useTranslation();
  const { theme } = useSettings();
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const [w, l] = await Promise.all([
        api.get('/auxx/wallet'),
        api.get('/auxx/ledger'),
      ]);
      setWallet(w.data);
      setLedger(l.data.entries);
    } catch (e) {
      console.warn('wallet load:', e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const [needsReview, setNeedsReview] = useState(false);

  const refill = async (confirmed = false) => {
    setBusy(true); setMsg(null);
    try {
      const { data } = await api.post('/auxx/refill-sandbox', confirmed ? { confirmed_review: true } : {});
      setMsg({ ok: true, text: data.message });
      setNeedsReview(false);
      await load();
    } catch (e) {
      if (e.response?.status === 428 || e.response?.data?.code === 'REVIEW_REQUIRED') {
        setNeedsReview(true);
        setMsg({ ok: false, text: e.response.data.review_lesson || e.response.data.error });
      } else {
        setMsg({ ok: false, text: errMsg(e) });
      }
    } finally {
      setBusy(false);
    }
  };

  const buy = async (usdt) => {
    setBusy(true); setMsg(null);
    try {
      const { data } = await api.post('/auxx/purchase', { amount_usdt: usdt });
      setMsg({ ok: true, text: `+${data.auxx_credited} AUXX` });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };

  const typeColor = { purchase: theme.success, bonus: theme.info, spend: theme.error, refund: theme.warning, penalty: theme.error };

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
        <T size="headline" weight="800" style={{ marginBottom: spacing.lg }}>{t('tab_wallet')}</T>

        <Card style={{ alignItems: 'center', marginBottom: spacing.md, backgroundColor: theme.primary }}>
          <T size="caption" color="#CFE3FF">{t('auxx_balance')}</T>
          <T size="hero" style={{ fontSize: 44 }} weight="800" color="#fff">
            {(wallet?.balance_auxx ?? 0).toLocaleString()}
          </T>
          <T color="#CFE3FF">{t('usdt_equiv', { usdt: wallet?.balance_usdt_equiv ?? 0 })}</T>
        </Card>

        {msg && (
          <Card style={{ marginBottom: spacing.md, borderColor: msg.ok ? theme.success : theme.error, borderWidth: 1 }}>
            <T color={msg.ok ? theme.success : theme.error}>{msg.text}</T>
          </Card>
        )}

        {/* sandbox refill */}
        <Card style={{ marginBottom: spacing.md }}>
          <T weight="700" style={{ marginBottom: 4 }}>{t('sandbox_balance')}</T>
          <T size="title" weight="800" color={theme.primary}>
            ${(wallet?.sandbox?.balance_usd ?? 0).toLocaleString()}
          </T>
          <T size="caption" color={theme.textMuted} style={{ marginBottom: spacing.sm }}>
            {t('refill_cost', { cost: wallet?.daily_free_reset_auxx ?? 2000 })}
          </T>
          {needsReview ? (
            <Btn title={t('review_trade') + ' ✓'} variant="primary" onPress={() => refill(true)} loading={busy} />
          ) : (
            <Btn title={t('refill_sandbox')} variant="secondary" onPress={() => refill(false)} loading={busy} />
          )}
        </Card>

        {/* buy auxx */}
        <Card style={{ marginBottom: spacing.md }}>
          <T weight="700" style={{ marginBottom: spacing.sm }}>{t('buy_auxx')}</T>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[5, 10, 25].map(usdt => (
              <Btn key={usdt} title={`$${usdt} → ${Math.floor(usdt / (wallet?.usdt_rate || 0.005)).toLocaleString()}`}
                variant="secondary" small style={{ flex: 1 }}
                onPress={() => buy(usdt)} disabled={busy} />
            ))}
          </View>
        </Card>

        {/* ledger */}
        <T weight="700" style={{ marginBottom: spacing.sm }}>{t('transactions')}</T>
        {ledger.map(e => (
          <Card key={e.id} style={{ marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Pill label={t(e.transaction_type)} color="#fff" bg={typeColor[e.transaction_type] || theme.info} />
              {e.description && <T size="caption" color={theme.textMuted} style={{ marginTop: 4 }}>{e.description}</T>}
            </View>
            <T weight="700" color={e.amount_auxx >= 0 ? theme.success : theme.error}>
              {e.amount_auxx >= 0 ? '+' : ''}{e.amount_auxx.toLocaleString()}
            </T>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
