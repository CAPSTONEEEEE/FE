import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native'; // useRoute 사용
import apiClient from '../src/config/client';

export default function SpotDetailScreen({ navigation }) { // navigation prop 사용 가능
    const route = useRoute();
    const { contentid } = route.params; // 여기서 params를 받습니다.

    const [spot, setSpot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // 백엔드 주소 Prefix 확인 (/recommend/detail 인지 /api/v1/recommend/detail 인지)
                const res = await apiClient.get(`/recommend/detail/${contentid}`);
                setSpot(res.data);
                // 헤더 제목 설정
                navigation.setOptions({ title: res.data.title });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [contentid]);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#6D99FF"/></View>;
    if (!spot) return <View style={styles.centered}><Text>정보를 찾을 수 없습니다.</Text></View>;

    return (
        <ScrollView style={styles.container}>
            {spot.firstimage ? (
                <Image source={{ uri: spot.firstimage }} style={styles.image} />
            ) : (
                <View style={[styles.image, { backgroundColor: '#ddd' }]} />
            )}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{spot.title}</Text>
                <Text style={styles.desc}>{spot.addr1}</Text>
                {/* 필요한 정보 추가 */}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 250, resizeMode: 'cover' },
    infoContainer: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    desc: { fontSize: 16, color: '#555' }
});