import React, { useEffect, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Pill } from '../src/components/ui';
import { useSettings } from '../src/context/SettingsContext';
import api from '../src/services/api';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../src/theme';

export default function Glossary() {
  const { t } = useTranslation();
  const { theme, language } = useSettings();
  const [terms, setTerms] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/lessons/glossary${q ? `?q=${encodeURIComponent(q)}` : ''}`);
        setTerms(data.terms);
      } catch (e) {
        console.warn('glossary:', e.message);
      }
    })();
  }, [q]);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('glossary') }} />
      <TextInput
        style={{
          borderWidth: 1, borderColor: theme.border, borderRadius: radius.pill,
          paddingHorizontal: spacing.md, minHeight: TOUCH_TARGET, color: theme.text,
          backgroundColor: theme.card, marginBottom: spacing.md,
        }}
        placeholder={t('glossary')}
        placeholderTextColor={theme.placeholder}
        value={q}
        onChangeText={setQ}
      />
      <ScrollView>
        {terms.map(term => (
          <Card key={term.id} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T weight="700">{term.term}</T>
              {term.category && <Pill label={term.category} />}
            </View>
            <T size="small" color={theme.textSecondary} style={{ marginTop: 4, lineHeight: 22 }}>
              {language === 'rw' ? term.definition_rw : term.definition_en}
            </T>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
