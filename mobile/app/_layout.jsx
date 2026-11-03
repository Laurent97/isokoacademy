import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../src/i18n';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import Logo from '../src/components/Logo';

function ThemedStack() {
  const { theme, darkMode } = useSettings();
  const { isAuthenticated, loading } = useAuth();

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.background },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="level/[levelId]" options={{ headerTitle: () => <Logo size="xs" animate={false} /> }} />
        <Stack.Screen name="lesson/[id]" options={{ headerTitle: () => <Logo size="xs" animate={false} /> }} />
        <Stack.Screen name="exam/[levelId]" options={{ headerTitle: () => <Logo size="xs" animate={false} /> }} />
        <Stack.Screen name="trade" options={{ headerTitle: () => <Logo size="xs" animate={false} />, presentation: 'modal' }} />
        <Stack.Screen name="glossary" options={{ headerTitle: () => <Logo size="xs" animate={false} /> }} />
        <Stack.Screen name="profile" options={{ headerTitle: () => <Logo size="xs" animate={false} /> }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <ThemedStack />
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
