import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../components/TopBackBar';

export default function FestivalsScreen({ navigation }) {
  return (
    <View style={styles.page}>
      <TopBackBar
        title="축제"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('찜')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>축제 목록 (목업)</Text>
        <Text style={styles.p}>지역/기간/테마로 필터링할 수 있어요. 추후 API 연동 예정!</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },
  h1: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  p: { color: '#555', lineHeight: 20 },
});
