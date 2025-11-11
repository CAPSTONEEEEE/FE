import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../src/config/client'; 
import { useLocalSearchParams } from 'expo-router';

const formatDate = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};
const fetchFestivalById = async (id) => {
  if (!id) return null;
  const { data } = await apiClient.get(`/festivals/${id}`);
  return data;
};
export default function FestivalDetailScreen() {
  const { id } = useLocalSearchParams(); 

  const { data: festival, isLoading, isError, error } = useQuery({
    queryKey: ['festival', id],
    queryFn: () => fetchFestivalById(id),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !festival) {
    console.error("API Error:", error);
    return (
      <View style={styles.center}>
        <Text>축제 정보를 불러오는 데 실패했습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* BE가 'image_url'을 줍니다. */}
      <Image 
        source={{ uri: festival.image_url || 'https://placehold.co/400x240/eee/ccc?text=No+Image' }} 
        style={styles.poster} 
      />
      <View style={styles.content}>
        {/* BE가 'title'을 줍니다. */}
        <Text style={styles.name}>{festival.title}</Text>
        {/* BE가 'location'을 줍니다. */}
        <Text style={styles.meta}>📍 {festival.location || '위치 정보 없음'}</Text>
        
        {/* 5. 날짜 포맷팅 함수 적용 */}
        <Text style={styles.meta}>
          🗓 {`${formatDate(festival.event_start_date)} ~ ${formatDate(festival.event_end_date)}`}
        </Text>
        
        <Text style={styles.sectionTitle}>소개</Text>
        
        {/* 6. 'description'이 아닌 'overview'를 사용합니다. */}
        <Text style={styles.description}>{festival.overview || '상세 정보가 없습니다.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  contentContainer: { 
    paddingBottom: 32 
  },
  poster: { 
    width: '100%', 
    height: 240, 
    backgroundColor: '#eee' 
  },
  content: { 
    padding: 16 
  },
  name: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  meta: { 
    fontSize: 15, 
    color: '#555', 
    marginBottom: 6,
    lineHeight: 22,
  },
  sectionTitle: { 
    marginTop: 20, 
    fontSize: 18, 
    fontWeight: '700',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  description: { 
    marginTop: 8, 
    fontSize: 16, 
    lineHeight: 24, 
    color: '#333' 
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});