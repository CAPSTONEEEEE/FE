// FE/sosohaeng-app/src/config/api.js
import Constants from 'expo-constants';
import { Platform } from 'react-native';

let base = process.env.EXPO_PUBLIC_API_BASE_URL; // .env 우선

if (!base) {
  // Expo dev server의 host 정보에서 LAN IP 추정
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost; // ex) "192.168.0.67:8081"

  if (hostUri) {
    const host = hostUri.split(':')[0]; // 192.168.0.67
    base = `http://${host}:8000`;
  }
}

// 마지막 안전망(에뮬레이터 전용; 실기기에서는 작동 X)
if (!base) {
  base = Platform.select({
    ios: 'http://127.0.0.1:8000',
    android: 'http://10.0.2.2:8000',
    default: 'http://127.0.0.1:8000',
  });
}

export const API_BASE_URL = base;

console.log("✅ 현재 설정된 API_BASE_URL:", API_BASE_URL);