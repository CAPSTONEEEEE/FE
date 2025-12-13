import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router'; 
import useFavoritesStore from '../../../screens/stores/favoritesStore'; 
import apiClient from '../../../src/config/client';

const { width } = Dimensions.get('window');
const PLACEHOLDER_URL = 'https://placehold.co/600x400/eee/ccc?text=No+Image';

const formatDate = (dateStr) => {
  if (!dateStr) return '정보 없음';
  const str = String(dateStr);
  if (str.length !== 8) return str; 
  return `${str.substring(0, 4)}.${str.substring(4, 6)}.${str.substring(6, 8)}`;
};

export default function FestivalDetailScreen() {
  const router = useRouter();
  
  // 1. URL 파라미터 받기
  const { id, data } = useLocalSearchParams(); 

  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. 목록에서 넘겨준 데이터 파싱
  const paramsData = useMemo(() => {
    if (data) {
        try {
            const parsed = JSON.parse(data);
            return parsed.festival || null;
        } catch (e) {
            console.log("JSON Parse Error:", e);
            return null;
        }
    }
    return null;
  }, [data]);

  // 3. 이미 찜한 상태인지 확인 (스토어 데이터)
  const favoriteItem = useFavoritesStore(state => 
    state.festivals.find(f => String(f.item_id) === String(id) || String(f.contentid) === String(id))
  );

  // 4. 서버 상세 정보 요청
  useEffect(() => {
    const fetchDetail = async () => {
      // 화면에 보여줄 데이터가 아무것도 없을 때만 로딩 표시
      if (!paramsData && !favoriteItem) setLoading(true);
      
      try {
        const res = await apiClient.get(`/festivals/${id}`);
        if (res.data) setServerData(res.data);
      } catch (error) {
        // 404가 떠도 괜찮습니다. (기존 데이터로 보여주면 됨)
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  // 5. 데이터 우선순위 통합 (서버 > 파라미터 > 스토어)
  const rawData = serverData || paramsData || favoriteItem;

  // 6. 화면 표시용 객체 생성 (데이터 정규화)
  const displayItem = useMemo(() => {
    // 데이터가 없어도 최소한 ID는 URL에서 가져와야 함
    const currentId = rawData?.contentid || rawData?.item_id || rawData?.id || id;
    
    if (!currentId) return null; // ID조차 없으면 렌더링 불가

    return {
        id: currentId,
        title: rawData?.title || '제목 없음',
        image: rawData?.image_url || rawData?.firstimage || rawData?.firstimage2 || PLACEHOLDER_URL,
        address: rawData?.location || rawData?.addr1 || rawData?.addr2 || '위치 정보 없음',
        startDate: rawData?.event_start_date || rawData?.eventstartdate,
        endDate: rawData?.event_end_date || rawData?.eventenddate,
        desc: rawData?.description || rawData?.overview || '',
    };
  }, [rawData, id]);

  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id, 'FESTIVAL'));

  const handleToggle = async () => {
    // 1. ID 확보 (displayItem이 없으면 URL의 id라도 강제로 씀)
    const targetId = displayItem?.id || id;
    
    if (!targetId) {
        Alert.alert("오류", "이 항목의 ID를 찾을 수 없어 찜할 수 없습니다.");
        return;
    }

    // 2. 저장할 객체 생성 (스토어에 저장될 데이터)
    const itemToSave = {
        item_id: String(targetId),          // 스토어 필수 키
        contentid: String(targetId),        // API 호환용 키
        title: displayItem?.title || "제목 없음",
        image_url: displayItem?.image || PLACEHOLDER_URL,
        
        // 아래 정보들이 저장되어야 찜 목록에서 기간/위치가 보입니다.
        location: displayItem?.address || "", 
        event_start_date: displayItem?.startDate || "",
        event_end_date: displayItem?.endDate || "",
        
        item_type: 'FESTIVAL'
    };
    
    console.log("[DEBUG] 찜 저장 시도:", itemToSave); // 로그 확인용

    await toggleFavorite(itemToSave, 'FESTIVAL');
  };

  if (loading && !displayItem) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF"/></View>;
  }

  if (!displayItem) {
    return (
        <View style={styles.center}>
            <Text style={{color:'#666', marginBottom:10}}>정보를 찾을 수 없습니다.</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonSimple}>
                <Text style={{color:'#007AFF'}}>돌아가기</Text>
            </TouchableOpacity>
        </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: displayItem.image }} style={styles.poster} />
      
      {/* 찜 버튼 */}
      <TouchableOpacity onPress={handleToggle} style={styles.fab}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#fff" : "#333"} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{displayItem.title}</Text>
        
        <View style={styles.row}>
            <Text style={styles.label}>🗓 기간</Text>
            <Text style={styles.value}>
                {displayItem.startDate 
                    ? `${formatDate(displayItem.startDate)} ~ ${formatDate(displayItem.endDate)}` 
                    : '기간 정보 없음'}
            </Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>📍 위치</Text>
            <Text style={styles.value}>{displayItem.address}</Text>
        </View>
        
        <TouchableOpacity style={styles.mapBtn} onPress={() => router.replace('/(tabs)/festivals')}>
            <Text style={{color: '#007AFF', fontWeight:'bold'}}>🗺️ 지도에서 위치 확인하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 300, backgroundColor: '#eee' },
  content: { padding: 20, marginTop: -20, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color:'#333' },
  row: { flexDirection: 'row', marginBottom: 12 },
  label: { fontWeight: 'bold', width: 60, color: '#666', fontSize: 15 },
  value: { flex: 1, color: '#333', fontSize: 15 },
  fab: { position: 'absolute', top: 270, right: 20, backgroundColor: '#FF6347', padding: 12, borderRadius: 30, elevation: 5, zIndex:10 },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20, zIndex:10 },
  mapBtn: { marginTop: 30, padding: 15, backgroundColor: '#F0F8FF', borderRadius: 10, alignItems: 'center' },
  backButtonSimple: { padding: 10, borderWidth:1, borderColor:'#ddd', borderRadius:5 }
});