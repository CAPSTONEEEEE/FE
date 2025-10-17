// sosohaeng-app/context/AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@/src/config/api';

const STORAGE_TOKEN_KEY = 'accessToken';
const STORAGE_USER_KEY = 'user';
const BYPASS = process.env.EXPO_PUBLIC_BYPASS_LOGIN === '1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 앱 시작 시 복구 진행 여부

  // 앱 시작 시 저장된 토큰/유저 복구
  useEffect(() => {
    (async () => {
      try {
        const [tok, usr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
          AsyncStorage.getItem(STORAGE_USER_KEY),
        ]);
        if (tok) setAccessToken(tok);
        if (usr) setUser(JSON.parse(usr));
      } catch (e) {
        console.warn('Auth restore failed:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 개발용 로그인 우회 (플래그가 켜져 있고 아직 토큰이 없을 때만)
  useEffect(() => {
    (async () => {
      if (!isLoading && BYPASS && !accessToken) {
        const dummyUser = { id: 1, name: 'DevUser', email: 'dev@sosohaeng.app', role: 'dev' };
        const dummyToken = 'dev-bypass';
        setAccessToken(dummyToken);
        setUser(dummyUser);
        await AsyncStorage.setItem(STORAGE_TOKEN_KEY, dummyToken);
        await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(dummyUser));
        console.log('[Auth] BYPASS enabled: entered with dummy session');
      }
    })();
  }, [isLoading, accessToken]);

  // 기본 로그인 구현 (필요시 교체 가능)
  // 사용법: await signIn({ email, password })
  async function signIn({ email, password }) {
    try {
      // 팀 로그인 API 규약에 맞게 경로/필드가 다르면 여기만 바꾸면 됨
      // 예: POST /auth/login  {email, password} -> { access_token, user }
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // 404면 "Not Found" 같은 메시지가 올 수 있음
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      // 서버 응답 키 이름에 맞춰 여기만 맞추면 됨
      const token = data.access_token || data.token || data.accessToken;
      const userObj = data.user || { id: data.id, email: data.email, name: data.name };

      if (!token) throw new Error('No access token in response');

      setAccessToken(token);
      setUser(userObj);
      await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));

      return { ok: true };
    } catch (err) {
      console.warn('signIn failed:', err);
      Alert.alert('로그인 실패', err.message?.toString() ?? 'Unknown error');
      return { ok: false, error: err };
    }
  }

  async function signOut() {
    try {
      setAccessToken(null);
      setUser(null);
      await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY]);
    } catch (e) {
      console.warn('signOut failed:', e);
    }
  }

  const value = useMemo(
    () => ({
      isLoading,
      isSignedIn: !!accessToken,
      accessToken,
      user,
      setUser,      // 필요 시 프로필 갱신 가능
      signIn,
      signOut,
    }),
    [isLoading, accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
