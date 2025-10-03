// RandomRecommendScreen.js

import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBackBar from '../../components/TopBackBar';
import { Ionicons } from '@expo/vector-icons';

export default function RandomRecommendScreen() {
  //useRouter 훅을 사용
  const router = useRouter();

  const categories = [
    { title: '자연 힐링', emoji: '🏕️' },
    { title: '액티비티', emoji: '🏄' },
    { title: '전시/관람형', emoji: '🎨' },
    { title: '이색 체험', emoji: '🎭' },
  ];

  const handleCategoryPress = (category) => {
    // RandomResult 화면의 실제 경로에 맞게 pathname을 확인하세요.
    router.push({
      pathname: '/(recommend)/result',
      params: { title: category.title } // 객체 전체 대신 필요한 데이터만 전달하는 것이 좋습니다.
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBackBar
        title="어디로 떠나볼까?"
        right={
          <TouchableOpacity
            // '찜' 화면의 실제 경로가 '/favorites'라고 가정했습니다.
            onPress={() => router.push('/favorites')}
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
    </SafeAreaView>
  );
}

// 스타일 코드
const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 70,
  },
  button: {
    width: '48%',
    height: '49%',
    backgroundColor: '#FFFBEC',
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