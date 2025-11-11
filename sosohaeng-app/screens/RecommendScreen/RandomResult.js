// screens/RecommendScreen/RandomResult.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, useRouter } from 'expo-router'; // ⬅️ 제거
import TopBackBar from '../../components/TopBackBar';
import { Ionicons } from '@expo/vector-icons';

// 💡 목(Mock) 데이터 정의 (임시로 파일 내부에 포함)
const RECOMMENDATION_DATA = {
    '자연 힐링': [
      { id: 101, image: 'https://placehold.co/120x120/A8DADC/000000?text=Forest', title: '제주도 서귀포 비밀의 숲', description: '편백나무 숲길과 예쁜 포토존이 특징입니다.', likes: 128, isLiked: false, tags: ['숲', '힐링'] },
      { id: 102, image: 'https://placehold.co/120x120/A8DADC/000000?text=Mountain', title: '장성 축령산 편백숲', description: '우리나라 최대 규모의 편백숲으로 산림치유에 좋습니다.', likes: 56, isLiked: false, tags: ['산', '공기'] },
      { id: 103, image: 'https://placehold.co/120x120/A8DADC/000000?text=Beach', title: '강릉 안목해변 커피거리', description: '파도 소리를 들으며 커피를 즐기는 힐링 공간.', likes: 99, isLiked: false, tags: ['바다', '커피'] },
    ],
    '액티비티': [
      { id: 201, image: 'https://placehold.co/120x120/FFD1AA/000000?text=Surf', title: '양양 서피 비치', description: '서핑의 성지, 서핑 강습과 해변 파티를 즐길 수 있습니다.', likes: 210, isLiked: false, tags: ['바다', '서핑'] },
      { id: 202, image: 'https://placehold.co/120x120/FFD1AA/000000?text=Rope', title: '경주 월정교 루지', description: '스릴 넘치는 루지를 즐길 수 있는 곳.', likes: 155, isLiked: false, tags: ['놀이', '스릴'] },
    ],
    '전시/관람형': [
      { id: 301, image: 'https://placehold.co/120x120/CDB4DB/000000?text=Museum', title: '파주 헤이리 예술마을', description: '갤러리, 박물관, 공연장 등이 모여있는 예술 공간.', likes: 80, isLiked: false, tags: ['전시', '문화'] },
    ],
    '이색 체험': [
      { id: 401, image: 'https://placehold.co/120x120/BDE0FE/000000?text=Unique', title: '인천 차이나타운', description: '중국 문화를 체험하고 맛있는 음식을 즐길 수 있습니다.', likes: 70, isLiked: false, tags: ['음식', '문화'] },
    ],
};

// navigation prop을 직접 받고 route를 통해 params를 가져옵니다.
export default function RandomResultScreen({ navigation, route }) {
  // 💡 route.params를 통해 title 값을 가져옵니다.
  const { title } = route.params || {}; 

  // 전달받은 title(카테고리)에 따라 목 데이터에서 필터링
  const initialResults = RECOMMENDATION_DATA[title] || [];
  
  const [results, setResults] = useState(initialResults);
  
  // 'RandomResult'는 RandomRecommendStack 내에 있으므로, navigation을 통해 이동합니다.
  const handleItemPress = (item) => {
    // 실제 디테일 화면 경로와 params에 맞게 수정 (예: 'FestivalDetailScreen'을 사용)
    navigation.navigate('FestivalDetailScreen', { itemId: item.id, itemTitle: item.title });
  };
  
  const handleLikePress = (itemToLike) => {
    setResults(prevResults => prevResults.map(item => {
      if (item.id === itemToLike.id) {
        return { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 };
      }
      return item;
    }));
  };

  // 💡 데이터가 로드되지 않았을 경우 (주로 초기 로드 시)
  useEffect(() => {
    if (!title) {
        // title이 없다면 이전 화면으로 돌아갑니다.
        navigation.goBack();
    }
  }, [title]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* TopBackBar는 navigation.goBack()을 사용해야 합니다. */}
      <TopBackBar 
        title="어디로 떠나볼까?" 
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.header}>
        {/* 전달받은 카테고리 제목을 사용 */}
        <Text style={styles.headerTitle}>{title} 여행지 추천결과</Text> 
      </View>

      <ScrollView style={styles.list}>
        {results.length > 0 ? (
          results.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemContainer} 
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <TouchableOpacity style={styles.likeButton} onPress={(e) => { e.stopPropagation(); handleLikePress(item); }}>
                  <Ionicons
                    name={item.isLiked ? "heart" : "heart-outline"} 
                    size={16} 
                    color={item.isLiked ? "#ff4d6d" : "#666"} 
                  />
                  <Text style={styles.likeCount}>{item.likes}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noResult}>
            <Text style={styles.noResultText}>"{title}"에 대한 추천 결과가 없습니다.</Text>
            <Text style={styles.noResultSubText}>다른 카테고리를 선택해보세요.</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fff', // 배경색을 흰색으로 통일
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
    position: 'relative', 
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f6feb',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    paddingRight: 50, 
  },
  likeButton: {
    position: 'absolute', 
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  likeCount: {
    fontSize: 14,
    color: '#ff4d6d',
    marginLeft: 4,
  },
  noResult: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noResultText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  noResultSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  }
});