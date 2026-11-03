import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, ProgressBar, Pill } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import api, { cachedGet } from '../../src/services/api';
import { spacing, fontSize } from '../../src/theme';

export default function Learn() {
  const { t } = useTranslation();
  const { theme, language } = useSettings();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await cachedGet('/lessons/levels');
      setData(data);
    } catch (e) {
      console.warn('learn load:', e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <Screen>
      <T size="headline" weight="800" style={{ marginBottom: spacing.lg }}>{t('levels_title')}</T>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
        {(data?.levels || []).map((lv) => {
          const pct = lv.lessons_total ? (lv.lessons_completed / lv.lessons_total) * 100 : 0;
          return (
            <TouchableOpacity
              key={lv.id}
              disabled={!lv.unlocked}
              onPress={() => router.push({ pathname: '/level/[levelId]', params: { levelId: lv.id } })}
            >
              <Card style={{ marginBottom: spacing.md, opacity: lv.unlocked ? 1 : 0.55 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: lv.unlocked ? theme.primary : theme.border,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {lv.unlocked
                        ? <T color="#fff" weight="800">{lv.level_number}</T>
                        : <Ionicons name="lock-closed" size={20} color={theme.textMuted} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <T weight="700">{language === 'rw' ? lv.title_rw : lv.title_en}</T>
                      <T size="caption" color={theme.textSecondary}>
                        {t('lessons_done', { done: lv.lessons_completed, total: lv.lessons_total })}
                      </T>
                    </View>
                  </View>
                  {lv.exam_passed && <Pill label={t('exam_passed')} color={theme.success} bg={theme.success + '22'} />}
                </View>
                {lv.unlocked && <ProgressBar value={pct} style={{ marginTop: spacing.sm }} color={lv.exam_passed ? theme.success : theme.primary} />}
              </Card>
            </TouchableOpacity>
          );
        })}
        {!data && <T color={theme.textMuted}>{t('loading')}</T>}
      </ScrollView>
    </Screen>
  );
}
