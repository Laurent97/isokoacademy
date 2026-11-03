import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSession(); }, []);

  const loadSession = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phoneNumber, countryCode = '+250') => {
    const { data } = await api.post('/auth/send-otp', {
      phone_number: phoneNumber,
      country_code: countryCode,
    });
    return data;
  };

  const verifyOTP = async (phoneNumber, code, dateOfBirth) => {
    const { data } = await api.post('/auth/verify-otp', {
      phone_number: phoneNumber,
      code,
      ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
    });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const refreshProfile = async () => {
    const { data } = await api.get('/users/profile');
    const merged = { ...user, ...data.user, ...data.level };
    setUser(merged);
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    return merged;
  };

  const finishAuth = async (data) => {
    await AsyncStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await finishAuth(data);
    return data.user;
  };

  const signup = async ({ email, password, full_name, country, date_of_birth }) => {
    const { data } = await api.post('/auth/signup', { email, password, full_name, country, date_of_birth });
    await finishAuth(data);
    return data.user;
  };

  const forgotPassword = async (email) =>
    (await api.post('/auth/forgot-password', { email })).data;

  const resetPassword = async (token, password) =>
    (await api.post('/auth/reset-password', { token, password })).data;

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, sendOTP, verifyOTP, login, signup, forgotPassword, resetPassword, logout, refreshProfile, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
