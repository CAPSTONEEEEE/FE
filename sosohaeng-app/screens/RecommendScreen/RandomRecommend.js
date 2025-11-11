// RandomRecommendScreen.js

// import { useRouter } from 'expo-router'; // ⬅️ useRouter 제거
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBackBar from '../../components/TopBackBar';
import { Ionicons } from '@expo/vector-icons';
// 💡 useNavigation 훅 임포트
import { useNavigation } from '@react-navigation/native'; 

// 💡 수정: navigation prop을 제거하고 훅을 사용합니다.
export default function RandomRecommendScreen() {
  // const router = useRouter(); // ⬅️ 제거. navigation을 사용합니다.
  const navigation = useNavigation(); // 💡 useNavigation 훅을 사용하여 navigation 객체 가져옴

  const categories = [
    { title: '자연 힐링', emoji: '🏕️' },
    { title: '액티비티', emoji: '🏄' },
    { title: '전시/관람형', emoji: '🎨' },
    { title: '이색 체험', emoji: '🎭' },
  ];

  const handleCategoryPress = (category) => {
    // RandomResultScreen.js에 등록된 이름인 'RandomResult'로 이동합니다.
    // navigation 객체가 이제 훅을 통해 정의되었으므로 오류가 사라져야 합니다.
    navigation.navigate('RandomResult', { title: category.title });
  };
  
  // '찜' 화면 이동 함수
  const handleFavoritesPress = () => {
    navigation.navigate('찜'); 
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBackBar
        title="어디로 떠나볼까?"
        right={
          <TouchableOpacity
            onPress={handleFavoritesPress} 
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

