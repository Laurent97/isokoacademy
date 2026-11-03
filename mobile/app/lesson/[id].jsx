import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Btn, OptionRow, Pill } from '../../src/components/ui';
import RichContent from '../../src/components/RichContent';
import ChartTask from '../../src/components/ChartTask';
import { useSettings } from '../../src/context/SettingsContext';
import api, { errMsg } from '../../src/services/api';
import { spacing, fontSize } from '../../src/theme';

export default function LessonScreen() {
  const { t } = useTranslation();
  const { theme, language } = useSettings();
  const { id, level } = useLocalSearchParams();
  const [lesson, setLesson] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get(`/lessons/${id}`);
      setLesson(data.lesson);
      setQuizzes(data.quizzes);
      if (data.lesson?.level_id) {
        api.get('/lessons').then(r => {
          const list = (r.data.lessons || []).filter(l => l.level_id === data.lesson.level_id);
          setSiblings(list);
        }).catch(() => {});
      }
      if (data.status === 'locked') {
        await api.post(`/lessons/${id}/start`, { level: Number(level) || 0 });
      }
    } catch (e) {
      setError(errMsg(e, t('error_generic')));
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const { data } = await api.post(`/lessons/${id}/complete`, { answers });
      setResult(data);
    } catch (e) {
      setError(errMsg(e, t('error_generic')));
    } finally {
      setBusy(false);
    }
  };

  const allAnswered = quizzes.length > 0 && quizzes.every(q => answers[q.id] !== undefined);
  const title = lesson ? (language === 'rw' ? lesson.title_rw : lesson.title_en) : '';
  const content = lesson ? (language === 'rw' ? lesson.content_rw : lesson.content_en) : '';
  const correctMap = {};
  (result?.results || []).forEach(r => { correctMap[r.quiz_id] = r.correct; });

  return (
    <Screen>
      <Stack.Screen options={{ title }} />
      <ScrollView>
        {error && <T color={theme.error} style={{ marginBottom: spacing.md }}>{error}</T>}
        {!lesson && !error && <T color={theme.textMuted}>{t('loading')}</T>}

        {lesson && (() => {
          const idx = siblings.findIndex(l => l.id === id);
          const next = idx >= 0 ? siblings[idx + 1] : null;
          const total = siblings.length;
          const pct = total && idx >= 0 ? Math.round(((idx + 1) / total) * 100) : null;
          return (
          <>
            {/* lesson progress strip */}
            {total > 0 && idx >= 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <T size="small" color={theme.textSecondary}>Lesson {idx + 1} of {total}</T>
                <View style={{ flex: 1, height: 4, backgroundColor: theme.border, borderRadius: 2, marginHorizontal: spacing.sm }}>
                  <View style={{ width: pct + '%', height: 4, backgroundColor: theme.primary, borderRadius: 2 }} />
                </View>
                <T size="caption" weight="700" color={theme.primary}>{pct}%</T>
              </View>
            )}
            <Card style={{ marginBottom: spacing.lg }}>
              <RichContent>{content}</RichContent>
            </Card>

            {/* interactive chart task — driven by the lesson title topic */}
            {(() => {
              const tLower = (title || '').toLowerCase();
              const drawn = (tool) => ev => ev.some(e => e.tool === tool);
              const has = (cond, ok, fail) => ev => cond(ev) ? { pass: true, feedback: ok } : { pass: false, feedback: fail };
              const task = tLower.includes('trend')
                ? { id: 'trend-line', prompt: 'Draw a trend line connecting at least two lows on the chart.', verify: has(drawn('trend'), 'Correct — trend lines connect higher lows in an uptrend.', 'No trend line drawn yet. Tap ╱ Trend, then tap two points.') }
                : tLower.includes('support') || tLower.includes('resistance')
                ? { id: 'sr-line', prompt: 'Place a support/resistance line at a key price level.', verify: has(drawn('hline'), 'Correct — S/R lines mark where price has reacted before.', 'No line placed. Tap ⌐ S/R, then tap a price level.') }
                : tLower.includes('fibonacci') || tLower.includes('fib')
                ? { id: 'fib', prompt: 'Mark the swing high and swing low with two S/R lines.', verify: has(ev => ev.filter(e => e.tool === 'hline').length >= 2, 'Two levels marked — that is how a fib grid is anchored.', 'Place two ⌐ S/R lines: one at the swing high, one at the swing low.') }
                : tLower.includes('rsi') || tLower.includes('indicator')
                ? { id: 'rsi-task', prompt: 'Turn on the RSI indicator and find where it crosses 70.', verify: ev => ev.some(e => e.tool === 'indicator') ? { pass: true, feedback: 'RSI above 70 = overbought. Below 30 = oversold.' } : { pass: false, feedback: 'Tap the RSI button in the chart toolbar first.' } }
                : tLower.includes('stop loss') || tLower.includes('risk')
                ? { id: 'sl-task', prompt: 'Add one S/R line where you would place a stop loss below support.', verify: has(drawn('hline'), 'Correct — the stop goes below the level you expect to hold.', 'Place a ⌐ S/R line below the last low — that is where the stop belongs.') }
                : null;
              return task ? (
                <Card style={{ marginBottom: spacing.lg }}>
                  <ChartTask task={task} symbol="XAU/USD" tf="15m" />
                </Card>
              ) : null;
            })()}

            {quizzes.map((q, i) => {
              const opts = language === 'rw' ? q.options_rw : q.options_en;
              const qres = result?.results?.find(r => r.quiz_id === q.id);
              return (
                <View key={q.id} style={{ marginBottom: spacing.lg }}>
                  <T weight="700" style={{ marginBottom: spacing.sm }}>
                    {i + 1}. {language === 'rw' ? q.question_rw : q.question_en}
                  </T>
                  {(opts || []).map((opt, oi) => {
                    const selected = answers[q.id] === opt;
                    const showResult = result && qres;
                    return (
                      <OptionRow
                        key={oi}
                        label={opt}
                        selected={selected}
                        disabled={!!result}
                        correct={showResult && qres.correct && selected}
                        wrong={showResult && !qres.correct && selected}
                        onPress={() => setAnswers({ ...answers, [q.id]: opt })}
                      />
                    );
                  })}
                  {result && qres && (
                    <T size="small" color={qres.correct ? theme.success : theme.error}>
                      {language === 'rw' ? qres.explanation_rw : qres.explanation_en}
                    </T>
                  )}
                </View>
              );
            })}

            {!result ? (
              <Btn
                title={t('complete_lesson')}
                disabled={!allAnswered}
                loading={busy}
                onPress={submit}
                style={{ marginBottom: spacing.xl }}
              />
            ) : (
              <Card style={{ marginBottom: spacing.xl, alignItems: 'center', borderColor: result.passed ? theme.success : theme.error, borderWidth: 2 }}>
                <Pill
                  label={result.passed ? t('quiz_passed', { xp: result.xp_earned }) : t('quiz_failed')}
                  color={result.passed ? theme.success : theme.error}
                  bg={(result.passed ? theme.success : theme.error) + '22'}
                />
                <T style={{ marginVertical: spacing.sm }}>{t('correct_count', { correct: result.correct, total: result.total })}</T>
                <Btn
                  title={result.passed ? t('done') : t('retry')}
                  variant={result.passed ? 'primary' : 'secondary'}
                  onPress={() => result.passed ? (router.canGoBack() ? router.back() : router.replace('/(tabs)')) : (setResult(null), setAnswers({}), load())}
                  style={{ alignSelf: 'stretch' }}
                />
              </Card>
            )}

            {/* learning aids row */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              <Btn title="AI Coach" variant="secondary" onPress={() => router.push('/(tabs)/coach')} style={{ flex: 1 }} />
              <Btn title="Glossary" variant="secondary" onPress={() => router.push('/glossary')} style={{ flex: 1 }} />
            </View>
            {next && (
              <Btn title={`Next lesson → ${language === 'rw' ? next.title_rw : next.title_en}`}
                onPress={() => router.replace(`/lesson/${next.id}`)}
                style={{ marginBottom: spacing.xl }} />
            )}
            {!next && siblings.length > 0 && (
              <Btn title="Finish level — take the exam →"
                onPress={() => router.replace(`/exam/${lesson.level_id}`)}
                style={{ marginBottom: spacing.xl }} />
            )}
          </>
          );
        })()}
      </ScrollView>
    </Screen>
  );
}
