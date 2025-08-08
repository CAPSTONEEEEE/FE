import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FavoritesScreen() {
  return (
    <View style={styles.page}>
      <Header title="찜" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>찜한 항목 (목업)</Text>
        <Text style={styles.p}>상품/축제를 여기서 빠르게 확인할 수 있어요.</Text>
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
