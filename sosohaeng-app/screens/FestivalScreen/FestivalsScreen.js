import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';

import apiClient from '../../src/config/client'; 
import { useRouter } from 'expo-router';

const fetchFestivals = async () => {
  // 1. BE가 page/size를 받지 않으므로, 파라미터 없이 호출합니다.
  const { data } = await apiClient.get('/festivals/');
  
  if (!Array.isArray(data)) {
    return []; 
  }
  return data;
};

export default function FestivalScreen() {
  //const navigation = useNavigation();
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map');

  const { data: festivals, isLoading, isError } = useQuery({
    queryKey: ['festivals'],
    queryFn: fetchFestivals,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('위치 권한이 거부되었습니다.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      // BE가 보낸 'id' (숫자)를 사용합니다.
      onPress={() => router.push(`/festivals/${item.id}`)}
    >
      {/* BE가 보낸 'image_url'을 사용합니다. */}
      <Image 
        source={{ uri: item.image_url || 'https://placehold.co/80x80/eee/ccc?text=No+Image' }} 
        style={styles.thumbnail} 
      />
      <View style={styles.cardContent}>
        {/* BE가 보낸 'title'을 사용합니다. */}
        <Text style={styles.name}>{item.title}</Text>
        {/* BE가 보낸 'location'을 사용합니다. */}
        <Text style={styles.address} numberOfLines={1}>📍 {item.location || '위치 정보 없음'}</Text>
        {/* BE가 보낸 'event_start_date' ("YYYY-MM-DD")를 사용합니다. */}
        <Text style={styles.date}>🗓 {`${item.event_start_date} ~ ${item.event_end_date}`}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    const validFestivals = festivals?.filter(f => f.mapx && f.mapy);
    if (isLoading || !location) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.infoText}>
            {/* BE가 1077건을 처리하므로 시간이 좀 걸립니다. */}
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
          {!isError && validFestivals?.map(festival => (
            <Marker
              key={festival.id}
              coordinate={{
                latitude: parseFloat(festival.mapy), // BE가 'mapy'를 줍니다.
                longitude: parseFloat(festival.mapx), // BE가 'mapx'를 줍니다.
              }}
              title={festival.title}
              onPress={() => router.push(`/festivals/${festival.id}`)}
            />
          ))}
        </MapView>
      );
    } else {
      return (
        <FlatList
          data={festivals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
});