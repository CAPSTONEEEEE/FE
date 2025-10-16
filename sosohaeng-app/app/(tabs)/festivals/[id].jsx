// app/(tabs)/festivals/[id].jsx

import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import FestivalDetailScreen from '../../../screens/FestivalScreen/FestivalDetailScreen'; // 실제 경로에 맞게 수정

export default function FestivalDetailRoute() {
  // 1. URL로부터 id 값을 추출합니다.
  const { id } = useLocalSearchParams();

  return (
    <>
      {/* 2. 헤더의 제목을 설정합니다. */}
      <Stack.Screen options={{ title: '근처 축제 정보' }} />
      
      {/* 3. 추출한 id를 FestivalDetailScreen 컴포넌트에 prop으로 전달합니다. */}
      <FestivalDetailScreen id={id} />
    </>
  );
}