// app/(tabs)/recommend/[cityTitle].jsx

import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

// ⭐️ 컴포넌트 임포트 경로 확인 ⭐️
import RecommendDetailScreen from '../../../screens/RecommendDetailScreen'; 

export default function RecommendDetailRoute() {
  // 1. URL로부터 cityTitle 파라미터를 추출합니다.
  const params = useLocalSearchParams();
  const { cityTitle } = params;
  
  const title = cityTitle ? `${cityTitle} 상세 추천` : '여행지 상세 추천';

  if (!cityTitle) {
    // cityTitle이 없는 경우 (라우팅 오류)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>데이터 로딩 오류: 도시 이름을 찾을 수 없습니다.</Text>
        <Text style={styles.errorTextSmall}>잘못된 경로로 접근했습니다.</Text>
      </View>
    );
  }

  return (
    <>
      {/* 2. 헤더의 제목을 동적으로 설정합니다. */}
      <Stack.Screen options={{ 
        headerShown: true, 
        title: title 
      }} />
      
      {/* 3. 추출한 cityTitle을 prop으로 전달합니다. */}
      <RecommendDetailScreen cityTitle={cityTitle} />
    </>
  );
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fdd',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d00',
    },
    errorTextSmall: {
        marginTop: 10,
        color: '#d00',
    },
});