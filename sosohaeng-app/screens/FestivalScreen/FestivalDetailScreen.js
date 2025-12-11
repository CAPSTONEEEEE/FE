import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import useFavoritesStore from '../../screens/stores/favoritesStore'; 

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.6;
const PLACEHOLDER_URL = 'https://placehold.co/600x360/eee/ccc?text=No+Image';

// 헬퍼 함수: 거리 포맷팅 (이전의 formatDistance 유틸리티 대체)
const formatDistance = (distance) => {
  if (distance === null || distance === undefined || isNaN(distance)) return '거리 정보 없음';
  
  const dist = parseFloat(distance);
  if (dist < 1) {
    return `${(dist * 1000).toFixed(0)}m`;
  }
  return `${dist.toFixed(1)}km`;
};
// 날짜 포맷팅 헬퍼 함수
const formatDate = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}년 ${dateStr.substring(4, 6)}월 ${dateStr.substring(6, 8)}일`;
};

export default function FestivalDetailScreen({ route, navigation, festival: propFestival }) {
  // 1. FavoritesScreen에서 넘겨준 id 받기
  const { id } = route?.params || {};

  // 2. 찜 스토어(데이터 저장소)에서 해당 id를 가진 축제 정보 찾기
  const storeFestival = useFavoritesStore(state => 
    state.festivals.find(f => (f.contentid || f.id) == id)
  );

  // 3. 사용할 데이터 결정
  const festival = propFestival || storeFestival;

  // 4. 찜 상태 확인 및 토글 함수
  const isFavorite = useFavoritesStore((state) => state.isFavorite(festival?.contentid || festival?.id, 'FESTIVAL'));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // 데이터가 없을 때 처리
  if (!festival) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>축제 상세 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const festivalDistance = festival.distance;
  const formattedDistance = formatDistance(festivalDistance);
  const handleFavoritePress = async () => {
    const itemId = festival.contentid || festival.id; 
    
    await toggleFavorite(festival, 'FESTIVAL'); 

    console.log(`[FE] 찜 토글 요청 완료 (ID: ${itemId})`);
};
    return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* 1. 이미지 표시 */}
      <Image 
        source={{ uri: festival.image_url || PLACEHOLDER_URL }} 
        style={styles.poster} 
        defaultSource={{ uri: PLACEHOLDER_URL }}
      />

      {/* 2. 찜 버튼 (이미지 위 콘텐츠 영역에 위치) */}
      <TouchableOpacity 
        onPress={handleFavoritePress} 
        style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
      >
        <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? '#fff' : '#000'} 
        />
        <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
          {isFavorite ? '찜 완료' : '찜하기'}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* 3. 제목 표시 */}
        <Text style={styles.name}>{festival.title}</Text>
        
        {/* 4. 현재 위치로부터 거리 표시 */}
        {formattedDistance && (formattedDistance !== '거리 정보 없음') && (
            <Text style={styles.distanceText}>
                🚀 내 위치에서: {formattedDistance}
            </Text>
        )}
        
        {/* 기간 및 위치 정보 */}
        <View style={styles.infoRow}>
            <Text style={styles.metaLabel}>🗓 기간</Text>
            <Text style={styles.metaValue}>
              {`${formatDate(festival.event_start_date)} ~ ${formatDate(festival.event_end_date)}`}
            </Text>
        </View>
        
        <View style={styles.infoRow}>
            <Text style={styles.metaLabel}>📍 위치</Text>
            <Text style={styles.metaValue}>{festival.location || '위치 정보 없음'}</Text>
        </View>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  contentContainer: { 
    paddingBottom: 32 
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  poster: { 
    width: width, 
    height: IMAGE_HEIGHT, 
    backgroundColor: '#eee' 
  },
  content: { 
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: -10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  name: { 
    fontSize: 26, 
    fontWeight: '800', 
    marginBottom: 10,
    color: '#333',
  },
  distanceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: { 
    fontSize: 15, 
    fontWeight: 'bold',
    color: '#555', 
    width: 60,
  },
  metaValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  sectionTitle: { 
    marginTop: 20, 
    fontSize: 18, 
    fontWeight: '700',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  favoriteButton: {
    position: 'absolute',
    top: IMAGE_HEIGHT - 25, 
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  favoriteActive: {
    backgroundColor: '#FF6347', 
  },
  favoriteText: {
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  favoriteTextActive: {
    color: '#fff',
  }
});