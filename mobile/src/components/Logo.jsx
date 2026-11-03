import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const SIZES = { xs: { h: 22 }, sm: { h: 30 }, md: { h: 44 }, lg: { h: 64 }, xl: { h: 96 } };

/**
 * Isoko Academy wordmark. Picks the right asset for the active theme and
 * animates in (fade + slight scale) unless animate={false}.
 */
export default function Logo({ size = 'md', animate = true, style, variant, link = true }) {
  const { theme } = useSettings();
  const { isAuthenticated } = useAuth();
  const light = variant === 'light' || (!variant && theme.dark);
  const source = light
    ? require('../../assets/images/logo-dark.png')
    : require('../../assets/images/logo.png');
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(animate ? 0.92 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const h = SIZES[size]?.h || SIZES.md.h;
  const img = (
    <Animated.Image
      source={source}
      style={[{ height: h, width: h * 3.4, opacity, transform: [{ scale }] }, style]}
      resizeMode="contain"
    />
  );
  // logo → home: authed users go to tabs, public users to the landing page
  if (!link) return img;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Isoko Academy — go to home"
      onPress={() => router.push(isAuthenticated ? '/(tabs)' : '/landing')}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      hitSlop={8}
    >
      {img}
    </Pressable>
  );
}
