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
        <Text style={styles.subtitle}>: RAG 기반 소도시 여행지 추천 및 로컬 커머스 통합 플랫폼</Text>

        <Text style={styles.sectionTitle}>🚉여행지 추천</Text>
        <Text style={styles.subtitle}>당신의 취향과 요구사항을 분석해, 소도시의 숨은 명소를 AI가 똑똑하게 골라드립니다.</Text>

        <Text style={styles.sectionTitle}>🎡축제 정보 제공</Text>
        <Text style={styles.subtitle}>지금 가장 가까운 축제·행사 소식을 최신 일정과 함께 한눈에! 놓치기 아까운 즐길 거리를 바로 확인하세요.</Text>

        <Text style={styles.sectionTitle}>🛍️로컬 마켓</Text>
        <Text style={styles.subtitle}>지역 상인의 정직한 특산품을 모아보고, 판매자와 바로 대화해 안심하고 구매 연결까지 간편하게.</Text>
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
    alignItems: 'center',     // 자식(이미지) 수평 중앙정렬
  },
  heroImage: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,       // 1024x1024 → 정사각형
    resizeMode: 'contain', // 이미지 잘리지 않게
    alignSelf: 'center',
  },
  sectionTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
