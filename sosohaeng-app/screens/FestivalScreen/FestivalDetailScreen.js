import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient'; // apiClient 경로는 실제 프로젝트에 맞게 확인해주세요.
import { useLocalSearchParams } from 'expo-router';

/**
 * 특정 ID의 축제 상세 정보를 백엔드로부터 가져오는 비동기 함수입니다.
 */
const fetchFestivalById = async (id) => {
  if (!id) return null;
  const { data: rawFestival } = await apiClient.get(`/festivals/${id}`);
  if (!rawFestival) return null;
  return {
    // FE가 기대하는 이름 = BE가 주는 이름
    id: rawFestival.contentid, 
    title: rawFestival.title,
    location: rawFestival.addr1,        
    event_start_date: rawFestival.eventstartdate, 
    event_end_date: rawFestival.eventenddate,   
    image_url: rawFestival.firstimage,  
    mapx: rawFestival.mapx,
    mapy: rawFestival.mapy,
    description: rawFestival.description
  };
};

// 2. props로 받던 '{ id }'를 제거합니다.
export default function FestivalDetailScreen() {
  
  // 3. hook을 사용해 URL에서 'id'를 가져옵니다.
  const { id } = useLocalSearchParams(); 

  const { data: festival, isLoading, isError, error } = useQuery({
    queryKey: ['festival', id],
    queryFn: () => fetchFestivalById(id), // 👈 이제 이 'id'는 URL에서 온 값입니다.
    enabled: !!id,
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
      <Image source={{ uri: festival.image_url }} style={styles.poster} />
      <View style={styles.content}>
        <Text style={styles.name}>{festival.title}</Text>
        <Text style={styles.meta}>📍 {festival.location}</Text>
        <Text style={styles.meta}>🗓 {`${festival.event_start_date} ~ ${festival.event_end_date}`}</Text>
        <Text style={styles.sectionTitle}>소개</Text>
        <Text style={styles.description}>{festival.description || '상세 정보가 없습니다.'}</Text>
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
