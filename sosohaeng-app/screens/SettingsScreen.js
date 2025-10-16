// screens/SettingsScreen.js
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TopBackBar from '../components/TopBackBar';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.page}>
      {/* ✅ 상단바: 타이틀 중앙, 오른쪽에 찜 버튼 고정 */}
      <TopBackBar
        title="설정"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('찜')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      {/* ✅ 스크롤 콘텐츠 (상단바와 분리) */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>설정 (목업)</Text>
        <Text style={styles.p}>알림, 지역, 테마 등의 사용자 설정을 구성할 수 있어요.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },
  h1: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  p: { color: '#555', lineHeight: 20 },
});
