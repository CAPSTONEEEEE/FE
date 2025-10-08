import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FestivalStackLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" // index.jsx 파일을 의미
        options={{
          headerShown: true, // 헤더를 보이게 설정
          title: '축제',
          // 찜 버튼을 헤더 오른쪽에 추가
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/favorites')}>
              <Ionicons name="heart-outline" size={24} color="#ff4d6d" style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen 
        name="[id]" // [id].jsx 파일을 의미
        options={{ 
          headerShown: true,
          title: '축제 상세 정보',
          // 상세 페이지에서는 찜 버튼을 숨기고 싶다면 headerRight: () => null 로 설정
        }} 
      />
    </Stack>
  );
}
