import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatbotStackLayout() {
  return (
    // 챗봇 추천 기능을 위한 스택 네비게이터 정의
    <Stack>
      <Stack.Screen 
        // 챗봇 추천 메인 화면의 이름을 "index"로 가정합니다.
        name="index" 
        options={{
          headerShown: true, // 헤더 표시
          title: '여행지 추천 (챗봇)',
          // 찜 버튼을 헤더 오른쪽에 추가
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/favorites')}>
              {/* 축제 화면과 동일한 하트 아이콘 및 색상 사용 */}
              <Ionicons name="heart-outline" size={24} color="#ff4d6d" style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      {/* 챗봇 관련 다른 화면들이 있다면 여기에 추가될 수 있습니다. */}
    </Stack>
  );
}