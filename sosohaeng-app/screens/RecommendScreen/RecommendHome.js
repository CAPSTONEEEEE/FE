import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../../components/TopBackBar';

export default function RecommendHome({ navigation }) {
  return (
    <View style={styles.page}>
      <TopBackBar
        title="여행지 추천"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('찜')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.box, { backgroundColor: 'rgba(174, 239, 247, 0.7)' }]}
          onPress={() => navigation.navigate('RandomRecommend')}
        >
          <Text style={styles.boxTitle}>어디로 떠나볼까?</Text>
          <Text style={styles.boxDesc}>🪄 당신의 취향에 맞는 여행지를 랜덤으로 골라드려요.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.box, { backgroundColor: 'rgba(225, 249, 206, 0.8)' }]}
          onPress={() => navigation.navigate('ChatbotRecommend')}
        >
          <Text style={styles.boxTitle}>나에게 딱! 맞는 여행</Text>
          <Text style={styles.boxDesc}>💬 답변을 입력하면, 당신만을 위한 여행지가 찾아갑니다.</Text>
        </TouchableOpacity>
      </View>
      
      {/* 하단바 (가상의 뷰로 대체) */}
      <View style={{ height: 60, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: { 
    flex: 1, 
    paddingTop: 36,
    paddingBottom: 36 + 60 / 2,
    paddingHorizontal: 16, 
    justifyContent: 'space-between',
  },
  box: {
    flex: 0.48,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
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