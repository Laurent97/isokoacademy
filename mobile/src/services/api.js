import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Resolve API base URL: env override > Expo host IP > platform defaults
function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:3100/api`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:3100/api';
  return 'http://localhost:3100/api';
}

export const API_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

// Offline-first GET: serve cached response when network fails, else fetch+cache
export async function cachedGet(path, { maxAgeMs = 24 * 3600e3 } = {}) {
  const key = `cache:${path}`;
  try {
    const res = await api.get(path);
    AsyncStorage.setItem(key, JSON.stringify({ t: Date.now(), d: res.data })).catch(() => {});
    return res;
  } catch (e) {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const { d } = JSON.parse(raw);
      return { data: d, fromCache: true };
    }
    throw e;
  }
}

export const errMsg = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.message || fallback;

export default api;
