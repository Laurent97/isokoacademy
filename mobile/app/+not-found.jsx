import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen, Btn, T } from '../src/components/ui';
import Logo from '../src/components/Logo';
import { useSettings } from '../src/context/SettingsContext';
import { spacing, fontSize } from '../src/theme';

export default function NotFound() {
  const { theme } = useSettings();
  return (
    <Screen>
      <View style={s.wrap}>
        <Logo size="lg" />
        <T size="hero" weight="800" style={{ marginTop: spacing.lg }}>404</T>
        <T size="body" color={theme.textSecondary} style={{ textAlign: 'center', marginTop: spacing.sm }}>
          This page doesn't exist. Let's get you back.
        </T>
        <Btn title="Go home" onPress={() => router.replace('/landing')} style={{ marginTop: spacing.xl, minWidth: 200 }} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
