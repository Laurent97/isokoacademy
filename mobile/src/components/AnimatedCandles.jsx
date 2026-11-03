import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/**
 * Looping candlestick draw-in for auth brand panels.
 * Candles stagger in left→right, hold, fade, repeat.
 */
export default function AnimatedCandles({ count = 16, height = 80, candleColor, wickColor }) {
  const vals = CANDLE_SETS[0];
  const anims = useRef(vals.map(() => new Animated.Value(0))).current;
  const wrap = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let alive = true;
    const run = () => {
      if (!alive) return;
      anims.forEach(a => a.setValue(0));
      wrap.setValue(1);
      Animated.sequence([
        Animated.stagger(45, anims.map(a =>
          Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }))),
        Animated.delay(2600),
        Animated.timing(wrap, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(({ finished }) => finished && run());
    };
    run();
    return () => { alive = false; };
  }, []);

  const up = candleColor || 'rgba(38,166,154,0.9)';
  const wick = wickColor || 'rgba(255,255,255,0.4)';
  const items = vals.slice(0, count);
  const max = Math.max(...items);

  return (
    <Animated.View style={[styles.row, { height, opacity: wrap }]}>
      {items.map((h, i) => (
        <Animated.View key={i} style={{
          width: 7, borderRadius: 2, height: 6 + (h / max) * height,
          backgroundColor: i % 3 === 2 ? '#D97706' : up,
          transform: [{ scaleY: anims[i] }], marginHorizontal: 2.5,
        }}>
          <View style={{ position: 'absolute', top: -6, bottom: -6, left: '50%', width: 1.2, backgroundColor: wick }} />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const CANDLE_SETS = [
  [3, 5, 4, 7, 6, 9, 8, 11, 9, 12, 10, 13, 12, 15, 13, 16, 15, 18, 16, 19],
];

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
});
