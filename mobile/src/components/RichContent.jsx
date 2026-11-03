import React, { useState } from 'react';
import { Text, Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import { spacing, radius, fontSize, TOUCH_TARGET } from '../theme';
import { T } from './ui';

/**
 * Renders lesson content with <Term term="x">word</Term> markup as
 * tappable underlined terms that open a glossary pop-up (v2 rule #11).
 */
export default function RichContent({ children, style }) {
  const { theme, language } = useSettings();
  const [popup, setPopup] = useState(null); // { term, definition, loading }

  const parts = [];
  const re = /<Term term="([^"]+)">([^<]+)<\/Term>/g;
  let last = 0, m, key = 0;
  const text = String(children || '');
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', v: text.slice(last, m.index), key: key++ });
    parts.push({ type: 'term', term: m[1], v: m[2], key: key++ });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ type: 'text', v: text.slice(last), key: key++ });

  const openTerm = async (term) => {
    setPopup({ term, definition: null, loading: true });
    try {
      const { data } = await api.get(`/lessons/glossary?q=${encodeURIComponent(term)}`);
      const hit = data.terms.find(x => x.term.toLowerCase() === term.toLowerCase()) || data.terms[0];
      setPopup({
        term,
        definition: hit ? (language === 'rw' ? hit.definition_rw : hit.definition_en) : 'Definition not found',
        loading: false,
      });
    } catch {
      setPopup({ term, definition: 'Could not load definition (offline?)', loading: false });
    }
  };

  return (
    <>
      <Text style={[{ color: theme.text, fontSize: fontSize.body, lineHeight: 26 }, style]}>
        {parts.map(p =>
          p.type === 'term' ? (
            <Text
              key={p.key}
              onPress={() => openTerm(p.term)}
              style={{ color: theme.primary, textDecorationLine: 'underline', fontWeight: '600' }}
            >
              {p.v}
            </Text>
          ) : (
            <Text key={p.key}>{p.v}</Text>
          )
        )}
      </Text>

      <Modal visible={!!popup} transparent animationType="fade" onRequestClose={() => setPopup(null)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setPopup(null)}>
          <View style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T weight="800" size="title">{popup?.term}</T>
              <TouchableOpacity onPress={() => setPopup(null)} style={{ minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <T color={theme.textSecondary} style={{ marginTop: spacing.sm, lineHeight: 22 }}>
              {popup?.loading ? '...' : popup?.definition}
            </T>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.lg },
  sheet: { borderRadius: radius.lg, padding: spacing.lg },
});
