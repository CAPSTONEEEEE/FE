import React from 'react';
//SafeAreaView를 import 합니다.
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; 
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../../components/TopBackBar'; 


export default function RecommendScreen() {
  const router = useRouter(); 

  const goToFavorites = () => router.push('/favorites');
  const goToRandom = () => router.push('/(recommend)/random'); 
  const goToChatbot = () => router.push('/(recommend)/chatbot');

  return (
    // ✅ 최상위 View를 SafeAreaView로 변경합니다.
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBackBar
        title="여행지 추천"
        right={
          <TouchableOpacity
            onPress={goToFavorites}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.box, { backgroundColor: 'rgba(174, 239, 247, 0.7)' }]}
          onPress={goToRandom}
        >
          <Text style={styles.boxTitle}>어디로 떠나볼까?</Text>
          <Text style={styles.boxDesc}>🪄 당신의 취향에 맞는 여행지를 랜덤으로 골라드려요.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.box, { backgroundColor: 'rgba(225, 249, 206, 0.8)' }]}
          onPress={goToChatbot}
        >
          <Text style={styles.boxTitle}>나에게 딱! 맞는 여행</Text>
          <Text style={styles.boxDesc}>💬 답변을 입력하면, 당신만을 위한 여행지가 찾아갑니다.</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: { 
    flex: 1, 
    padding: 20,
    gap: 20, 
    justifyContent: 'center',
  },
  box: {
    flex: 0.45,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  boxTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  boxDesc: { 
    fontSize: 16, 
    color: '#555' 
  },
});

