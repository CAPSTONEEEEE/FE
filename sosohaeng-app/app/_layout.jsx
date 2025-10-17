// app/_layout.jsx
import 'react-native-gesture-handler'; // ★ 반드시 가장 위에
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// React Query + RN 연동
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnMount: false,
      refetchOnWindowFocus: true, // App foreground 시 refetch
      staleTime: 1000 * 30,       // 30s
    },
  },
});

export default function RootLayout() {
  // 온라인/포커스 상태를 React Query에 연결
  useEffect(() => {
    // 네트워크 상태 연동
    const unsubNet = NetInfo.addEventListener((state) => {
      onlineManager.setOnline(Boolean(state.isConnected));
    });

    // 앱 포커스 연동
    const onAppStateChange = (status) => {
      focusManager.setFocused(status === 'active');
    };
    const appStateSub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      unsubNet?.();
      appStateSub?.remove?.();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* 탭 스택 등 필요한 화면을 여기서 선언 */}
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}