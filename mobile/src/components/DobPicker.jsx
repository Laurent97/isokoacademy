import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { spacing, radius, fontSize } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 18 - 1939 }, (_, i) => thisYear - 18 - i); // 18+ only, newest first
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DobPicker({ value, onChange, label = 'Date of birth (18+)' }) {
  const { theme } = useSettings();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState({ y: 2000, m: 0, d: 1 });

  const commit = () => {
    onChange(`${sel.y}-${String(sel.m + 1).padStart(2, '0')}-${String(sel.d).padStart(2, '0')}`);
    setOpen(false);
  };

  const col = (items, key, fmt) => (
    <ScrollView style={s.col} showsVerticalScrollIndicator={false}>
      {items.map(it => {
        const v = typeof it === 'number' ? it : it;
        const active = sel[key] === (key === 'm' ? items.indexOf(it) : it);
        return (
          <TouchableOpacity key={v} onPress={() => setSel(p => ({ ...p, [key]: key === 'm' ? items.indexOf(it) : it }))}
            style={[s.cell, active && { backgroundColor: theme.primary }]}>
            <Text style={[s.cellTxt, { color: active ? '#fff' : theme.text }]}>{fmt ? fmt(it) : it}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)}
        style={[s.field, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
        <Text style={[s.fieldTxt, { color: value ? theme.text : theme.placeholder }]}>
          {value || label}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.backdrop}>
          <View style={[s.sheet, { backgroundColor: theme.card }]}>
            <Text style={[s.title, { color: theme.text }]}>Date of birth</Text>
            <Text style={[s.sub, { color: theme.textMuted }]}>You must be 18 or older</Text>
            <View style={s.row}>
              {col(YEARS, 'y')}
              {col(MONTHS, 'm')}
              {col(DAYS, 'd')}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <TouchableOpacity onPress={() => setOpen(false)} style={[s.btn, { borderColor: theme.border, borderWidth: 1 }]}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={commit} style={[s.btn, { backgroundColor: theme.primary, flex: 2 }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52 },
  fieldTxt: { fontSize: fontSize.body },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: spacing.lg },
  sheet: { borderRadius: radius.lg, padding: spacing.lg, maxWidth: 420, alignSelf: 'center', width: '100%' },
  title: { fontSize: fontSize.title, fontWeight: '800' },
  sub: { fontSize: fontSize.caption, marginTop: 2, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: 8, height: 220 },
  col: { flex: 1 },
  cell: { paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  cellTxt: { fontSize: fontSize.bodySmall },
  btn: { flex: 1, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
