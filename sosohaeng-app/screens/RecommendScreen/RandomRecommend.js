import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import TopBackBar from '../../components/TopBackBar';
import { Ionicons } from '@expo/vector-icons';

export default function RandomRecommendScreen({ navigation }) {
  const categories = [
    { title: '자연 힐링', emoji: '🏕️' },
    { title: '액티비티', emoji: '🏄' },
    { title: '전시/관람형', emoji: '🎨' },
    { title: '이색 체험', emoji: '🎭' },
  ];

  const handleCategoryPress = (category) => {
    // 여기에 카테고리 선택 시 실행될 로직을 추가합니다.
    navigation.navigate('RandomResult', { category });
  };

  return (
    // ✅ TopBackBar와 나머지 콘텐츠를 하나의 View로 감싸서 오류를 해결합니다.
    <View style={{ flex: 1 }}>
      <TopBackBar
        title="어디로 떠나볼까?"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('찜')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />
      
      <SafeAreaView style={{ flex: 1 }}>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1, // 남은 공간을 모두 차지
    flexDirection: 'row',
    flexWrap: 'wrap',
    // 버튼 간의 간격을 균등하게 배분
    /*
    justifyContent: 'space-evenly',
    alignContent: 'space-evenly',
    paddingHorizontal: 16,
    paddingVertical: 16,*/
    justifyContent: 'space-between',
    alignContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 70,
  },
  button: {
    width: '48%', 
    height: '49%',
    //aspectRatio: 1, 
    backgroundColor:'#FFFBEC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 100,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});