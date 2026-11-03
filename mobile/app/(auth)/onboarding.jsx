import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Btn } from '../../src/components/ui';
import Logo from '../../src/components/Logo';
import { useSettings } from '../../src/context/SettingsContext';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../../src/theme';

const { width } = Dimensions.get('window');
const SLIDES = [
  { key: '1', icon: '📚' },
  { key: '2', icon: '📈' },
  { key: '3', icon: '🎓' },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const { theme, language, setLanguage, completeOnboarding } = useSettings();
  const [page, setPage] = useState(0);
  const scroll = useRef(null);
  const last = page === SLIDES.length - 1;

  const go = (p) => {
    setPage(p);
    scroll.current?.scrollTo({ x: p * width, animated: true });
  };

  const finish = async () => {
    await completeOnboarding();
    router.replace('/landing');
  };

  return (
    <Screen>
      <Logo size="lg" style={{ alignSelf: 'center', marginVertical: spacing.md }} />
      {/* language toggle */}
      <View style={styles.langRow}>
        {['en', 'rw'].map((l) => (
          <TouchableOpacity key={l} onPress={() => setLanguage(l)}
            style={[styles.langBtn, { backgroundColor: language === l ? theme.primary : theme.border }]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{l === 'en' ? 'EN' : 'RW'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {SLIDES.map(({ key, icon }) => (
          <View key={key} style={{ width: width - spacing.md * 2, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            <Text style={{ fontSize: 80, marginBottom: spacing.xl }}>{icon}</Text>
            <Text style={[styles.slideTitle, { color: theme.text }]}>{t(`onb_${key}_title`)}</Text>
            <Text style={[styles.slideBody, { color: theme.textSecondary }]}>{t(`onb_${key}_body`)}</Text>
          </View>
        ))}
      </ScrollView>

      {/* dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === page ? theme.primary : theme.border }]} />
        ))}
      </View>

      <Btn
        title={last ? t('get_started') : t('next')}
        onPress={last ? finish : () => go(page + 1)}
      />
      <View style={{ height: spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  langRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 8 },
  langBtn: { width: TOUCH_TARGET, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  slideTitle: { fontSize: fontSize.headline, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },
  slideBody: { fontSize: fontSize.body, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
