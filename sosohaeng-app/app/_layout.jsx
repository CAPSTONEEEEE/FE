import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    // 제스처 핸들러와 SafeAreaProvider는 앱의 최상단에 위치하는 것이 좋습니다.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* 앱의 전체적인 흐름을 관리하는 Stack 네비게이터입니다. */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* '(tabs)' 그룹은 탭 네비게이터가 관리하는 화면들의 묶음입니다. */}
          <Stack.Screen name="(tabs)" />
          
          {/* 만약 탭 바를 완전히 덮는 새로운 화면(예: 상세 페이지)을 추가하고 싶다면 
            이곳에 정의하면 됩니다. 
            <Stack.Screen name="festival/[id]" />
          */}
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}