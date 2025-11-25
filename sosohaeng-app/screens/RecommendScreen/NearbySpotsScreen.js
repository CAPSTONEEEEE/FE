// screens/NearbySpotsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../src/config/client'; // 기존에 쓰시던 axios client

export default function NearbySpotsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { contentid, title } = route.params; // ChatbotRecommend에서 넘겨준 값

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ target: null, nearby_spots: [] });

    useEffect(() => {
        // 헤더 제목 설정
        navigation.setOptions({ title: title || '주변 관광지' });
        fetchNearbySpots();
    }, [contentid]);

    const fetchNearbySpots = async () => {
        try {
            // 백엔드 API 호출 (/api/v1/recommend/nearby/{contentid})
            const res = await apiClient.get(`/recommend/nearby/${contentid}`);
            setData(res.data);
        } catch (error) {
            console.error("주변 관광지 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // [페이지 2로 이동] 리스트 아이템 클릭 시
    const handleSpotPress = (item) => {
        navigation.navigate('SpotDetailScreen', { contentid: item.contentid });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleSpotPress(item)}>
            {item.firstimage ? (
                <Image source={{ uri: item.firstimage }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.thumbnail, styles.placeholder]}>
                     <Ionicons name="image-outline" size={24} color="#ccc" />
                </View>
            )}
            <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.address} numberOfLines={1}>📍 {item.addr1}</Text>
                <Text style={styles.distance}>🚗 여기서 약 {item.distance}km</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#6D99FF" />
            <Text style={{marginTop: 10, color:'#666'}}>주변 명소를 찾고 있어요...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                    <Text style={{fontWeight:'bold', color:'#6D99FF'}}>"{data.target?.title}"</Text> 기준{"\n"}
                    반경 20km 이내 추천 여행지입니다.
                </Text>
            </View>

            <FlatList
                data={data.nearby_spots}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.contentid)}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>근처에 등록된 다른 관광지가 없습니다.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    headerText: { fontSize: 16, lineHeight: 24, textAlign: 'center', color: '#333' },
    listContent: { padding: 16 },
    card: { 
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12,
        alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: {width:0, height:2}
    },
    thumbnail: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee', marginRight: 12 },
    placeholder: { backgroundColor: '#e0e0e0', justifyContent:'center', alignItems:'center' },
    cardContent: { flex: 1, justifyContent: 'center' },
    title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    address: { fontSize: 13, color: '#666', marginBottom: 4 },
    distance: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});