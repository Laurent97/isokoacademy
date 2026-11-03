import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../src/context/SettingsContext';
import Logo from '../../src/components/Logo';

const ICONS = {
  index: 'home',
  learn: 'book',
  simulator: 'trending-up',
  wallet: 'wallet',
  coach: 'chatbubble-ellipses',
};

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useSettings();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: () => <Logo size="xs" animate={false} />,
        headerTitleAlign: 'left',
        headerStyle: { backgroundColor: theme.card },
        headerShadowVisible: false,
        headerLeftContainerStyle: { paddingLeft: 16 },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={ICONS[route.name] || 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: t('tab_home') }} />
      <Tabs.Screen name="learn" options={{ title: t('tab_learn') }} />
      <Tabs.Screen name="simulator" options={{ title: t('tab_trade') }} />
      <Tabs.Screen name="wallet" options={{ title: t('tab_wallet') }} />
      <Tabs.Screen name="coach" options={{ title: t('tab_coach') }} />
    </Tabs>
  );
}
