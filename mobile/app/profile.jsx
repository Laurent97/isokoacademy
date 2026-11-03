import React from 'react';
import { ScrollView, View, Switch, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Card, T, Btn, Pill } from '../src/components/ui';
import { useSettings } from '../src/context/SettingsContext';
import { useAuth } from '../src/context/AuthContext';
import { spacing, fontSize, radius, TOUCH_TARGET } from '../src/theme';

export default function Profile() {
  const { t } = useTranslation();
  const { theme, language, setLanguage, darkMode, toggleDark, dataSaver, toggleDataSaver } = useSettings();
  const { user, logout } = useAuth();

  const Row = ({ label, right }) => (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      minHeight: TOUCH_TARGET, paddingVertical: spacing.sm,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    }}>
      <T weight="600">{label}</T>
      {right}
    </View>
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: t('profile') }} />
      <ScrollView>
        <Card style={{ marginBottom: spacing.md, alignItems: 'center' }}>
          <T size="title" weight="800">{user?.full_name || 'Learner'}</T>
          <T color={theme.textSecondary}>{user?.phone_number}</T>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <Pill label={t('your_level', { level: user?.current_level ?? 0 })} />
            <Pill label={t('total_xp', { xp: user?.total_xp ?? 0 })} color={theme.success} bg={theme.success + '22'} />
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Row label={t('language')} right={
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {['en', 'rw'].map(l => (
                <TouchableOpacity key={l} onPress={() => setLanguage(l)}
                  style={{
                    paddingHorizontal: spacing.md, height: 36, justifyContent: 'center',
                    borderRadius: radius.sm,
                    backgroundColor: language === l ? theme.primary : theme.surface,
                    borderWidth: 1, borderColor: theme.border,
                  }}>
                  <T weight="700" color={language === l ? '#fff' : theme.text}>{l.toUpperCase()}</T>
                </TouchableOpacity>
              ))}
            </View>
          } />
          <Row label={t('dark_mode')} right={
            <Switch value={darkMode} onValueChange={toggleDark} trackColor={{ true: theme.primary }} />
          } />
          <Row label={t('data_saver')} right={
            <Switch value={dataSaver} onValueChange={toggleDataSaver} trackColor={{ true: theme.primary }} />
          } />
          <T size="caption" color={theme.textMuted} style={{ marginTop: spacing.sm }}>{t('offline_note')}</T>
        </Card>

        <Btn title={t('logout')} variant="danger" onPress={async () => { await logout(); router.replace('/landing'); }} />
      </ScrollView>
    </Screen>
  );
}
