// screens/HomeScreen.js 
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 

const HERO_SRC = require('../assets/icons/sosohaeng_logo2.png'); // 소소행 로고

// 기능별 카드를 위한 컴포넌트
const FeatureCard = ({ iconName, title, description, color, onPress }) => (
  <TouchableOpacity 
    style={[cardStyles.cardContainer, { borderLeftColor: color }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name={iconName} size={20} color={color} style={{ marginRight: 10 }} />
    <View style={cardStyles.textContainer}>
      <Text style={[cardStyles.title, { color: color }]}>{title}</Text>
      <Text style={cardStyles.description}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
  </TouchableOpacity>
);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); 

  const [nickname, setNickname] = useState("여행가 소소행"); 

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 나중에 실제 닉네임 로드 로직 추가
        // const storedName = await AsyncStorage.getItem('userNickname');
        // if (storedName) setNickname(storedName);
      } catch (e) {
        console.error("사용자 정보 로드 실패", e);
      }
    };
    fetchUserInfo();
  }, []);
  
  // 네비게이션 이동 함수들
  const handleGoToFavorites = () => router.push('/(tabs)/favorites');
  const handleGoToChatbot = () => router.push('/(tabs)/recommend'); 
  const handleGoToFestivals = () => router.push('/(tabs)/festivals');
  const handleGoToMarket = () => router.push('/(tabs)/market');
  
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F6F8" />
      
      {/* 찜 버튼 */}
      <TouchableOpacity
        style={[styles.favoritesButton, { top: insets.top + 5 }]} 
        onPress={handleGoToFavorites} 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="heart-outline" size={24} color="#ff4d6d" />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 40, 
          paddingHorizontal: 20,
          paddingBottom: 120, 
        }}
      >
        {/* 사용자 환영 섹션 */}
        <View style={styles.userHeader}>
          <Text style={styles.welcomeText}>
            안녕하세요, <Text style={{fontWeight: '900', color: '#0F172A'}}>{nickname}님!</Text> 👋
          </Text>
        </View>

        {/* 히어로 이미지 */}
        <View style={styles.heroWrap}>
          <Image source={HERO_SRC} style={styles.heroImage} />
        </View>
        
        {/* 액션 섹션 (맞춤 추천) */}
        <View style={styles.actionSection}>
           <Text style={styles.actionTitle}>오늘의 소소행 추천</Text>
           <TouchableOpacity 
             style={styles.actionButton}
             onPress={handleGoToChatbot}
           >
              <Text style={styles.actionButtonText}>맞춤 추천 시작하기</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
           </TouchableOpacity>
        </View>

        {/* 주요 기능 리스트 */}
        <Text style={styles.mainTitle}>소소행 핵심 서비스</Text>

        <FeatureCard 
          iconName="compass-outline"
          title="AI 여행지 추천"
          description="취향에 맞는 소도시의 숨은 명소를 AI가 똑똑하게 찾아줘요."
          color="#6D99FF"
          onPress={handleGoToChatbot}
        />

        <FeatureCard 
          iconName="calendar-outline"
          title="로컬 축제 정보"
          description="가까운 축제·행사 소식과 일정을 최신 정보로 한눈에 확인하세요."
          color="#FF6347"
          onPress={handleGoToFestivals}
        />

        <FeatureCard 
          iconName="storefront-outline"
          title="지역 마켓/특산물"
          description="지역 상인의 특산품을 모아보고, 판매자와 바로 연결해 구매해요."
          color="#00A896"
          onPress={handleGoToMarket}
        />
        
      </ScrollView>
    </View>
  );
}

// ------------------------------------
// 스타일 코드
// ------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D5EDEF', 
  },
  favoritesButton: { 
    position: 'absolute',
    right: 20,
    zIndex: 10, 
    padding: 5,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  heroWrap: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#DDF1F4',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroImage: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#6D99FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 5,
    fontSize: 14,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 10,
  }
});

const cardStyles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#eee', // 기본값
  },
  textContainer: {
    flex: 1,
    marginLeft: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});