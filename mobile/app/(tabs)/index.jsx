import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, ProgressBar, Btn, Pill } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
import { spacing, fontSize, radius } from '../../src/theme';

export default function Home() {
  const { t } = useTranslation();
  const { theme } = useSettings();
  const { user } = useAuth();
  const [levels, setLevels] = useState(null);
  const [account, setAccount] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [lv, acc] = await Promise.all([
        api.get('/lessons/levels'),
        api.get('/simulator/account'),
      ]);
      setLevels(lv.data);
      setAccount(acc.data);
    } catch (e) {
      console.warn('home load:', e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const current = levels?.levels?.find(l => l.level_number === levels.current_level);
  const firstName = (user?.full_name || '').split(' ')[0];
  const progress = current ? current.lessons_completed / Math.max(1, current.lessons_total) : 0;

  return (
    <Screen>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}>
        {/* header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <View>
            <T size="headline" weight="800">{firstName ? t('greeting', { name: firstName }) : t('greeting_default')}</T>
            <T color={theme.textSecondary}>{t('tagline')}</T>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={{ padding: spacing.sm }}>
            <Ionicons name="settings-outline" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* level card */}
        {current ? (
          <Card style={{ marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: theme.primary }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pill label={t('your_level', { level: current.level_number })} />
              <T color={theme.primary} weight="700">{t('total_xp', { xp: levels.total_xp || 0 })}</T>
            </View>
            <T size="title" weight="700" style={{ marginVertical: spacing.sm }}>
              {current.title_en}
            </T>
            <ProgressBar value={progress * 100} style={{ marginBottom: spacing.sm }} />
            <T size="small" color={theme.textSecondary} style={{ marginBottom: spacing.md }}>
              {t('lessons_done', { done: current.lessons_completed, total: current.lessons_total })}
            </T>
            <Btn
              title={t('continue_learning')}
              onPress={() => router.push({ pathname: '/level/[levelId]', params: { levelId: current.id } })}
            />
          </Card>
        ) : <Card style={{ marginBottom: spacing.md }}><T>{t('loading')}</T></Card>}

        {/* broker-ready banner (v2: readiness >=70 for 14 consecutive days) */}
        {levels?.broker_ready && (
          <Card style={{ marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: theme.success }}>
            <T weight="800" color={theme.success}>{t('broker_ready_title')}</T>
            <T size="small" color={theme.textSecondary} style={{ marginTop: 4 }}>{t('broker_ready_body')}</T>
          </Card>
        )}

        {/* stats row */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
          <Card style={{ flex: 1 }}>
            <T size="caption" color={theme.textSecondary}>{t('readiness')}</T>
            <T size="headline" weight="800" color={theme.primary}>{Math.round(levels?.readiness_score || 0)}%</T>
            {levels?.readiness_streak_days > 0 && (
              <T size="caption" color={theme.textMuted}>{levels.readiness_streak_days}/14 {t('streak_days')}</T>
            )}
          </Card>
          <Card style={{ flex: 1 }}>
            <T size="caption" color={theme.textSecondary}>{t('sandbox_balance')}</T>
            <T size="headline" weight="800">${(account?.equity_usd ?? 10000).toLocaleString()}</T>
          </Card>
        </View>

        {/* quick actions */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Btn title={t('glossary')} variant="secondary" style={{ flex: 1 }}
            onPress={() => router.push('/glossary')} />
          <Btn title={t('quick_trade')} style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/simulator')} />
        </View>
      </ScrollView>
    </Screen>
  );
}
