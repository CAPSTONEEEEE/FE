// app/(tabs)/festivals/[id].jsx

import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import FestivalDetailScreen from '../../../screens/FestivalScreen/FestivalDetailScreen'; 
import { Text, View, StyleSheet } from 'react-native';

export default function FestivalDetailRoute() {
  // 1. URL로부터 id 값과 직렬화된 데이터(data)를 추출합니다.
  const params = useLocalSearchParams();
  const { id, data } = params;
  
  let festivalData = null;
  let distance = null;
  let title = '축제 상세 정보';

  try {
    if (data) {
      // 2. 직렬화된 JSON 문자열을 파싱합니다.
      const parsedData = JSON.parse(data);
      festivalData = parsedData.festival;
      distance = parsedData.distance;

      if (festivalData && festivalData.title) {
        title = festivalData.title;
      }
    }
  } catch (e) {
    console.error("Failed to parse festival data from router params:", e);
    // 데이터 파싱 실패 시, 에러 화면을 표시하여 사용자에게 알립니다.
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>데이터 로딩 오류: 축제 정보를 불러올 수 없습니다.</Text>
        <Text style={styles.errorTextSmall}>라우팅 데이터({id})가 유효하지 않습니다.</Text>
      </View>
    );
  }

  // 데이터가 성공적으로 파싱되었는지 확인 후 상세 컴포넌트 렌더링
  if (!festivalData) {
    // 파라미터는 받았지만 데이터가 없는 경우 (예: 로딩 중 또는 에러 발생 시)
     return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTextSmall}>축제 정보를 준비 중입니다...</Text>
      </View>
    );
  }

  return (
    <>
      {/* 3. 헤더의 제목을 동적으로 설정합니다. */}
      <Stack.Screen options={{ title: title }} />
      
      {/* 4. 추출한 festival 객체와 distance를 prop으로 전달합니다. */}
      <FestivalDetailScreen festival={festivalData} distance={distance} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});