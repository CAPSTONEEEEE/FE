// screens/CityDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import TopBackBar from '../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { getCitySpotRecommendations } from '../src/config/api_Recommend';

// -----------------------------------------------------------------
// 헬퍼 함수: AI 응답 텍스트에서 JSON을 파싱
// -----------------------------------------------------------------
const parseSpotResponse = (rawResponse) => {
    const jsonMatch = rawResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    const textParts = rawResponse.split(/```json[\s\S]*?```/);
    
    const summaryText = textParts[0]?.trim() || '';
    const footerText = textParts.length > 1 ? textParts[1]?.trim() : '';

    if (jsonMatch && jsonMatch[1]) {
        try {
            const data = JSON.parse(jsonMatch[1]);
            return {
                summary: summaryText,
                spots: data.spots || [],
                footer: footerText
            };
        } catch (e) {
            console.error("Spot JSON 파싱 실패:", e);
        }
    }
    return { summary: rawResponse, spots: [], footer: '' };
};

// -----------------------------------------------------------------
// 메인 화면 컴포넌트
// -----------------------------------------------------------------
const CityDetailScreen = () => {
    const route = useRoute();
    const { cityTitle } = route.params; // 이전 화면에서 전달받은 도시 이름
    
    const [loading, setLoading] = useState(true);
    const [spotData, setSpotData] = useState({ summary: '', spots: [], footer: '' });

    useEffect(() => {
        const fetchSpotData = async () => {
            try {
                const response = await getCitySpotRecommendations(cityTitle);
                const rawResponse = response.response;

                const parsedData = parseSpotResponse(rawResponse);
                setSpotData(parsedData);

            } catch (error) {
                console.error("명소 데이터 로드 실패:", error);
                Alert.alert("오류", "명소 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchSpotData();
    }, [cityTitle]);


    return (
        <SafeAreaView style={styles.page}>
            <TopBackBar title={`${cityTitle} 상세 추천`} />
            <ScrollView style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#6D99FF" style={styles.loading} />
                ) : (
                    <View style={styles.content}>
                        <Text style={styles.summaryTitle}>{spotData.summary}</Text>
                        
                        <View style={styles.spotList}>
                            {spotData.spots.map((spot, index) => (
                                <View key={index} style={styles.spotItem}>
                                    <Text style={styles.spotTitle}>{index + 1}. {spot.title}</Text>
                                    <Text style={styles.spotInfo}>{spot.info}</Text>
                                    <TouchableOpacity style={styles.detailLink}>
                                         <Text style={styles.detailLinkText}>더 보기</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        
                        <Text style={styles.footerText}>{spotData.footer}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// -----------------------------------------------------------------
// 스타일
// -----------------------------------------------------------------
const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20 },
    loading: { marginTop: 50 },
    content: { paddingBottom: 50 },
    
    summaryTitle: { fontSize: 16, fontWeight: '500', color: '#555', marginBottom: 20, lineHeight: 24 },
    
    spotList: { marginBottom: 30 },
    spotItem: {
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#6D99FF',
    },
    spotTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 5 },
    spotInfo: { fontSize: 14, color: '#666', lineHeight: 20 },
    
    detailLink: { 
        marginTop: 8, 
        alignSelf: 'flex-end',
    },
    detailLinkText: {
        color: '#6D99FF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    footerText: { fontSize: 13, color: '#777', textAlign: 'center' },
});

export default CityDetailScreen;