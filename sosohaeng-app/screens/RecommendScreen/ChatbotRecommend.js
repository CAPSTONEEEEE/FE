// screens/ChatbotRecommend.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { sendChatbotMessage } from '../../src/config/api_Recommend';
import { useRouter } from 'expo-router';

// 상태 관리 스토어 (찜 기능 등)
import useFavoritesStore from '../stores/favoritesStore';
import useAuthStore from '../../src/stores/authStore';

const CHATBOT_ICON = require('../../assets/icons/chatbot.png');

// -----------------------------------------------------------------
// [컴포넌트] 개별 여행지 카드 (제목 + 설명 + 찜/상세 버튼)
// -----------------------------------------------------------------
const TravelCard = ({ item, onDetailPress }) => {
  const isFavorite = useFavoritesStore((state) =>
    state.isFavorite(item.contentid, 'SPOT')
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const { token } = useAuthStore.getState();

  const handleFavoritePress = async () => {
    if (!token) {
      Alert.alert('로그인 필요', '찜 기능은 로그인 후에 사용 가능합니다.');
      return;
    }
    await toggleFavorite(
      {
        contentid: item.contentid,
        title: item.title,
        image_url: item.firstimage || null,
        addr1: item.addr1 || '',
      },
      'SPOT'
    );
  };

  return (
    <View style={cardStyles.card}>
      {/* 1. 여행지 정보 영역 */}
      <View style={cardStyles.textContainer}>
        <View style={cardStyles.titleRow}>
           <MaterialCommunityIcons name="map-marker-radius" size={18} color="#2D4C3A" style={{marginRight: 4}}/>
           {/* [타이틀] 볼드체 유지 */}
           <Text style={cardStyles.title}>{item.title}</Text>
        </View>
        
        {/* 주소 대신 AI가 생성한 'ai_summary' 사용 */}
        {/* 만약 ai_summary가 없으면 addr1(주소)을 보여줌 */}
        <Text style={cardStyles.aiDescription}>
            {item.ai_summary ? item.ai_summary : item.addr1}
        </Text>
        
        {/* 주소도 작게 보여줌 */}
        <Text style={cardStyles.addressText}>{item.addr1}</Text>
      </View>

      {/* 2. 액션 버튼 영역 (기존 동일) */}
      <View style={cardStyles.actionRow}>
        <TouchableOpacity 
          onPress={handleFavoritePress} 
          style={cardStyles.iconButton}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF4D6D' : '#888'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={cardStyles.detailButton}
          onPress={() => onDetailPress(item)}
        >
          <Text style={cardStyles.detailButtonText}>자세히 보기</Text>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// -----------------------------------------------------------------
// [메인 화면] ChatbotRecommend
// -----------------------------------------------------------------
export default function ChatbotRecommend() {
  const router = useRouter();

  // 초기 메시지
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: '안녕하십니까? 저는 당신에게 맞는 완벽한 여행지 추천을 도와드릴 소소행입니다. 어떤 여행지를 찾고 계신가요? 원하는 여행지의 테마를 알려주세요 !',
      user: 'chatbot',
      image: CHATBOT_ICON,
    },
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 챗봇 상태 관리 (프로필, 턴 수)
  const [currentProfile, setCurrentProfile] = useState({});
  const [turnCount, setTurnCount] = useState(0);

  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight?.() ?? 0;
  const contentBottomPadding = (insets.bottom || 0) + 56 + tabBarHeight + 12;

  // 자동 스크롤
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // 상세보기 버튼 클릭 핸들러
  const handleDetailPress = (item) => {
    if (!item.contentid) {
      Alert.alert("오류", "여행지 ID 정보가 없습니다.");
      return;
    }

    console.log("Navigating to detail with ID:", item.contentid);

    router.push({
        pathname: `/recommend/nearby/${item.contentid}`,
        params: { 
          contentid: item.contentid,
          title: item.title 
        }
    });
  };

  // 메시지 전송 핸들러
  const handleSend = async () => {
    if (input.trim() === '' || loading) return;

    const userMessage = input.trim();
    
    // 1. 사용자 메시지 추가
    const newMessage = {
      id: messages.length,
      text: userMessage,
      user: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    // 2. API 요청 페이로드
    const payload = JSON.stringify({
      message: userMessage,
      current_profile: currentProfile,
      turn_count: turnCount,
    });

    let botResponseText = "...";
    let recommendationsData = []; // 추천 리스트 (DB 데이터)

    try {
      const apiResponse = await sendChatbotMessage(payload);

      if (apiResponse) {
        // 백엔드 응답 분해
        const rawResponse = apiResponse.response || ""; // AI 텍스트
        recommendationsData = apiResponse.recommendations || []; // DB 리스트

        // --- 프로필 업데이트 로직 (중간 질문 단계) ---
        const profileMarkerStart = rawResponse.indexOf('---PROFILE_UPDATE---');
        const profileMarkerEnd = rawResponse.indexOf('---END_PROFILE---');

        if (profileMarkerStart !== -1 && profileMarkerEnd !== -1) {
          // JSON 파싱 (중간 단계)
          const jsonStart = profileMarkerStart + '---PROFILE_UPDATE---'.length;
          const jsonString = rawResponse.substring(jsonStart, profileMarkerEnd).trim();

          try {
            const parsedData = JSON.parse(jsonString);
            setCurrentProfile(parsedData.current_profile || {});
            setTurnCount(parsedData.turn_count || 0);
            
            // 사용자에게 보여줄 텍스트 (JSON 제외)
            botResponseText = parsedData.next_question || rawResponse.substring(0, profileMarkerStart).trim();
          } catch (e) {
            console.error('프로필 파싱 에러:', e);
            botResponseText = rawResponse;
          }
        } else {
          // --- 최종 추천 단계 ---
          // 텍스트는 그대로 보여주고, 추천 리스트는 별도로 저장
          botResponseText = rawResponse; 
          
          // 최종 단계이므로 프로필 초기화 (선택 사항)
          setCurrentProfile({});
          setTurnCount(0);
        }
      }
    } catch (error) {
      console.error('API 호출 실패:', error);
      botResponseText = "죄송합니다. 서버 연결에 문제가 발생했습니다.";
    } finally {
      // 3. 챗봇 응답 메시지 추가
      const chatbotResponse = {
        id: messages.length + 1,
        text: botResponseText,
        user: 'chatbot',
        image: CHATBOT_ICON,
        recommendations: recommendationsData, // DB에서 받은 구조화된 데이터
      };

      setMessages((prev) => [...prev, chatbotResponse]);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.page} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageListContent,
            { paddingBottom: contentBottomPadding },
          ]}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={
                message.user === 'user'
                  ? styles.userMessageRow
                  : styles.chatbotMessageRow
              }
            >
              {message.user === 'chatbot' && (
                <Image source={message.image} style={styles.profileImage} />
              )}

              <View style={{ maxWidth: '85%' }}>
                {/* 1. 말풍선 (텍스트) */}
                <View
                  style={[
                    styles.messageBubble,
                    message.user === 'user'
                      ? styles.userBubble
                      : styles.chatbotBubble,
                  ]}
                >
                  <Text
                    style={
                      message.user === 'user'
                        ? styles.userMessageText
                        : styles.messageText
                    }
                  >
                    {message.text}
                  </Text>
                </View>

                {/* 2. 추천 리스트가 있을 경우 카드 렌더링 (챗봇만) */}
                {message.user === 'chatbot' && 
                 message.recommendations && 
                 message.recommendations.length > 0 && (
                  <View style={styles.recommendationContainer}>
                    {message.recommendations.map((item, idx) => (
                      <TravelCard 
                        key={item.contentid || idx} 
                        item={item} 
                        onDetailPress={handleDetailPress} 
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.chatbotMessageRow}>
              <Image source={CHATBOT_ICON} style={styles.profileImage} />
              <View style={styles.chatbotBubble}>
                <Text style={styles.messageText}>열심히 여행지를 찾고 있어요... ✈️</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* 입력창 */}
        <View style={[styles.inputContainer, { paddingBottom: (insets.bottom || 0) + 4, marginBottom: 40 }]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="답변을 입력해주세요."
            placeholderTextColor="#999"
            onSubmitEditing={handleSend}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={loading || input.trim() === ''}
          >
             <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -----------------------------------------------------------------
// 스타일 정의
// -----------------------------------------------------------------
const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  messageList: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  messageListContent: { paddingBottom: 20 },
  
  // 메시지 레이아웃
  chatbotMessageRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  userMessageRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  profileImage: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: '#eee' },
  
  // 말풍선 스타일
  messageBubble: { padding: 12, borderRadius: 16, maxWidth: '100%' },
  chatbotBubble: { backgroundColor: '#F0F2F5', borderTopLeftRadius: 4 },
  userBubble: { backgroundColor: '#6D99FF', borderTopRightRadius: 4 },
  
  messageText: { fontSize: 15, color: '#333', lineHeight: 22 },
  userMessageText: { fontSize: 15, color: '#fff', lineHeight: 22 },
  
  // 추천 카드 컨테이너
  recommendationContainer: { marginTop: 12 },

  // 입력창 스타일
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0' 
  },
  input: { 
    flex: 1, height: 44, backgroundColor: '#F8F8F8', borderRadius: 22, 
    paddingHorizontal: 16, marginRight: 10, fontSize: 15, color: '#333' 
  },
  sendButton: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#6D99FF', 
    alignItems: 'center', justifyContent: 'center' 
  },
});

// 카드 전용 스타일
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10, // 카드 간 간격
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  aiDescription: {
    fontSize: 14,       // 본문 크기
    color: '#555',      // 약간 진한 회색
    lineHeight: 20,     // 줄간격 (가독성)
    letterSpacing: -0.5,
  },
  addressText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  iconButton: {
    padding: 4,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D99FF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
});