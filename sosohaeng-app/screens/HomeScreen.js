import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.text}>소소행에 오신 걸 환영합니다!</Text>
        <Button title="추천 여행지 보기" onPress={() => navigation.navigate('Recommend')} />
        <Button title="지역 축제 보기" onPress={() => navigation.navigate('Festivals')} />
        <Button title="로컬 특산물 보기" onPress={() => navigation.navigate('Specialties')} />
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  content: { alignItems: 'center', gap: 12 },
  text: { fontSize: 18, marginVertical: 16 },
});
