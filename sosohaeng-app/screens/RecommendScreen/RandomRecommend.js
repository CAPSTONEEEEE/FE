import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TopBackBar from '../../components/TopBackBar';

export default function RandomRecommendScreen({ navigation }) {
  const categories = [
    { title: '자연 힐링', emoji: '🏕️' },
    { title: '액티비티', emoji: '🏄' },
    { title: '전시/관람형', emoji: '🎨' },
    { title: '이색 체험', emoji: '🎭' },
  ];

  const handleCategoryPress = (category) => {
    // 여기에 카테고리 선택 시 실행될 로직을 추가합니다.
    alert(`${category.title} 카테고리를 선택했습니다.`);
  };

  return (
    <View style={styles.container}>
      <TopBackBar title="어디로 떠나볼까?" />

      {/* 상단바와 하단바를 제외한 남은 공간을 차지하는 컨텐츠 영역 */}
      <View style={styles.content}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => handleCategoryPress(category)}
          >
            <Text style={styles.emoji}>{category.emoji}</Text>
            <Text style={styles.buttonText}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* 하단바 (사진에 있는 하단바 컴포넌트가 코드에 없으므로, 레이아웃을 위해 가상의 View로 대체합니다.) */}
      <View style={{ height: 60, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1, // 남은 공간을 모두 차지
    flexDirection: 'row',
    flexWrap: 'wrap',
    // 버튼 간의 간격을 균등하게 배분
    justifyContent: 'space-between',
    alignContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  button: {
    width: '48%', // 가로 2개씩 배치
    aspectRatio: 1, // 정사각형
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    // 텍스트와 이모지를 가로/세로 중앙 정렬
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});