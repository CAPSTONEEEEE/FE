// screens/FavoritesScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Image, Platform, StatusBar} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../components/TopBackBar'; 
import useFavoritesStore from './stores/favoritesStore';
import Header from '../components/Header'; 
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const PLACEHOLDER_URL = 'https://placehold.co/100x100/eeeeee/cccccc?text=NO+IMG';

// 찜 항목을 보여주는 작은 카드 컴포넌트
const FavoriteItemCard = ({ item }) => {
    const router = useRouter();
    const navigateToDetail = () => {
        // ID 안전하게 추출
        const itemId = item.item_id || item.contentid || item.id;
        if (!itemId) return;

        switch (item.item_type) {
            case 'FESTIVAL':
                const festivalData = JSON.stringify({
                    festival: item, // store에 저장된 item 전체를 넘김
                    distance: null 
                });
                
                router.push({
                    pathname: `/festivals/${itemId}`,
                    params: { 
                        data: festivalData 
                    } 
                });
                break;

            case 'PRODUCT':
                router.push({
                    pathname: '/market/product/[id]',
                    params: { id: String(itemId) },
                });
                break;
                
            case 'SPOT':
                router.push({
                    pathname: `/recommend/nearby/${itemId}`, // 파일 경로: app/recommend/nearby/[contentid].jsx
                    params: { title: item.title }            // 제목도 같이 전달
                });
                break;
            default:
                console.warn('알 수 없는 찜 항목 타입:', item.item_type);
        }
    };
    
    const imageUrl = item.image_url || PLACEHOLDER_URL;

    return (
        <TouchableOpacity style={styles.itemRow} onPress={navigateToDetail}>
            <Image 
                source={{ uri: imageUrl }} 
                style={styles.thumb} 
                defaultSource={{ uri: PLACEHOLDER_URL }} 
            />
            <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.title ?? '제목 없음'}</Text>
                <Text style={styles.itemMeta}>
                    <Ionicons name="bookmark" size={12} color="#666" /> 
                    {item.item_type === 'FESTIVAL' ? ' 축제' : item.item_type === 'PRODUCT' ? ' 상품' : ' 여행지'}
                </Text>
                {/* 디버깅용: 주소가 잘 저장되어 있는지 살짝 보여줌 */}
                {/* <Text style={{fontSize:10, color:'#999'}}>{item.location || '주소없음'}</Text> */}
            </View>
            
            <TouchableOpacity style={styles.detailButton} onPress={navigateToDetail}>
                <Text style={styles.detailButtonText}>자세히 보기</Text>
                <Ionicons name="chevron-forward" size={12} color="#fff" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// 찜 항목 섹션
const Section = ({ title, data}) => (
    <View style={{ marginBottom: 18 }}>
        <Text style={styles.sectionTitle}>{title} ({data.length})</Text>
        {data.length === 0 ? (
            <Text style={styles.empty}>찜한 {title} 항목이 없어요.</Text>
        ) : (
            data.map((item) => (
                <FavoriteItemCard 
                    key={`${item.item_type}-${item.item_id}`} 
                    item={item} 
                />
            ))
        )}
    </View>
);


export default function FavoritesScreen({ navigation }) {
    const { festivals, products, spots, isLoading, fetchFavorites } = useFavoritesStore();
    const [refreshing, setRefreshing] = useState(false);
    
    // 화면 포커스 시 자동으로 찜 목록을 새로고침
    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [fetchFavorites])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchFavorites();
        setRefreshing(false);
    }, [fetchFavorites]);

    // 전체 항목 개수 확인 (찜 항목 없을 때 메시지용)
    const allItemsCount = festivals.length + products.length + spots.length;


    // 로딩 상태 표시
    if (isLoading && !refreshing) {
        return (
            <View style={styles.page}>
                <TopBackBar title="찜 목록" />
                <View style={styles.center}>
                    <Text>찜 목록을 불러오는 중입니다...</Text>
                </View>
            </View>
        );
    }
    
    // 찜 항목이 아예 없을 때 
    if (allItemsCount === 0) {
        return (
            <View style={styles.page}>
                <TopBackBar title="찜 목록" />
                <ScrollView 
                    contentContainerStyle={styles.center}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <Ionicons name="heart-dislike-outline" size={50} color="#ccc" style={{ marginBottom: 10 }} />
                    <Text style={styles.emptyTextLarge}>
                        아직 찜한 여행지, 축제, 마켓 상품이 없습니다.
                    </Text>
                    <Text style={styles.suggestionText}>
                        원하는 축제, 상품, 여행지를 찜해보세요!
                    </Text>
                </ScrollView>
            </View>
        );
    }

    return (
    <View style={styles.page}>
      <Header title="찜 목록" /> 
      
      <ScrollView 
      contentContainerStyle={styles.scrollContent}>
        <Section title="추천 여행지" data={spots} /> 
        <Section title="축제" data={festivals} />
        <Section title="마켓 상품" data={products} />
      </ScrollView>
    </View>
);
}
const styles = StyleSheet.create({
    page: { 
      flex: 1, 
      backgroundColor: '#fff',
    },

    scrollContent: {
      padding: 16, 
      paddingBottom: 120,
      paddingTop: 100, // 80 -> 100으로 늘려서 헤더 공간을 확실히 확보
    },

    sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
    empty: { color: '#999', paddingLeft: 10 },
    emptyTextLarge: { fontSize: 16, color: '#888', fontWeight: '500', textAlign: 'center' },
    suggestionText: { fontSize: 14, color: '#aaa', marginTop: 5, textAlign: 'center' },

    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    thumb: { width: 44, height: 44, borderRadius: 8, resizeMode: 'cover' },
    itemName: { fontSize: 15, fontWeight: '700' },
    itemMeta: { color: '#666', marginTop: 2 },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6D99FF',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    detailButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        marginRight: 2,
    },
});