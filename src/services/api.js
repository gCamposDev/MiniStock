import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
});

let _navigationRef = null;
export function setNavigationRef(ref) {
  _navigationRef = ref;
}

api.interceptors.request.use(
  async (config) => {
    if (!config.url.includes('/auth/login')) {
      const token = await AsyncStorage.getItem('@ministock:token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(new Error('Sem conexao, tente novamente.'));
    }
    const status = error.response && error.response.status;
    if (status === 401) {
      await AsyncStorage.removeItem('@ministock:token');
      await AsyncStorage.removeItem('@ministock:user');
      if (_navigationRef && _navigationRef.isReady()) {
        _navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
      return Promise.reject(new Error('Sessao expirada. Faca login novamente.'));
    }
    if (status === 404) {
      return Promise.reject(new Error('Recurso nao encontrado.'));
    }
    if (status >= 500) {
      return Promise.reject(new Error('Erro no servidor, tente novamente.'));
    }
    return Promise.reject(error);
  }
);
