// screens/FestivalsScreen.js
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FestivalDetailScreen from './FestivalDetailScreen';

export default function FestivalsScreen() {
  const navigation = useNavigation();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  const [location, setLocation] = useState(null);

  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('위치 권한이 거부되었습니다.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const data = [
    { id: '1', name: '드론 축제', address: '부산광역시 ○○구 ○○로 123', date: '2025-08-09 ~ 2025-08-27',tags: ['드론', '체험'],likes: 42, distanceText: '2.5km', image: 'https://picsum.photos/400/200?random=1', coord: { latitude: 35.1796, longitude: 129.0756,info: '드론과 야경을 즐길 수 있는 부산의 여름 축제입니다.' } },
    { id: '2', name: '해운대 불꽃축제', address: '부산광역시 해운대구 해운대해변로', date: '2025-09-01 ~ 2025-09-02',tags: ['불꽃', '야경'],likes: 120, distanceText: '5km', image: 'https://picsum.photos/400/200?random=2', coord: { latitude: 35.1587, longitude: 129.1603 }, info: '바다 위에서 펼쳐지는 화려한 불꽃쇼!' },
    { id: '3', name: '밀락 문화 캠핑', address: '부산광역시 해운대구', date: '25.05.02~25.10.31',tags: ['캠핑', '음악'],likes: 87, distanceText: '8km', image: 'https://picsum.photos/400/200?random=3', coord: { latitude: 35.17, longitude: 129.06 }, info: '캠핑하며 즐기는 즐거운 부산!'},
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('FestivalDetailScreen', { festival: item })}>
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.thumbnail} />
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.distance}>📍 {item.distanceText} 거리</Text>
          <Text style={styles.date}>🗓 {item.date}</Text>
          <View style={styles.tags}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        </View>
        <View style={styles.likes}>
          <Ionicons name="heart-outline" size={18} color="#ff4d6d" />
          <Text style={styles.likeCount}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* 상단바 */}
      <Header title="축제"
      navigation={navigation}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('찜')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        } />

      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 3.0,
              longitudeDelta: 3.0,
            }}
            showsUserLocation={true}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="내 위치"
              description="현재 위치입니다"
            />
          </MapView>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            위치 정보를 불러오는 중...
          </Text>
        )}
      </View>

      {/* 하단바 */}
      <Footer />

      {/* 슬라이드 바 */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        style={styles.bottomSheet}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={styles.sheetTitle}>축제 리스트</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  mapContainer: {
    flex: 1,
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10, alignItems: 'center' },
  thumbnail: { width: 80, height: 80, borderRadius: 8 },
  cardContent: { flex: 1, marginLeft: 10 },
  name: { fontSize: 16, fontWeight: 'bold' },
  distance: { fontSize: 12, color: '#555', marginTop: 2 },
  date: { fontSize: 12, color: '#555', marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tag: { fontSize: 11, color: '#007aff', marginRight: 4 },
  likes: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  likeCount: { marginLeft: 4, fontSize: 12, color: '#555' },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 14,
  },
});
