import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { API_URL } from '../services/api';

/**
 * TradingView-style chart — served by the backend as /chart.html and embedded
 * via iframe (web) or WebView (native). One implementation, all platforms.
 * onSltp({sl,tp}) fires when the user drags an SL/TP line.
 */
export default function TradingChart({ symbol = 'XAU/USD', tf = '15m', height = 320, replay, sl, tp, onSltp, onChartEvent, style }) {
  const base = API_URL.replace(/\/api\/?$/, '');
  const params = `symbol=${encodeURIComponent(symbol)}&tf=${tf}&api=${encodeURIComponent(base)}`
    + (replay ? `&replay=${encodeURIComponent(replay)}` : '')
    + (sl != null ? `&sl=${sl}` : '') + (tp != null ? `&tp=${tp}` : '');
  const src = `${base}/chart.html?${params}`;

  // web: listen for sltp drags from the iframe
  useEffect(() => {
    if (Platform.OS !== 'web' || !onSltp) return;
    const fn = (e) => {
      if (e.data?.type === 'sltp') onSltp?.({ sl: e.data.sl, tp: e.data.tp });
      if (e.data?.type === 'draw') onChartEvent?.(e.data);
    };
    window.addEventListener('message', fn);
    return () => window.removeEventListener('message', fn);
  }, [onSltp]);

  if (Platform.OS === 'web') {
    return (
      <View style={[{ height, borderRadius: 12, overflow: 'hidden' }, style]}>
        <iframe src={src} style={{ width: '100%', height: '100%', border: 'none' }} title="chart" />
      </View>
    );
  }
  const { WebView } = require('react-native-webview');
  return (
    <View style={[{ height, borderRadius: 12, overflow: 'hidden' }, style]}>
      <WebView
        source={{ uri: src }} style={{ flex: 1, backgroundColor: '#0C0A09' }} scrollEnabled={false}
        onMessage={(e) => {
          try { const m = JSON.parse(e.nativeEvent.data);
            if (m.type === 'sltp') onSltp?.({ sl: m.sl, tp: m.tp });
            if (m.type === 'draw') onChartEvent?.(m);
          } catch {}
        }}
      />
    </View>
  );
}
