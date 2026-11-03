import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../src/context/SettingsContext';
import { useAuth } from '../src/context/AuthContext';
import Logo from '../src/components/Logo';
import { Btn, T } from '../src/components/ui';
import { spacing, radius, fontSize } from '../src/theme';

// ---- hero mini candle chart: staggered draw-in ------------------------
const CANDLES = [4, 6, 5, 8, 7, 10, 9, 12, 8, 11, 13, 12, 15, 14, 17, 16, 19, 18, 21, 20, 23, 22, 25, 24];

function HeroChart() {
  const anims = useRef(CANDLES.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(28, anims.map(a =>
      Animated.timing(a, { toValue: 1, duration: 180, useNativeDriver: true })
    )).start();
  }, []);
  const max = Math.max(...CANDLES);
  return (
    <View style={styles.chartRow}>
      {CANDLES.map((h, i) => (
        <Animated.View key={i} style={{
          width: 8, borderRadius: 3, height: 8 + (h / max) * 90,
          backgroundColor: i % 3 === 2 ? '#EF5350' : '#26A69A',
          transform: [{ scaleY: anims[i] }], marginHorizontal: 3,
        }} />
      ))}
    </View>
  );
}

// ---- infinite market ticker -------------------------------------------
const TICKER = [
  ['EUR/USD', '1.1206', '+0.12%'], ['XAU/USD', '3,931.90', '+1.24%'],
  ['GBP/USD', '1.2718', '-0.08%'], ['USD/JPY', '149.32', '+0.34%'], ['USD/RWF', '1,432.00', '+0.01%'],
];
function Ticker() {
  const x = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const W = 760;
  useEffect(() => {
    Animated.loop(Animated.timing(x, { toValue: -W, duration: 30000, useNativeDriver: true })).start();
  }, []);
  const row = TICKER.map(([s, p, c]) => (
    <Text key={s} style={styles.tick}>
      {s} <Text style={{ fontFamily: 'monospace' }}>{p}</Text>{' '}
      <Text style={{ color: c.startsWith('+') ? '#15803D' : '#B91C1C' }}>{c}</Text>
      {'   ·   '}
    </Text>
  ));
  return (
    <View style={styles.tickerWrap}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
        {row}{row}
      </Animated.View>
    </View>
  );
}

// ---- scroll-in reveal ---------------------------------------------------
function Reveal({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[style, {
      opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
    }]}>{children}</Animated.View>
  );
}

export default function Landing() {
  const { theme } = useSettings();
  const { isAuthenticated } = useAuth();
  const float = useRef(new Animated.Value(0)).current;
  const [price, setPrice] = useState(0);

  useEffect(() => {
    // floating product card
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 3000, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 3000, useNativeDriver: true }),
    ])).start();
    // price count-up
    const start = Date.now();
    const iv = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 900);
      setPrice(3931.9 * t);
      if (t >= 1) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, []);

  const goAuth = () => router.push(isAuthenticated ? '/(tabs)' : '/(auth)/login');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      {/* sticky-ish header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Logo size="sm" animate={false} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.ghost}>
            <Text style={{ color: theme.primary, fontWeight: '700' }}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={[styles.fill, { backgroundColor: theme.primary }]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Start free</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {/* HERO */}
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>FOR RWANDA</Text>
            <Text style={[styles.h1, { color: theme.text }]}>Learn to trade the market.</Text>
            <Text style={[styles.h1, { color: '#D97706', fontStyle: 'italic' }]}>Without the risk.</Text>
            <Text style={[styles.sub, { color: theme.textSecondary }]}>
              Practice forex and gold on real market data. Pass level exams. Get AI feedback on every trade. No real money, ever.
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.md }}>
              <Btn title="Start learning free →" onPress={() => router.push('/(auth)/signup')} />
            </View>
            <Text style={{ color: theme.textMuted, marginTop: spacing.sm, fontSize: fontSize.bodySmall }}>
              ✓ No credit card   ✓ Free forever plan   ✓ Bilingual EN / RW
            </Text>
          </View>

          {/* floating product preview */}
          <Animated.View style={[styles.preview, {
            transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [8, -8] }) }],
          }]}>
            <View style={styles.previewTop}>
              <Text style={{ color: '#A8A29E', fontSize: 12 }}>XAU/USD · Gold</Text>
              <Text style={{ color: '#15803D', fontSize: 12 }}>+1.24%</Text>
            </View>
            <Text style={styles.previewPrice}>${price.toFixed(2)}</Text>
            <HeroChart />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={[styles.buyBtn, { backgroundColor: '#15803D' }]}><Text style={styles.buyTxt}>Buy 0.10</Text></View>
              <View style={[styles.buyBtn, { backgroundColor: '#3F3F46' }]}><Text style={styles.buyTxt}>Sell 0.10</Text></View>
            </View>
          </Animated.View>
        </View>

        <Ticker />

        {/* HOW IT WORKS */}
        <View style={{ padding: spacing.lg }}>
          {[['01', 'Learn', 'Short lessons from "what is forex" to "the 1% rule". 5 minutes each.'],
            ['02', 'Practice', 'Trade gold and forex on real market data. Blow your sandbox 10 times — it\'s free.'],
            ['03', 'Prove', 'Pass level exams. Get AI feedback on mistakes. Earn a verifiable certificate.']
          ].map(([n, h, b], i) => (
            <Reveal key={n} delay={i * 140} style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.stepNum, { color: theme.primary }]}>{n}</Text>
              <View style={{ flex: 1 }}>
                <T weight="800" size="title">{h}</T>
                <T size="small" color={theme.textSecondary} style={{ marginTop: 4 }}>{b}</T>
              </View>
            </Reveal>
          ))}
        </View>

        {/* PRICING */}
        <View style={{ padding: spacing.lg, paddingTop: 0 }}>
          <T size="headline" weight="800" style={{ marginBottom: spacing.md }}>Simple pricing</T>
          {[['Free', '0 RWF', '3 levels · sandbox · limited AI', false],
            ['Learner', '5,000 RWF/mo', 'All levels · unlimited refills · full AI · certificates', true],
            ['Pro', '15,000 RWF/mo', 'Everything + readiness score + mentor reviews', false],
          ].map(([name, price, feats, hot]) => (
            <View key={name} style={[styles.plan, {
              backgroundColor: theme.card, borderColor: hot ? theme.primary : theme.border,
              borderWidth: hot ? 2 : 1,
            }]}>
              {hot && <View style={[styles.badge, { backgroundColor: theme.primary }]}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>MOST POPULAR</Text></View>}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T weight="800" size="title">{name}</T>
                <T weight="800" size="title" color={theme.primary}>{price}</T>
              </View>
              <T size="small" color={theme.textSecondary} style={{ marginTop: 6 }}>{feats}</T>
            </View>
          ))}
        </View>

        {/* FINAL CTA */}
        <View style={[styles.cta, { backgroundColor: theme.primary }]}>
          <Text style={{ color: '#fff', fontSize: fontSize.headline, fontWeight: '800' }}>Start your first lesson today.</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>No risk. No credit card. Just learning.</Text>
          <TouchableOpacity onPress={goAuth} style={styles.ctaBtn}>
            <Text style={{ color: theme.primary, fontWeight: '800' }}>Start free</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: spacing.lg, alignItems: 'center' }}>
          <Logo size="sm" animate={false} style={{ opacity: 0.7 }} />
          <T size="caption" color={theme.textMuted} style={{ marginTop: spacing.sm, textAlign: 'center' }}>
            © 2026 Isoko Academy. Made in Kigali.{'\n'}Trading involves risk. We teach with virtual money — no investment advice.
          </T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1 },
  ghost: { paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center' },
  fill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, justifyContent: 'center' },
  hero: { padding: spacing.lg, paddingTop: spacing.xl },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  h1: { fontSize: 34, fontWeight: '800', lineHeight: 40 },
  sub: { fontSize: 16, lineHeight: 24, marginTop: spacing.sm },
  preview: { marginTop: spacing.xl, backgroundColor: '#1C1917', borderRadius: 20, padding: spacing.lg, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between' },
  previewPrice: { color: '#fff', fontSize: 28, fontWeight: '800', fontFamily: 'monospace', marginVertical: 8 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 100, marginVertical: spacing.sm },
  buyBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  buyTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tickerWrap: { overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.06)', paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.02)' },
  tick: { fontSize: 13, fontWeight: '600', color: '#444' },
  step: { flexDirection: 'row', gap: spacing.md, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  stepNum: { fontSize: 28, fontWeight: '800' },
  plan: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  cta: { margin: spacing.lg, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: spacing.md },
});
