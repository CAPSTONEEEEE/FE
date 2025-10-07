// screens/HomeScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_SRC = require('../assets/icons/sosohaeng_logo2.png');

export default function HomeScreen() {
  const insets = useSafeAreaInsets(); // ✅ 안전영역 값 가져오기

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F6F8" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20, // ✅ 상단 여백 추가 (값 조절 가능)
          paddingHorizontal: 20,
          paddingBottom: 120, // 하단바/FAB 겹침 방지
        }}
      >
        {/* 오프닝 문구 */}
        <Text style={styles.title}>소소행에 오신 걸 환영해요 👋</Text>
        <Text style={styles.subtitle}>가까운 추천 여행지와 로컷 축제 및 특산물을 한 눈에!</Text>

        {/* 오프닝 문구 아래 이미지 */}
        <View style={styles.heroWrap}>
          <Image source={HERO_SRC} style={styles.heroImage} />
        </View>

        {/* 섹션 타이틀 */}
        <Text style={styles.title}>SoSoHaeng - 소소행</Text>
        <Text style={styles.sectionTitle}>: RAG 기반 소도시 여행지 추천 및 로컬 커머스 통합 플랫폼</Text>
        <Text style={styles.subtitle}>RAG(검색 증강 생성) 기술을 적용한 AI 챗봇이 숨겨진 소도시 여행지와 축제를 추천하고, 사용자와 소상공인 사이의 실시간 매칭·채팅 시스템을 지원하는 모바일 애플리케이션</Text>
        {/* ...추가 컨텐츠 */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D5EDEF', // 홈 배경색
  },
  title: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#475569',
  },
  heroWrap: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#DDF1F4',
  },
  heroImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,       // 1024x1024 → 정사각형
    resizeMode: 'contain' // 이미지 잘리지 않게
  },
  sectionTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
