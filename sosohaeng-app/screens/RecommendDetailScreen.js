// screens/RecommendDetail.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import TopBackBar from '../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCitySpotRecommendations } from '../src/config/api_Recommend'; // 새 API 함수 임포트
import useFavoritesStore from '../screens/stores/favoritesStore';
import useAuthStore from '../src/stores/authStore';

// React Query로 명소 데이터 패치
const fetchSpotDetails = async (queryContext) => {
    const cityName = queryContext.queryKey[1].cityName;
    if (!cityName) return { spots: [] };
    
    // API 호출
    const { data } = await getCitySpotRecommendations(cityName);
    // 서버 응답이 {city_name, response, spots} 형태라고 가정
    return data;
};

export default function RecommendDetailScreen() {
    const route = useRoute();
    const { cityTitle } = route.params; // ChatbotRecommend에서 전달받은 도시 이름
    
    const { data, isLoading, isError } = useQuery({
        queryKey: ['citySpots', { cityName: cityTitle }],
        queryFn: fetchSpotDetails,
        enabled: !!cityTitle,
    });

    const spots = data?.spots || [];
    // ⭐️ responseMessage를 AI/DB 결합 응답 메시지로 사용 ⭐️
    const responseMessage = data?.response || 'DB에 연결 중입니다.'; 

    // ... (찜 기능 및 handleFavoritePress 함수 유지) ...

    const renderItem = ({ item }) => {
        const favorite = isFavorite(item.contentid, 'SPOT');
        
        return (
            <View style={styles.card}>
                {/* 1. 이미지 표시 */}
                {item.firstimage ? (
                    <Image source={{ uri: item.firstimage }} style={styles.thumbnail} />
                ) : (
                    // 이미지 없을 때 Placeholder
                    <View style={[styles.placeholder, styles.thumbnail]}>
                        <Text style={{color: '#aaa', fontSize: 10}}>이미지 없음</Text>
                    </View>
                )}
                
                <View style={styles.cardContent}>
                    <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
                    {/* DB addr1 필드를 사용하여 주소 표시 */}
                    <Text style={styles.address} numberOfLines={2}>📍 {item.addr1 || '주소 정보 없음'}</Text>
                    
                    {/* AI가 생성한 간단 정보 */}
                    <Text style={styles.infoText}>💡 {item.info || '추가 정보 준비 중'}</Text>
                    
                    {/* 2. 찜 버튼 */}
                    <TouchableOpacity
                        onPress={() => handleFavoritePress(item)}
                        style={styles.favoriteButton}
                    >
                        <Ionicons 
                            name={favorite ? 'heart' : 'heart-outline'}
                            size={24}
                            color={favorite ? '#ff4d6d' : '#999'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // -----------------------------------------------------------------
    // 로딩 및 오류/빈 목록 화면 처리
    // -----------------------------------------------------------------
    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#6D99FF" />
                <Text style={styles.infoText}>'{cityTitle}' 명소 정보를 찾는 중...</Text>
            </SafeAreaView>
        );
    }

    if (isError) {
        // 서버 오류 (500) 발생 시
        return (
            <SafeAreaView style={styles.centered}>
                <TopBackBar title={`${cityTitle} 명소`} />
                <Text style={styles.errorText}>
                    🔴 서버 오류가 발생했습니다. DB 연결 또는 AI 통신 확인이 필요합니다.
                </Text>
                <Text style={styles.errorMessage}>{responseMessage}</Text>
            </SafeAreaView>
        );
    }
    
    // 최종 렌더링
    return (
        <SafeAreaView style={styles.screen}>
            {/* TopBackBar는 JSX 파일에서 렌더링되므로 제거하거나, 여기서 사용하려면 Stack.Screen options={headerShown: false} 설정을 변경해야 함 */}
            {/* TopBackBar title={`${cityTitle} 명소`} */} 
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{cityTitle} 명소 추천</Text>
                <Text style={styles.headerMessage}>{responseMessage}</Text>
                
                {/* ⭐️ DB에 데이터가 없는 경우의 처리 ⭐️ */}
                {spots.length === 0 && (
                    <Text style={styles.noDataText}>
                        DB에서 해당 지역 명소({cityTitle})를 찾지 못했습니다.
                    </Text>
                )}
            </View>
            
            {spots.length > 0 && (
                <FlatList
                    data={spots}
                    renderItem={renderItem}
                    // ⭐️ [수정] keyExtractor 안전성 강화 (contentid가 없을 경우를 대비) ⭐️
                    keyExtractor={(item) => item.contentid || item.title || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                />
            )}
            
        </SafeAreaView>
    );
}

// -----------------------------------------------------------------
// 스타일
// -----------------------------------------------------------------
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f9f9f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 20 },
    
    header: { 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
        backgroundColor: '#fff' 
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#333' 
    },
    headerMessage: { 
        fontSize: 14, 
        color: '#666', 
        marginTop: 5 
    },
    noDataText: {
        fontSize: 15,
        color: '#D9534F',
        marginTop: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    
    listContainer: { padding: 16 },
    
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
    
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: { 
        flex: 1, 
        marginLeft: 12, 
        justifyContent: 'center',
    },
    name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    address: { fontSize: 12, color: '#555', marginBottom: 2 },
    infoText: { fontSize: 13, color: '#2D4C3A', marginTop: 4, fontWeight: '600' }, // AI 정보 강조
    
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
    },
    errorText: { fontSize: 16, fontWeight: 'bold', color: '#D9534F' },
    errorMessage: { fontSize: 14, color: '#777', marginTop: 10, textAlign: 'center' },
});