import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Btn, Pill } from '../../src/components/ui';
import TradingChart from '../../src/components/TradingChart';
import { useSettings } from '../../src/context/SettingsContext';
import api, { errMsg } from '../../src/services/api';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../../src/theme';

export default function Simulator() {
  const { t } = useTranslation();
  const { theme } = useSettings();
  const [pairs, setPairs] = useState([]);
  const [symbol, setSymbol] = useState('EUR/USD');
  const [quote, setQuote] = useState(null);
  const [candles, setCandles] = useState([]);
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const poll = useRef(null);

  const loadStatic = useCallback(async () => {
    try {
      const [p, acc, ord] = await Promise.all([
        api.get('/simulator/pairs'),
        api.get('/simulator/account'),
        api.get('/simulator/orders?status=all'),
      ]);
      setPairs(p.data.pairs);
      setAccount(acc.data);
      setOrders(ord.data.orders);
    } catch (e) {
      console.warn('sim load:', e.message);
    }
  }, []);

  const loadLive = useCallback(async (sym) => {
    const s = sym || symbol;
    try {
      const [c, q, ord, acc] = await Promise.all([
        api.get(`/simulator/candles?symbol=${encodeURIComponent(s)}&count=40`),
        api.get(`/simulator/price?symbol=${encodeURIComponent(s)}`),
        api.get('/simulator/orders?status=all'),
        api.get('/simulator/account'),
      ]);
      setCandles(c.data.candles);
      setQuote(q.data);
      setOrders(ord.data.orders);
      setAccount(acc.data);
    } catch (e) {
      console.warn('sim live:', e.message);
    }
  }, [symbol]);

  useFocusEffect(useCallback(() => {
    loadStatic();
    loadLive(symbol);
    poll.current = setInterval(() => loadLive(), 3000);
    return () => clearInterval(poll.current);
  }, [symbol]));

  const onRefresh = async () => { setRefreshing(true); await loadStatic(); await loadLive(); setRefreshing(false); };

  const closeOrder = async (id) => {
    try {
      await api.post(`/simulator/orders/${id}/close`);
      await loadLive();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const fmt = (v, d = 4) => v == null ? '-' : Number(v).toFixed(d);
  const open = orders.filter(o => o.order_status === 'filled');
  const activeOrder = open.find(o => o.symbol === symbol) || null;
  const pending = orders.filter(o => o.order_status === 'pending');
  const decimals = symbol === 'USD/JPY' || symbol === 'XAU/USD' ? 3 : 5;

  return (
    <Screen padded={false}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: spacing.md }}
      >
        {/* pair selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {pairs.map(p => (
            <TouchableOpacity key={p.symbol} onPress={() => setSymbol(p.symbol)}
              style={{
                paddingHorizontal: spacing.md, height: 40, justifyContent: 'center',
                borderRadius: radius.pill, marginRight: spacing.sm,
                backgroundColor: symbol === p.symbol ? theme.primary : theme.surface,
                borderWidth: 1, borderColor: symbol === p.symbol ? theme.primary : theme.border,
              }}>
              <T weight="600" color={symbol === p.symbol ? '#fff' : theme.text}>{p.symbol}</T>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* price + chart */}
        <Card style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <T size="title" weight="800">{symbol}</T>
            <View style={{ alignItems: 'flex-end' }}>
              <T size="title" weight="700" color={theme.text}>{quote ? fmt(quote.mid, decimals) : '...'}</T>
              <T size="caption" color={theme.textMuted}>
                {quote ? `${fmt(quote.bid, decimals)} / ${fmt(quote.ask, decimals)}` : ''}
              </T>
            </View>
          </View>
          <TradingChart
            symbol={symbol} tf="15m" height={240}
            sl={activeOrder?.stop_loss_price ? Number(activeOrder.stop_loss_price) : null}
            tp={activeOrder?.take_profit_price ? Number(activeOrder.take_profit_price) : null}
            onSltp={activeOrder ? async ({ sl, tp }) => {
              try {
                await api.patch(`/simulator/orders/${activeOrder.id}`, { stop_loss_price: sl, take_profit_price: tp });
                loadLive();
              } catch {}
            } : undefined}
          />
        </Card>

        {/* account strip */}
        {account && (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {[
              [t('balance'), `$${fmt(account.balance_usd, 2)}`],
              [t('equity'), `$${fmt(account.equity_usd, 2)}`],
              [t('floating_pl'), `$${fmt(account.floating_pl, 2)}`, account.floating_pl >= 0 ? theme.success : theme.error],
            ].map(([label, val, col], i) => (
              <Card key={i} style={{ flex: 1, padding: spacing.sm }}>
                <T size="caption" color={theme.textSecondary}>{label}</T>
                <T weight="700" color={col || theme.text}>{val}</T>
              </Card>
            ))}
          </View>
        )}

        <Btn title={t('new_trade')} onPress={() => router.push({ pathname: '/trade', params: { symbol } })}
          style={{ marginBottom: spacing.md }} />

        {/* open positions */}
        <T weight="700" style={{ marginBottom: spacing.sm }}>{t('open_positions')}</T>
        {open.length === 0 && <T color={theme.textMuted} style={{ marginBottom: spacing.md }}>{t('no_positions')}</T>}
        {open.map(o => (
          <Card key={o.id} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Pill label={o.order_side.toUpperCase()} color="#fff" bg={o.order_side === 'buy' ? theme.success : theme.error} />
                  <T weight="700">{o.symbol} · {o.lot_size} lots</T>
                </View>
                <T size="caption" color={theme.textSecondary}>
                  @ {fmt(o.entry_price, decimals)}{o.stop_loss_price ? ` · SL ${fmt(o.stop_loss_price, decimals)}` : ''}{o.take_profit_price ? ` · TP ${fmt(o.take_profit_price, decimals)}` : ''}
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T weight="800" color={(o.live_pl_usd ?? 0) >= 0 ? theme.success : theme.error}>
                  {(o.live_pl_usd ?? 0) >= 0 ? '+' : ''}{fmt(o.live_pl_usd, 2)}
                </T>
                <T size="caption" color={theme.textMuted}>{fmt(o.live_pl_pips, 1)} pips</T>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <Btn title={t('close_order')} variant="secondary" small style={{ flex: 1 }}
                onPress={() => closeOrder(o.id)} />
              <Btn title="½" variant="secondary" small
                onPress={async () => {
                  try {
                    await api.post(`/simulator/orders/${o.id}/close`, { lots: o.lot_size / 2 });
                    await loadLive();
                  } catch (e) { alert(errMsg(e)); }
                }} />
            </View>
          </Card>
        ))}

        {/* pending */}
        {pending.length > 0 && (
          <>
            <T weight="700" style={{ marginVertical: spacing.sm }}>{t('pending_orders')}</T>
            {pending.map(o => (
              <Card key={o.id} style={{ marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <T weight="600">{o.order_side.toUpperCase()} {o.symbol} @ {fmt(o.entry_price, decimals)}</T>
                  <T size="caption" color={theme.textMuted}>{o.order_type} · {o.lot_size} lots</T>
                </View>
                <TouchableOpacity onPress={async () => { await api.post(`/simulator/orders/${o.id}/cancel`); loadLive(); }}
                  style={{ minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close-circle" size={26} color={theme.error} />
                </TouchableOpacity>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
