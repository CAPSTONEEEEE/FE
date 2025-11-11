import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context'; 
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
//import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';
import { useRouter } from 'expo-router';


const fetchFestivals = async () => {
  const { data } = await apiClient.get('/festivals/');
  
  // 'data'는 이제 [...] 배열입니다.
  // 이 배열의 필드 이름을 FE 컴포넌트가 기대하는 이름으로 변경합니다.
  
  if (!Array.isArray(data)) {
    // 혹시 모를 에러 방지
    return []; 
  }

  return data.map(festival => ({
    // FE가 기대하는 이름(왼쪽) = BE가 주는 이름(오른쪽)
    id: festival.contentid,          // 👈 'id'로 변경
    title: festival.title,
    location: festival.addr1,        // 👈 'location'으로 변경
    event_start_date: festival.eventstartdate, // 👈 'event_start_date'로 변경
    event_end_date: festival.eventenddate,   // 👈 'event_end_date'로 변경
    image_url: festival.firstimage,  // 👈 'image_url'로 변경
    mapx: festival.mapx,
    mapy: festival.mapy,
  }));
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
      onPress={() => router.push(`/festivals/${item.id}`)}
    >
      <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.address}>📍 {item.location}</Text>
        <Text style={styles.date}>🗓 {`${item.event_start_date} ~ ${item.event_end_date}`}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading || !location) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.infoText}>데이터를 불러오는 중...</Text>
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
          {!isError && festivals?.map(festival => (
            <Marker
              key={festival.id}
              coordinate={{
                latitude: parseFloat(festival.mapy), // 👈 혹시 모를 타입 에러 방지
                longitude: parseFloat(festival.mapx), // 👈 혹시 모를 타입 에러 방지
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
              <Text style={styles.infoText}>표시할 축제가 없습니다.</Text>
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
    },
    infoText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#888888',
      fontSize: 16,
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

