import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Pill, Btn } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import api from '../../src/services/api';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../../src/theme';

export default function LevelDetail() {
  const { t } = useTranslation();
  const { theme, language } = useSettings();
  const { levelId } = useLocalSearchParams();
  const [lessons, setLessons] = useState([]);
  const [level, setLevel] = useState(null);
  const [elig, setElig] = useState(null);

  const load = useCallback(async () => {
    try {
      const [ls, el, lv] = await Promise.all([
        api.get(`/lessons/level/${levelId}`),
        api.get(`/exams/${levelId}/eligibility`),
        api.get('/lessons/levels'),
      ]);
      setLessons(ls.data.lessons);
      setElig(el.data);
      setLevel(lv.data.levels.find(x => x.id === levelId));
    } catch (e) {
      console.warn('level load:', e.message);
    }
  }, [levelId]);

  // refresh whenever the screen regains focus so lesson completions show up
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const allDone = lessons.length > 0 && lessons.every(l => l.status === 'completed');
  const title = level ? (language === 'rw' ? level.title_rw : level.title_en) : '';

  return (
    <Screen>
      <Stack.Screen options={{ title }} />
      <ScrollView>
        {lessons.map((l) => {
          const done = l.status === 'completed';
          const started = l.status === 'in_progress';
          return (
            <TouchableOpacity key={l.id}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: l.id, level: level?.level_number ?? 0 } })}>
              <Card style={{ marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons
                  name={done ? 'checkmark-circle' : started ? 'play-circle' : 'ellipse-outline'}
                  size={28}
                  color={done ? theme.success : theme.primary}
                />
                <View style={{ flex: 1 }}>
                  <T weight="600">{l.lesson_number}. {language === 'rw' ? l.title_rw : l.title_en}</T>
                  <T size="caption" color={theme.textMuted}>{l.duration_minutes} min</T>
                </View>
                {done && <Pill label={`+${l.xp_earned || 50} XP`} color={theme.success} bg={theme.success + '22'} />}
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* exam card */}
        {level && (
          <Card style={{ marginTop: spacing.md, borderLeftWidth: 4, borderLeftColor: theme.warning }}>
            <T weight="700" size="title">{t('exam_title', { level: level.level_number })}</T>
            <T size="small" color={theme.textSecondary} style={{ marginVertical: spacing.sm }}>
              {t('exam_rules', { mark: level.exam_pass_mark, mins: level.exam_time_limit_minutes, attempts: elig?.max_attempts ?? 3, hours: 24 })}
            </T>
            {elig?.passed
              ? <Pill label={t('exam_passed')} color={theme.success} bg={theme.success + '22'} />
              : elig?.cooldown_until
                ? <T color={theme.warning}>{t('cooldown', { time: new Date(elig.cooldown_until).toLocaleTimeString() })}</T>
                : (
                  <>
                    {!allDone && (
                      <T size="caption" color={theme.textMuted} style={{ marginBottom: spacing.sm }}>
                        {t('exam_needs_lessons', {
                          done: elig?.lessons_completed ?? 0,
                          total: elig?.lessons_total ?? lessons.length,
                        })}
                      </T>
                    )}
                    <Btn
                      title={t('take_exam')}
                      variant={allDone ? 'primary' : 'secondary'}
                      disabled={elig && !elig.can_start && !elig.in_progress_attempt_id}
                      onPress={() => router.push({ pathname: '/exam/[levelId]', params: { levelId } })}
                    />
                  </>
                )}
            {elig && !elig.passed && <T size="caption" color={theme.textMuted} style={{ marginTop: spacing.sm }}>
              {t('attempts_left', { left: Math.max(0, (elig.max_attempts || 3) - (elig.attempts_used || 0)) })}
            </T>}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
