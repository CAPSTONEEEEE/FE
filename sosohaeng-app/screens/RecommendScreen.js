import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

export default function RecommendScreen({ navigation }) {
  return (
    <View style={styles.page}>
      <Header
        title="추천"
        right={
          <TouchableOpacity onPress={() => navigation.navigate('찜')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>맞춤 추천 (목업)</Text>
        <Text style={styles.p}>최근 본 상품/축제 기반 추천을 제공합니다. 추후 모델/백엔드 연동!</Text>
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


/*
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RecommendScreen() {
  return (
    <View style={styles.page}>
      <Header title="추천" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>맞춤 추천 (목업)</Text>
        <Text style={styles.p}>
          최근 본 상품/축제 기반 추천을 제공합니다. 추후 모델/백엔드 연동!
        </Text>
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
*/


/* 초기세팅
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RecommendScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text>여행지 추천 페이지입니다.</Text>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  content: { alignItems: 'center', paddingTop: 40 },
});
*/