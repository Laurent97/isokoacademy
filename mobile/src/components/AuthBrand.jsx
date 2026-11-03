import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Logo from './Logo';
import AnimatedCandles from './AnimatedCandles';
import { spacing, fontSize } from '../theme';

const GREEN = '#0F5132';

/**
 * Brand side of the split auth layout — headline, live candle loop, trust badges.
 * `compact` = mobile top-band variant.
 */
export default function AuthBrand({ headline, sub, compact }) {
  return (
    <View style={[s.panel, compact && s.compact]}>
      <Logo size={compact ? 'sm' : 'md'} variant="light" />
      <Text style={[s.headline, compact && { fontSize: 20 }]}>{headline}</Text>
      {!compact && <Text style={s.sub}>{sub}</Text>}
      <AnimatedCandles count={compact ? 10 : 16} height={compact ? 52 : 80} />
      <View style={s.badges}>
        {['No credit card required', 'Practice money only — real trading is separate', 'Bilingual: English · Kinyarwanda'].map(b => (
          <Text key={b} style={s.badge}>✓  {b}</Text>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  panel: { backgroundColor: GREEN, padding: spacing.xl, justifyContent: 'center', minHeight: 300 },
  compact: { paddingVertical: spacing.lg, minHeight: 0 },
  headline: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: spacing.md, lineHeight: 32 },
  sub: { color: 'rgba(255,255,255,0.72)', fontSize: fontSize.body, marginTop: 8, marginBottom: spacing.sm },
  badges: { marginTop: spacing.lg, gap: 6 },
  badge: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.bodySmall, fontWeight: '600' },
});
