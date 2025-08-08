import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons';

export default function FestivalsScreen({ navigation }) {
  return (
    <View style={styles.page}>
      <Header
        title="축제"
        right={
          <TouchableOpacity onPress={() => navigation.navigate('찜')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>축제 목록 (목업)</Text>
        <Text style={styles.p}>지역/기간/테마로 필터링할 수 있어요. 추후 API 연동 예정!</Text>
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

export default function FestivalsScreen() {
  return (
    <View style={styles.page}>
      <Header title="축제" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>축제 목록 (목업)</Text>
        <Text style={styles.p}>지역/기간/테마로 필터링할 수 있어요. 추후 API 연동 예정!</Text>
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

export default function FestivalsScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text>지역 축제 정보를 보여주는 페이지입니다.</Text>
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