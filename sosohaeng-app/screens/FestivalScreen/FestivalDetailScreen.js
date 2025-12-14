import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useFavoritesStore from '../../screens/stores/favoritesStore'; 

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.6;
const PLACEHOLDER_URL = 'https://placehold.co/600x360/eee/ccc?text=No+Image';

const formatDate = (dateStr) => {
  if (!dateStr) return '정보 없음';
  const str = String(dateStr); 
  if (str.length !== 8) return str;
  return `${str.substring(0, 4)}년 ${str.substring(4, 6)}월 ${str.substring(6, 8)}일`;
};

export default function FestivalDetailScreen() {
  const router = useRouter();
  
  // 1. URL 파라미터 받기
  const { id, data } = useLocalSearchParams(); 

  // 2. 데이터 파싱
  let paramsFestival = null;
  let paramsDistance = null;
  
  if (data) {
      try {
          const parsed = JSON.parse(data);
          paramsFestival = parsed.festival;
          paramsDistance = parsed.distance;
      } catch (e) {
          console.log("JSON Parse Error:", e);
      }
  }

  // 3. 스토어에서 백업 데이터 찾기
  const storeFestival = useFavoritesStore(state => 
    state.festivals.find(f => String(f.contentid || f.id || f.item_id) === String(id))
  );

  // 4. 사용할 데이터 결정
  const rawData = paramsFestival || storeFestival;

  // 5. 데이터 정규화 (Safe Parsing)
  const festival = useMemo(() => {
    if (!rawData) return null;
    return {
      ...rawData,
      // ID 보존
      contentid: rawData.contentid || rawData.id || rawData.item_id || id,
      // 주소/위치
      addr: rawData.location || rawData.addr1 || rawData.addr2 || '위치 정보 없음',
      // 날짜
      startDate: rawData.event_start_date || rawData.eventstartdate,
      endDate: rawData.event_end_date || rawData.eventenddate,
      // 이미지
      image: rawData.image_url || rawData.firstimage || rawData.firstimage2 || PLACEHOLDER_URL,
      // 제목
      title: rawData.title || '이름 없음'
    };
  }, [rawData, id]);

  const isFavorite = useFavoritesStore((state) => state.isFavorite(id, 'FESTIVAL'));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // 데이터가 로딩되지 않았거나 없을 때 처리
  if (!festival) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#000" />
        <Text style={styles.errorText}>데이터를 불러오는 중이거나 찾을 수 없습니다.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={{color:'#007AFF'}}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayDistance = paramsDistance || (festival.distance ? `${parseFloat(festival.distance).toFixed(1)}km` : null);

  const handleFavoritePress = async () => {
    // 찜 저장 시 원본 데이터를 사용하여 정보 손실 방지
    await toggleFavorite(rawData, 'FESTIVAL'); 
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image 
        source={{ uri: festival.image }} 
        style={styles.poster} 
        defaultSource={{ uri: PLACEHOLDER_URL }}
      />

      <TouchableOpacity 
        onPress={handleFavoritePress} 
        style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
      >
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#fff' : '#000'} />
        <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
          {isFavorite ? '찜 완료' : '찜하기'}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.name}>{festival.title}</Text>
        
        {displayDistance && displayDistance !== '거리 정보 없음' && (
            <Text style={styles.distanceText}>🚀 내 위치에서: {displayDistance}</Text>
        )}
        
        <View style={styles.infoRow}>
            <Text style={styles.metaLabel}>🗓 기간</Text>
            <Text style={styles.metaValue}>
              {festival.startDate ? `${formatDate(festival.startDate)} ~ ${formatDate(festival.endDate)}` : '기간 정보 없음'}
            </Text>
        </View>
        
        <View style={styles.infoRow}>
            <Text style={styles.metaLabel}>📍 위치</Text>
            <Text style={styles.metaValue}>{festival.addr}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  contentContainer: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#666', fontSize: 16, marginTop: 10 },
  poster: { width: width, height: IMAGE_HEIGHT, backgroundColor: '#eee' },
  content: { padding: 16, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10, marginTop: -10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  name: { fontSize: 26, fontWeight: '800', marginBottom: 10, color: '#333' },
  distanceText: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginBottom: 15 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  metaLabel: { fontSize: 15, fontWeight: 'bold', color: '#555', width: 60 },
  metaValue: { fontSize: 15, color: '#333', flex: 1 },
  favoriteButton: { position: 'absolute', top: IMAGE_HEIGHT - 25, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 5, elevation: 5, zIndex: 10 },
  favoriteActive: { backgroundColor: '#FF6347' },
  favoriteText: { fontWeight: 'bold', color: '#333', marginLeft: 5 },
  favoriteTextActive: { color: '#fff' }
});