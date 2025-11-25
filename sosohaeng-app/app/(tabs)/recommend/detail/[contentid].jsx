// app/recommend/detail/[contentid].jsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router'; // Expo Router 훅
import apiClient from '../../../../src/config/client';

export default function SpotDetailRoute() {
    const { contentid } = useLocalSearchParams();
    const [spot, setSpot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (!contentid) return;
                const res = await apiClient.get(`/recommend/detail/${contentid}`);
                setSpot(res.data);
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
            {/* 헤더 설정 */}
            <Stack.Screen options={{ title: spot.title, headerBackTitle: '목록' }} />

            {/* 대표 이미지 */}
            {spot.firstimage ? (
                <Image source={{ uri: spot.firstimage }} style={styles.image} />
            ) : (
                <View style={[styles.image, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{color:'#888'}}>이미지 없음</Text>
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{spot.title}</Text>
                
                <View style={styles.row}>
                    <Text style={styles.label}>주소</Text>
                    <Text style={styles.value}>{spot.addr1} {spot.addr2}</Text>
                </View>

                {spot.tel && (
                    <View style={styles.row}>
                        <Text style={styles.label}>문의</Text>
                        <Text style={styles.value}>{spot.tel}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>상세 정보</Text>
                    <Text style={styles.desc}>
                        {/* 상세 설명이 DB에 없다면 기본 텍스트로 대체 */}
                        이곳은 {spot.addr1}에 위치한 매력적인 여행지입니다.
                        가족, 친구, 연인과 함께 방문하여 즐거운 추억을 만들어보세요.
                        {spot.zipcode && `\n(우편번호: ${spot.zipcode})`}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 250, resizeMode: 'cover' },
    infoContainer: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    row: { flexDirection: 'row', marginBottom: 12 },
    label: { width: 60, fontSize: 14, fontWeight: 'bold', color: '#666' },
    value: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
    section: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    desc: { fontSize: 15, lineHeight: 24, color: '#444' }
});