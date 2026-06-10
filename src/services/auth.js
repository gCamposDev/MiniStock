import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  
  // DummyJSON pode retornar token como accessToken ou token
  const token = data.accessToken || data.token || '';
  
  if (token) {
    await AsyncStorage.setItem('@ministock:token', token);
  }
  await AsyncStorage.setItem('@ministock:user', JSON.stringify(data));
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem('@ministock:token');
  await AsyncStorage.removeItem('@ministock:user');
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem('@ministock:user');
  return raw ? JSON.parse(raw) : null;
}

export async function getStoredToken() {
  return AsyncStorage.getItem('@ministock:token');
}