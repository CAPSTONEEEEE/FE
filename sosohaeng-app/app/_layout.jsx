// app/_layout.jsx
import 'react-native-gesture-handler'; // ★ 반드시 가장 위에 있어야 함
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    // 제스처 핸들러와 SafeAreaProvider는 앱의 최상단에 위치해야 합니다.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* 앱 전체의 네비게이션 흐름을 관리하는 Stack 네비게이터 */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* '(tabs)' 그룹: 탭 네비게이터가 관리하는 메인 화면 묶음 */}
          <Stack.Screen name="(tabs)" />

          {/* 추가적인 전역 페이지(예: 상세 페이지)는 여기 등록 */}
          {/* 예시: <Stack.Screen name="festival/[id]" /> */}
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
