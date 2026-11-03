import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { light, dark } from '../theme';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();
const KEYS = { lang: 'settings.lang', dark: 'settings.dark', dataSaver: 'settings.dataSaver', onboarded: 'settings.onboarded' };

export const SettingsProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [language, setLanguageState] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [l, d, ds, ob] = await Promise.all(
          [KEYS.lang, KEYS.dark, KEYS.dataSaver, KEYS.onboarded].map(k => AsyncStorage.getItem(k))
        );
        if (l === 'en' || l === 'rw') { setLanguageState(l); i18n.changeLanguage(l); }
        setDarkMode(d === '1');
        setDataSaver(ds === '1');
        setOnboarded(ob === '1');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem(KEYS.lang, lang);
    if (isAuthenticated) {
      try { await api.put('/users/language', { language: lang }); } catch {}
    }
  };

  const toggleDark = async () => {
    const v = !darkMode; setDarkMode(v);
    await AsyncStorage.setItem(KEYS.dark, v ? '1' : '0');
  };

  const toggleDataSaver = async () => {
    const v = !dataSaver; setDataSaver(v);
    await AsyncStorage.setItem(KEYS.dataSaver, v ? '1' : '0');
  };

  const completeOnboarding = async () => {
    setOnboarded(true);
    await AsyncStorage.setItem(KEYS.onboarded, '1');
  };

  const theme = darkMode ? dark : light;

  return (
    <SettingsContext.Provider
      value={{ language, setLanguage, darkMode, toggleDark, dataSaver, toggleDataSaver, onboarded, completeOnboarding, theme, ready }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
