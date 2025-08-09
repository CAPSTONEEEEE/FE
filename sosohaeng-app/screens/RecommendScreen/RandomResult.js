import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import TopBackBar from '../../components/TopBackBar';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function RandomResultScreen({ navigation }) {
  const route = useRoute();
  const { category } = route.params;

  const initialResults = [
    {
      id: 1,
      image: 'https://placehold.co/120x120/E5E5E5/000000?text=Image',
      title: '제주도 서귀포 비밀의숲',
      description: '편백나무가 만들어낸 숲길과 예쁜 포토존이 특징. 햇살과 반짝이는 잎 사이를 걷는 동안 마음이 맑아지는 기분을 줍니다.',
      likes: 128,
      isLiked: false,
    },
    {
      id: 2,
      image: 'https://placehold.co/120x120/E5E5E5/000000?text=Image',
      title: '장성 축령산 편백숲',
      description: '우리나라 최대 규모의 편백숲으로, 숲속 트레킹과 산림치유 콘텐츠가 잘 갖춰져 있어 온몸이 정화되는 힐링 공간이에요.',
      likes: 56,
      isLiked: false,
    },
    {
      id: 3,
      image: 'https://placehold.co/120x120/E5E5E5/000000?text=Image',
      title: '제주도 서귀포 비밀의숲',
      description: '편백나무가 만들어낸 숲길과 예쁜 포토존이 특징. 햇살과 반짝이는 잎 사이를 걷는 동안 마음이 맑아지는 기분을 줍니다.',
      likes: 11,
      isLiked: false,
    },
    {
      id: 4,
      image: 'https://placehold.co/120x120/E5E5E5/000000?text=Image',
      title: '장성 축령산 편백숲',
      description: '우리나라 최대 규모의 편백숲으로, 숲속 트레킹과 산림치유 콘텐츠가 잘 갖춰져 있어 온몸이 정화되는 힐링 공간이에요.',
      likes: 56,
      isLiked: false,
    },
    {
      id: 5,
      image: 'https://placehold.co/120x120/E5E5E5/000000?text=Image',
      title: '제주도 서귀포 비밀의숲',
      description: '편백나무가 만들어낸 숲길과 예쁜 포토존이 특징. 햇살과 반짝이는 잎 사이를 걷는 동안 마음이 맑아지는 기분을 줍니다.',
      likes: 11,
      isLiked: false,
    },
  ];

  const [results, setResults] = useState(initialResults);

  const handleItemPress = (item) => {
    alert(`'${item.title}' 상세 페이지로 이동합니다.`);
  };
  
  const handleLikePress = (itemToLike) => {
    setResults(prevResults => prevResults.map(item => {
      if (item.id === itemToLike.id) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1,
        };
      }
      return item;
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBackBar title="어디로 떠나볼까?" />

      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{category.emoji}</Text>
        <Text style={styles.headerTitle}>{category.title} 여행지 추천결과</Text>
      </View>

      <ScrollView style={styles.list}>
        {results.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.itemContainer} 
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            {/* 텍스트 컨테이너 내부에 하트 버튼을 배치하여 위치를 조정합니다. */}
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <TouchableOpacity style={styles.likeButton} onPress={() => handleLikePress(item)}>
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={16} 
                  color={item.isLiked ? "#ff4d6d" : "#666"} 
                />
                <Text style={styles.likeCount}>{item.likes}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#F5F5F5',
  },
  headerEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 이미지를 위쪽에 정렬
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
    position: 'relative', // 하트 버튼의 절대 위치 기준
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    paddingRight: 50, // 하트 버튼과 겹치지 않도록 패딩 추가
  },
  likeButton: {
    position: 'absolute', // 절대 위치로 지정
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
});
