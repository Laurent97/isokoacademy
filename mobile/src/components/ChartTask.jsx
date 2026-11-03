import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, Btn } from './ui';
import TradingChart from './TradingChart';
import { useSettings } from '../context/SettingsContext';
import { spacing, radius } from '../theme';

/**
 * Interactive lesson task — embeds the TradingChart + a task prompt + Check.
 * `task` = { id, prompt, verify(result) -> {pass, feedback} }
 * The chart reports interactions via onChartEvent (drawing placements etc.).
 */
export default function ChartTask({ task, symbol = 'XAU/USD', tf = '15m', replay, onDone }) {
  const { theme, language } = useSettings();
  const [result, setResult] = useState(null);
  const [events, setEvents] = useState([]);

  const check = () => {
    const r = task.verify ? task.verify(events) : { pass: true, feedback: '' };
    setResult(r);
    if (r.pass) onDone?.(task.id);
  };

  return (
    <View>
      <View style={[s.prompt, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="pencil" size={16} color={theme.primary} />
        <T size="small" weight="600" style={{ flex: 1, marginLeft: 8 }}>{task.prompt}</T>
      </View>
      <TradingChart symbol={symbol} tf={tf} height={280} replay={replay}
        onChartEvent={(e) => setEvents(p => [...p, e])} />
      <Btn title={result?.pass ? 'Done ✓' : 'Check'} onPress={check}
        variant={result?.pass ? 'secondary' : 'primary'} style={{ marginTop: spacing.sm }} />
      {result && !result.pass && (
        <View style={[s.fb, { backgroundColor: 'rgba(217,119,6,0.08)', borderColor: theme.warning }]}>
          <T size="small" color={theme.warning}>{result.feedback}</T>
        </View>
      )}
      {result?.pass && result.feedback && (
        <View style={[s.fb, { backgroundColor: 'rgba(21,128,61,0.08)', borderColor: theme.success }]}>
          <T size="small" color={theme.success}>{result.feedback}</T>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  fb: { borderWidth: 1, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm },
});
