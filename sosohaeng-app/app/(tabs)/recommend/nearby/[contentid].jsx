// app/recommend/nearby/[contentid].jsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'; // Expo Router 훅 사용
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../../../src/config/client'; // 경로 주의 (../../.. 로 상위 이동)

export default function NearbySpotsRoute() {
    const router = useRouter();
    // URL 파라미터 받기
    const { contentid, title } = useLocalSearchParams(); 

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ target: null, nearby_spots: [] });

    useEffect(() => {
        fetchNearbySpots();
    }, [contentid]);

    const fetchNearbySpots = async () => {
        try {
            // contentid가 없으면 실행 안 함
            if (!contentid) return;
            const res = await apiClient.get(`/recommend/nearby/${contentid}`);
            setData(res.data);
        } catch (error) {
            console.error("주변 관광지 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // 상세 페이지로 이동 (페이지 2)
    const handleSpotPress = (item) => {
        router.push(`/recommend/detail/${item.contentid}`);
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
            {/* 헤더 설정 */}
            <Stack.Screen options={{ title: title ? `${title} 주변` : '주변 관광지', headerBackTitle: '뒤로' }} />

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                    <Text style={{fontWeight:'bold', color:'#6D99FF'}}>"{data.target?.title || title}"</Text> 기준{"\n"}
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