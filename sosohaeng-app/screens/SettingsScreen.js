import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.page}>
      <Header
        title="설정"
        right={
          <TouchableOpacity onPress={() => navigation.navigate('찜')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>설정 (목업)</Text>
        <Text style={styles.p}>알림, 지역, 테마 등의 사용자 설정을 구성할 수 있어요.</Text>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  h1: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  p: { color: '#555', lineHeight: 20 },
});
