import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// SecureStore key for storing the token
const TOKEN_KEY = 'auth_token';

// Helper function to save token to SecureStore
const saveToken = async (token) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

// Helper function to remove token from SecureStore
const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// Zustand Store for Authentication
const useAuthStore = create((set) => ({
  // State
  token: null, // JWT token string
  user: null,  // User data (e.g., {id, email})
  isAuthLoading: true,
  
  // Actions
  
  // 1. 로그인 성공 처리: 토큰과 사용자 정보를 저장하고 SecureStore에 토큰 저장
  login: async (token, userData) => {
    set({ token, user: userData });
    await saveToken(token);
  },

  // 2. 로그아웃 처리: 상태와 SecureStore의 토큰 제거
  logout: async () => {
    set({ token: null, user: null });
    await removeToken();
  },

  // 3. 앱 시작 시 SecureStore에서 토큰을 로드하는 비동기 함수
  initialize: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        // TODO: storedToken을 사용하여 사용자 정보를 API에서 가져오는 로직 추가 필요
        // 현재는 토큰만 저장소에 설정합니다.
        set({ token: storedToken, user: null }); 
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to initialize auth store:", e);
      return false;
    }finally {
      set({ isAuthLoading: false }); 
      return success;
    }
  },
}));

export default useAuthStore;