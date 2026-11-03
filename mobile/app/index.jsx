import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useSettings } from '../src/context/SettingsContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const { onboarded, ready, theme } = useSettings();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (loading || !ready) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.primaryDark }]}>
        <Animated.Image
          source={require('../assets/images/logo-dark.png')}
          style={[styles.logo, { opacity, transform: [{ scale: Animated.multiply(scale, pulse) }] }]}
          resizeMode="contain"
        />
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} size="large" />
        <Text style={styles.tag}>Learn. Practice. Trade smart.</Text>
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/landing" />;
  if (!onboarded) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 260, height: 86 },
  tag: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600', marginTop: 28, letterSpacing: 0.5 },
});
