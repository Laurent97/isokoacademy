import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useSettings } from '../context/SettingsContext';

/**
 * Lightweight candlestick chart built with plain Views - no svg dependency.
 * candles: [{ o, h, l, c }] oldest first.
 */
export default function CandleChart({ candles = [], height = 180, bull, bear }) {
  const { theme } = useSettings();
  const up = bull || theme.success;
  const down = bear || theme.error;

  const { min, max } = useMemo(() => {
    if (!candles.length) return { min: 0, max: 1 };
    let lo = Infinity, hi = -Infinity;
    for (const c of candles) { lo = Math.min(lo, c.l); hi = Math.max(hi, c.h); }
    return { min: lo, max: hi };
  }, [candles]);

  const range = max - min || 1;
  const y = (v) => height - ((v - min) / range) * height;
  const n = candles.length || 1;

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'stretch', paddingVertical: 4 }}>
      {candles.map((c, i) => {
        const isUp = c.c >= c.o;
        const color = isUp ? up : down;
        const bodyTop = y(Math.max(c.o, c.c));
        const bodyH = Math.max(2, Math.abs(y(c.o) - y(c.c)));
        const wickTop = y(c.h);
        const wickH = Math.max(1, y(c.l) - y(c.h));
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ position: 'absolute', top: wickTop + 4, width: 1.5, height: wickH, backgroundColor: color }} />
            <View style={{
              position: 'absolute', top: bodyTop + 4, width: '70%', maxWidth: 10, minWidth: 3,
              height: bodyH, backgroundColor: color, borderRadius: 1,
            }} />
          </View>
        );
      })}
    </View>
  );
}
