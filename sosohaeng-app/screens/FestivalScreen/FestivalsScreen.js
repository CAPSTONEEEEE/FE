import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';

import apiClient from '../../src/config/client'; 
import { useRouter } from 'expo-router';
import { formatDistance } from '../../src/utils/distanceHelper';

const getFestivalId = (item) => {
  return item.contentid || item.id || item.item_id;
};

const fetchFestivals = async (queryContext) => {
  const { location, showNearby, orderBy } = queryContext.queryKey[1];
  const finalOrderBy = (orderBy === 'start' || orderBy === 'start_date') ? 'distance' : orderBy;
  
  let params = { page: 1, size: 50, order_by: finalOrderBy };
  
  if (location) {
    params.user_lat = location.latitude;
    params.user_lon = location.longitude;
    
    if (showNearby) {
      // BE가 10km 이내로 필터링하도록 요청합니다.
      params.distance_km = 10;
      params.order_by = 'distance'; // 거리순 정렬 강제
    }
  }

  // 파라미터를 포함하여 API를 호출합니다.
  const { data } = await apiClient.get('/festivals/', { params });
  
  if (!Array.isArray(data)) {
    return data.items || [];
  }
  return data;
};

export default function FestivalScreen() {
  //const navigation = useNavigation();
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const DISTANCE_LIMIT_KM = 10;
  const [showOnlyNearby, setShowOnlyNearby] = useState(false);
  const [orderBy, setOrderBy] = useState('distance');

  const { data: festivals, isLoading, isError } = useQuery({
  queryKey: [
    'festivals', 
    { 
      location: location, 
      showNearby: showOnlyNearby, 
      orderBy: orderBy 
    }
  ], 
  queryFn: fetchFestivals,
  // location이 null이거나, 아직 정렬 기준이 결정되지 않았다면 쿼리를 실행하지 않음
  enabled: !!location && !!orderBy, 
});

  useEffect(() => {
    (async () => {
      try {
        // 1. 권한 요청
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        // 2. 권한 거부 시 처리
        if (status !== 'granted') {
          setErrorMsg('위치 권한을 허용해야 내 주변 축제를 볼 수 있습니다.');
           setLocation({
             latitude: 37.5665,
             longitude: 126.9780,
           });
          return;
        }

        // 3. 현재 위치 가져오기
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (error) {
        console.error(error);
        setErrorMsg('위치 정보를 가져오는 중 오류가 발생했습니다.');
      }
    })();
  }, []);

  const handlePressFestival = (item) => {
      const targetId = getFestivalId(item);
      if (!targetId) return;

      const formattedDistance = item.distance ? formatDistance(item.distance) : undefined;

      const detailData = JSON.stringify({
          festival: item,
          distance: formattedDistance 
      });

      router.push({
          pathname: `/festivals/${targetId}`, 
          params: { 
              data: detailData 
          }
      });
  };

  const renderItem = ({ item }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handlePressFestival(item)} 
        >
            {item.image_url && item.image_url.length > 0 ? (
                <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.placeholder, styles.thumbnail]} /> 
            )}
            <View style={styles.cardContent}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.address} numberOfLines={1}>📍 {item.location || item.addr1 || '위치 정보 없음'}</Text>
                <Text style={styles.date}>🗓 {`${item.event_start_date || item.eventstartdate} ~ ${item.event_end_date || item.eventenddate}`}</Text>
                
                {item.distance !== undefined && item.distance !== null && (
                    <Text style={styles.distance}>
                        {formatDistance(item.distance)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

  const renderContent = () => {
    if (errorMsg && !location) {
        return (
            <View style={styles.centered}>
                <Text style={styles.infoText}>{errorMsg}</Text>
                <TouchableOpacity 
                    onPress={() => Linking.openSettings()} // react-native에서 Linking import 필요
                    style={{ marginTop: 20, padding: 10, backgroundColor: '#ddd', borderRadius: 8 }}
                >
                    <Text>설정으로 이동</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const validFestivals = festivals?.filter(f => 
        f.mapx && f.mapy && 
        !isNaN(parseFloat(f.mapx)) && 
        !isNaN(parseFloat(f.mapy))
    );

    // isLoading 체크 전에 location이 있는지 확인
    if (isLoading || !location) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.infoText}>
            2025년 축제 목록을 실시간으로 불러오는 중...
          </Text>
        </View>
      );
    }
    
    if (viewMode === 'map') {
      return (
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          showsUserLocation={true}
        >
          {!isError && validFestivals?.map((festival, index) => (
            <Marker
              key={`${festival.title}-${index}`} 
              coordinate={{
                latitude: parseFloat(festival.mapy),
                longitude: parseFloat(festival.mapx),
              }}
              title={festival.title}
              onPress={() => {
                // 목록과 동일하게 상세 페이지에 필요한 데이터 (거리 포함)를 JSON 문자열로 만들어 전달
                const formattedDistance = festival.distance !== undefined && festival.distance !== null 
                    ? formatDistance(festival.distance) 
                    : undefined;
                
                const detailData = JSON.stringify({
                    festival: festival,
                    distance: formattedDistance 
                });

                router.push({
                    pathname: `/festivals/${festival.id}`, 
                    params: { data: detailData } 
                });
              }}
            />
          ))}
        </MapView>
      );
    } else {
      return (
        <FlatList
          data={festivals}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.title ? `${item.title}-${index}` : index.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.infoText}>
                현재 진행 중인 2025년 축제가 없습니다.
              </Text>
            </View>
          )}
        />
      );
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.activeButton]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.activeText]}>지도</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.activeButton]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.activeText]}>목록</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {/* 근처만 보기 (거리 필터) 버튼 */}
        {location && (
          <TouchableOpacity
          style={[styles.filterButton, showOnlyNearby && styles.activeFilterButton]}
          onPress={() => {
            const newState = !showOnlyNearby;
            setShowOnlyNearby(newState);
            // 근처 필터 활성화 시 거리순 정렬로 자동 변경
            if (newState) {
              setOrderBy('distance');
            } else {
              setOrderBy('distance'); 
            }
          }}
        >
          <Text style={[styles.filterText, showOnlyNearby && styles.activeFilterText]}>
            {showOnlyNearby ? `✅ ${DISTANCE_LIMIT_KM}km 이내` : `${DISTANCE_LIMIT_KM}km 이내`}
            </Text>
            </TouchableOpacity>
          )}
          {/* '제목 순' 정렬 버튼 */}
          <TouchableOpacity
              style={[styles.filterButton, orderBy === 'title' && !showOnlyNearby && styles.activeFilterButton]}
              onPress={() => {
                  setOrderBy('title');
                  setShowOnlyNearby(false); // 제목순 선택 시 근처 필터 해제
              }}
          >
              <Text style={[styles.filterText, orderBy === 'title' && !showOnlyNearby && styles.activeFilterText]}>제목순</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      
      {isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>축제 정보를 불러오는 데 실패했습니다.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 8,
    },
    activeButton: {
        backgroundColor: '#007aff',
    },
    toggleText: {
        color: '#333',
        fontWeight: '600',
    },
    activeText: {
        color: '#ffffff',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // 텍스트 줄바꿈을 위해
    },
    infoText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#888888',
      fontSize: 16,
      lineHeight: 22, // 줄 간격
    },
    listContainer: {
        padding: 16,
    },
    card: { 
        flexDirection: 'row', 
        backgroundColor: '#ffffff', 
        borderRadius: 12, 
        padding: 12, 
        marginBottom: 12, 
        alignItems: 'center', 
        elevation: 2, 
        shadowColor: '#000000', 
        shadowOpacity: 0.05, 
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    thumbnail: { 
        width: 80, 
        height: 80, 
        borderRadius: 8, 
        backgroundColor: '#eeeeee',
    },
    cardContent: { 
        flex: 1, 
        marginLeft: 12, 
        justifyContent: 'center',
    },
    name: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 4,
    },
    address: { 
        fontSize: 12, 
        color: '#555555', 
        marginBottom: 2,
    },
    date: { 
        fontSize: 12, 
        color: '#555555',
    },
    errorContainer: {
        position: 'absolute',
        top: 60, // 토글 버튼 아래
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 8,
        zIndex: 10, // 다른 요소 위에 보이도록
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
    },

    distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF', // 거리 강조 색상
    marginTop: 5,
  },
  
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'flex-start',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});