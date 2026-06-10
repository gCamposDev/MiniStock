import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStoredToken, getStoredUser, login as loginService, logout as logoutService } from '../services/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const token = await getStoredToken();
        const storedUser = await getStoredUser();
        if (token && storedUser) {
          setUser(storedUser);
        }
      } catch (_) {}
      finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  async function login(username, password) {
    const data = await loginService(username, password);
    setUser(data);
    return data;
  }

  async function logout() {
    await logoutService();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
