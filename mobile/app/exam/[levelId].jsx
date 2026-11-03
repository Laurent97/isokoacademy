import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, TextInput } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Btn, OptionRow, Pill } from '../../src/components/ui';
import { useSettings } from '../../src/context/SettingsContext';
import api, { errMsg } from '../../src/services/api';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../../src/theme';

export default function ExamScreen() {
  const { t } = useTranslation();
  const { theme, language } = useSettings();
  const { levelId } = useLocalSearchParams();
  const [phase, setPhase] = useState('intro'); // intro | active | done
  const [exam, setExam] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [ai, setAi] = useState({}); // idx -> {loading, text, askIn, answer}
  const askAi = async (idx, q) => {
    const msg = (ai[idx]?.askIn || '').trim();
    if (!msg) return;
    setAi(s => ({ ...s, [idx]: { ...s[idx], loading: true } }));
    try {
      const { data } = await api.post('/ai/chat', {
        message: `About this exam question "${q.question_en}" (correct answer: ${q.options_en?.[q.correct_index]}): ${msg}`
      });
      setAi(s => ({ ...s, [idx]: { ...s[idx], loading: false, answer: data.response, askIn: '' } }));
    } catch (e) {
      setAi(s => ({ ...s, [idx]: { ...s[idx], loading: false, answer: 'AI unavailable right now.' } }));
    }
  };
  const explainAi = async (idx, q) => {
    setAi(s => ({ ...s, [idx]: { loading: true } }));
    try {
      const { data } = await api.post('/ai/explain', {
        text: `Exam question: ${q.question_en}. Correct answer: ${q.options_en?.[q.correct_index]}. Explain simply why this answer is correct.`
      });
      setAi(s => ({ ...s, [idx]: { text: data.response } }));
    } catch (e) {
      setAi(s => ({ ...s, [idx]: { text: 'AI explanation unavailable right now.' } }));
    }
  };
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [secsLeft, setSecsLeft] = useState(0);
  const timer = useRef(null);
  const startedAt = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const start = async () => {
    setBusy(true); setError(null);
    try {
      const { data } = await api.post(`/exams/${levelId}/start`);
      setExam(data);
      setPhase('active');
      setIdx(0);
      setAnswers({});
      startedAt.current = Date.now();
      setSecsLeft(data.time_limit_minutes * 60);
      timer.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) { clearInterval(timer.current); submit(); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch (e) {
      setError(errMsg(e, t('error_generic')));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    clearInterval(timer.current);
    setBusy(true);
    try {
      const elapsed = Math.round((Date.now() - startedAt.current) / 1000);
      const { data } = await api.post(`/exams/${levelId}/submit`, {
        attempt_id: exam.attempt_id,
        responses: answers,
        time_taken_seconds: elapsed,
      });
      setResult(data);
      setPhase('done');
    } catch (e) {
      setError(errMsg(e, t('error_generic')));
    } finally {
      setBusy(false);
    }
  };

  const q = exam?.questions?.[idx];
  const answered = exam ? Object.keys(answers).length : 0;
  const mins = Math.floor(secsLeft / 60), secs = secsLeft % 60;

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam_title', { level: '' }) }} />

      {phase === 'intro' && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Card style={{ alignItems: 'center' }}>
            <T size="title" weight="800" center style={{ marginBottom: spacing.sm }}>{t('exam_title', { level: '' })}</T>
            <T color={theme.textSecondary} center style={{ marginBottom: spacing.lg }}>
              10 {t('exam_rules', { mark: 70, mins: 15, attempts: 3, hours: 24 }).split('-')[0]} - 15 min
            </T>
            {error && <T color={theme.error} style={{ marginBottom: spacing.md }}>{error}</T>}
            <Btn title={t('start_exam')} onPress={start} loading={busy} style={{ alignSelf: 'stretch' }} />
          </Card>
        </View>
      )}

      {phase === 'active' && q && (
        <View style={{ flex: 1 }}>
          {/* timer + progress */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <Pill label={`${idx + 1}/${exam.questions.length}`} />
            <Pill
              label={`${mins}:${String(secs).padStart(2, '0')}`}
              color={secsLeft < 60 ? theme.error : theme.primary}
              bg={(secsLeft < 60 ? theme.error : theme.primary) + '22'}
            />
          </View>

          <ScrollView style={{ flex: 1 }}>
            <T weight="700" size="title" style={{ marginBottom: spacing.lg }}>
              {language === 'rw' ? q.question_rw : q.question_en}
            </T>
            {(language === 'rw' ? q.options_rw : q.options_en).map((opt, oi) => (
              <OptionRow
                key={oi}
                label={opt}
                selected={answers[q.id] === oi}
                onPress={() => setAnswers({ ...answers, [q.id]: oi })}
              />
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm }}>
            {/* anti-cheat: no back-navigation during exams (v2 rule) */}
            {idx < exam.questions.length - 1 ? (
              <Btn title={t('next')} small onPress={() => setIdx(idx + 1)}
                disabled={answers[q.id] === undefined} style={{ flex: 1 }} />
            ) : (
              <Btn title={t('submit_exam')} variant="success" small loading={busy}
                disabled={answered < exam.questions.length}
                onPress={submit} style={{ flex: 1 }} />
            )}
          </View>
          {error && <T color={theme.error} center>{error}</T>}
        </View>
      )}

      {phase === 'done' && result && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Card style={{ alignItems: 'center', borderWidth: 2, borderColor: result.passed ? theme.success : theme.error }}>
            <T size="hero" style={{ fontSize: 56 }}>{result.passed ? '🎉' : '📖'}</T>
            <T size="headline" weight="800" color={result.passed ? theme.success : theme.error} style={{ marginVertical: spacing.sm }}>
              {Math.round(result.score)}%
            </T>
            <T color={theme.textSecondary} center style={{ marginBottom: spacing.lg }}>
              {result.passed
                ? t('exam_passed_msg', { level: '' })
                : t('exam_failed_msg', { score: Math.round(result.score), mark: result.pass_mark })}
            </T>
            <Btn title={t('done')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} style={{ alignSelf: 'stretch' }} />
          </Card>

          {Array.isArray(result.detail) && result.detail.map((q, i) => (
            <Card key={i} style={{ marginTop: spacing.sm, borderLeftWidth: 4, borderLeftColor: q.ok === false ? theme.error : theme.success }}>
              <T weight="700">{language === 'rw' ? q.question_rw : q.question_en}</T>
              <T size="small" color={theme.textSecondary} style={{ marginTop: spacing.xs }}>
                {t('correct_answer')}: {(language === 'rw' ? q.options_rw : q.options_en)?.[q.correct_index]}
              </T>
              {(language === 'rw' ? q.explanation_rw : q.explanation_en) ? (
                <T size="small" color={theme.textSecondary} style={{ marginTop: spacing.xs }}>
                  {language === 'rw' ? q.explanation_rw : q.explanation_en}
                </T>
              ) : null}
              <Btn title={t('ai_explain')} variant="secondary" small loading={ai[i]?.loading}
                onPress={() => explainAi(i, q)} style={{ marginTop: spacing.sm }} />
              {ai[i]?.text && <T size="small" color={theme.text} style={{ marginTop: spacing.xs }}>{ai[i].text}</T>}
              <TextInput
                style={{ borderWidth: 1, borderColor: theme.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, minHeight: 40, marginTop: spacing.sm, color: theme.text, backgroundColor: theme.card, fontSize: fontSize.body }}
                placeholder={t('ask_ai_placeholder')} placeholderTextColor={theme.placeholder}
                value={ai[i]?.askIn || ''}
                onChangeText={v => setAi(s => ({ ...s, [i]: { ...s[i], askIn: v } }))}
                onSubmitEditing={() => askAi(i, q)}
              />
              <Btn title={t('ask_ai')} variant="secondary" small loading={ai[i]?.loading}
                onPress={() => askAi(i, q)} style={{ marginTop: spacing.xs }} />
              {ai[i]?.answer && <T size="small" color={theme.text} style={{ marginTop: spacing.xs }}>{ai[i].answer}</T>}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
