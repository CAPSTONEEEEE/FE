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
import TopBackBar from '../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { sendChatbotMessage } from '../src/config/api_Recommend';

import useFavoritesStore from '../screens/stores/favoritesStore';
import useAuthStore from '../src/stores/authStore';

const CHATBOT_ICON = require('../assets/icons/chatbot.png');

// -----------------------------------------------------------------
// 개별 추천 아이템 + 찜 버튼 + 상세보기 버튼
// -----------------------------------------------------------------
const ItemRowWithFavorite = ({ item, onDetailPress }) => {
  const isFavorite = useFavoritesStore((state) =>
    state.isFavorite(item.contentid, 'SPOT'),
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
        image_url: item.firstimage || item.image_url || null,
      },
      'SPOT',
    );
  };

  return (
    <View key={item.contentid} style={cardStyles.itemRow}>
      <Ionicons
        name="location-sharp"
        size={16}
        color="#6D99FF"
        style={{ marginRight: 8 }}
      />
      <Text style={cardStyles.itemTitle}>{item.title}</Text>

      <TouchableOpacity
        onPress={handleFavoritePress}
        style={cardStyles.favoriteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? '#ff4d6d' : '#999'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={cardStyles.detailButton}
        onPress={() => onDetailPress(item.contentid)}
      >
        <Text style={cardStyles.detailButtonText}>상세 보기</Text>
      </TouchableOpacity>
    </View>
  );
};

// -----------------------------------------------------------------
// 추천 카드 (요약 + 아이템 리스트 + 푸터 텍스트)
// -----------------------------------------------------------------
const RecommendationCard = ({ recommendation, onDetailPress, rawText }) => {
  return (
    <View style={cardStyles.cardContainer}>
      {/* 백엔드에서 파싱된 순수 AI 텍스트를 그대로 표시 */}
      {!!rawText && (
        <Text style={cardStyles.summaryText}>
          {rawText}
        </Text>
      )}

      {/* DB 추천 아이템 목록만 명확하게 표시 */}
      {Array.isArray(recommendation.items) &&
        recommendation.items.map((item, index) => (
          <ItemRowWithFavorite
            key={item.contentid || index}
            item={item}
            onDetailPress={onDetailPress}
          />
        ))}
    </View>
  );
};

const parseFinalButtonResponse = (rawResponse) => {
    const RECOMMENDATION_MARKER = "---RECOMMENDATION---";
    const [headerAndRecommendations, footerRaw] = rawResponse.split('\n※'); 
    
    // 1. 요약 텍스트 추출 (첫 번째 마커 이전까지)
    const summaryText = headerAndRecommendations.split(RECOMMENDATION_MARKER)[0].trim();
    
    // 2. 추천 블록 파싱
    const recommendationBlocks = headerAndRecommendations.split(RECOMMENDATION_MARKER).slice(1);
    
    const items = recommendationBlocks.map(block => {
        const titleMatch = block.match(/\*\*title\*\*\s*:\s*(.*)/);
        const descMatch = block.match(/\*\*description\*\*\s*:\s*(.*)/);
        
        return {
            title: titleMatch ? titleMatch[1].trim() : "도시 이름 없음",
            description: descMatch ? descMatch[1].trim() : "설명 없음"
        };
    }).filter(item => item.title !== "도시 이름 없음"); // 유효한 데이터만 필터링

    // 3. 최종 안내 텍스트 추출
    const footerText = `※${footerRaw}`;

    return {
        summaryText,
        items,
        footerText
    };
};

export default function ChatbotRecommend() {
  const navigation = useNavigation();

  const [messages, setMessages] = useState([
    {
      id: 0,
      text: '안녕하십니까? 저는 당신에게 맞는 완벽한 여행지 추천을 도와드릴 소소행입니다. 어떤 여행지를 찾고 계신가요? 원하는 여행지의 테마를 알려주세요 !',
      user: 'chatbot',
      image: CHATBOT_ICON,
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [currentProfile, setCurrentProfile] = useState({});
  const [turnCount, setTurnCount] = useState(0);

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight?.() ?? 0;

  // 입력창 자체 높이 (대략)
  const INPUT_BAR_HEIGHT = 56;

  // 🔹 메시지 리스트 하단 패딩 = 입력창 + 탭바 + 안전영역
  const contentBottomPadding =
    (insets.bottom || 0) + INPUT_BAR_HEIGHT + tabBarHeight + 12;

  // 이 화면에 들어왔을 때 탭바 숨기고 싶으면 사용 (현재는 남겨둠)
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation?.getParent?.();
      if (!parent) return undefined;
    
      return () => {
        parent.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [navigation]),
  );

  useEffect(() => {
    if (inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || loading) return;

    const userMessage = input.trim();

    const newMessage = {
      id: messages.length,
      text: userMessage,
      user: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput('');

    const payload = JSON.stringify({
      message: userMessage,
      current_profile: currentProfile,
      turn_count: turnCount,
    });

    setLoading(true);

    let botResponseText = "...";
    let structuredButtonData = null;

    let recommendations = [];

    try {
      const apiResponse = await sendChatbotMessage(payload);

      if (apiResponse && apiResponse.response) {
        const rawResponse = apiResponse.response;
        recommendations = apiResponse.recommendations || [];

        const profileMarkerStart =
          rawResponse.indexOf('---PROFILE_UPDATE---');
        const profileMarkerEnd = rawResponse.indexOf('---END_PROFILE---');

        if (profileMarkerStart !== -1 && profileMarkerEnd !== -1) {
          const jsonStart =
            profileMarkerStart + '---PROFILE_UPDATE---'.length;
          const jsonEnd = profileMarkerEnd;
          const jsonString = rawResponse.substring(jsonStart, jsonEnd).trim();

          try {
            const parsedData = JSON.parse(jsonString);

            setCurrentProfile(parsedData.current_profile || {});
            setTurnCount(parsedData.turn_count || 0);

            botResponseText =
              parsedData.next_question ||
              rawResponse.substring(0, profileMarkerStart).trim();
          } catch (e) {
            console.error('클라이언트 JSON 파싱 실패:', e);
            botResponseText = rawResponse;
          }
        } else {
          // 1. 응답 텍스트를 파싱하여 구조화된 버튼 데이터를 추출
           const parsedData = parseFinalButtonResponse(rawResponse);

          // 2. 렌더링에 사용할 필드 저장
          botResponseText = parsedData.summaryText + '\n\n' + parsedData.footerText;
          structuredButtonData = parsedData.items; // 버튼 데이터 저장
                
          // FINAL 모드 시에는 턴 카운트와 프로필을 초기화
          setCurrentProfile({});
          setTurnCount(0);
        }
      }
    } catch (error) {
      console.error('챗봇 API 호출 실패:', error);
    } finally {
      const chatbotResponse = {
            id: messages.length + 1,
            text: botResponseText,
            user: 'chatbot',
            image: CHATBOT_ICON,
            recommendations: structuredButtonData,
        };
        
        setMessages(prevMessages => [...prevMessages, chatbotResponse]);
        setLoading(false);

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

// -----------------------------------------------------------------
// 버튼형 추천 카드 컴포넌트
// -----------------------------------------------------------------
const ButtonRecommendationCard = ({ recommendation, onDetailPress }) => {

    const [likedStatus, setLikedStatus] = useState({});
    const handleLikeToggle = (title) => {
        setLikedStatus(prev => ({ ...prev, [title]: !prev[title] }));
        console.log(`'${title}' 좋아요 상태 토글`);
    };

    return (
        <View style={cardStyles.cardContainer}>
            <Text style={cardStyles.summaryText}>{recommendation.summaryText}</Text>
            
            {/* ⭐️ 추천 도시 목록 렌더링 ⭐️ */}
            <View style={buttonCardStyles.recommendationsList}>
                {recommendation.items.map((item, index) => (
                    <View key={index} style={buttonCardStyles.itemRow}>
                        {/* 1. 도시 이름과 아이콘 */}
                        <View style={buttonCardStyles.itemTextContainer}>
                            <MaterialCommunityIcons 
                                name="map-marker" 
                                size={18} 
                                color="#2D4C3A" // 위치 아이콘 색상
                                style={buttonCardStyles.locationIcon}
                            />
                            <Text style={buttonCardStyles.itemTitle}>{item.title}</Text>
                        </View>

                        {/* 2. 찜 버튼과 상세보기 버튼 */}
                        <View style={buttonCardStyles.actionButtonsContainer}>
                            {/* 찜 버튼 */}
                            <TouchableOpacity 
                                onPress={() => handleLikeToggle(item.title)}
                                style={buttonCardStyles.likeButton}
                            >
                                <MaterialCommunityIcons 
                                    name={likedStatus[item.title] ? "heart" : "heart-outline"} 
                                    size={20} 
                                    color={likedStatus[item.title] ? "#D9534F" : "#777"} // 좋아요 상태에 따른 색상
                                />
                            </TouchableOpacity>

                            {/* 상세보기 버튼 */}
                            <TouchableOpacity 
                                onPress={() => onDetailPress(item.title)} // 상세보기 페이지로 넘어가기 위한 함수
                                style={buttonCardStyles.detailButton}
                            >
                                <Text style={buttonCardStyles.detailButtonText}>상세 보기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* 푸터 텍스트 */}
            {recommendation.footerText ? (
                <Text style={buttonCardStyles.footerText}>
                    {recommendation.footerText}
                </Text>
            ) : null}
        </View>
    );
};

  const handleDetailPress = (cityTitle) => {
    console.log(`상세 보기 요청: ${cityTitle}`);
    Alert.alert("도시 선택", `${cityTitle}에 대해 더 자세히 조사합니다.`); 
};

  return (
    // 🔹 top 인셋은 빼고, left/right/bottom만 적용
    <SafeAreaView
      style={styles.page}
      edges={['left', 'right', 'bottom']}
    >
      {/* <TopBackBar title="여행지 추천 (챗봇)" /> */}

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
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}
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
              {message.user === 'chatbot' && message.image && (
                <Image source={message.image} style={styles.profileImage} />
              )}

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
                  {/* QUESTION 모드 메시지 또는 FINAL 모드의 텍스트 응답 */}
                  {message.text}
                </Text>

                {message.user === 'chatbot' && message.recommendations && (
                <ButtonRecommendationCard 
                    recommendation={{
                        summaryText: message.text.split('\n\n')[0].trim(), 
                        items: message.recommendations, // 이 필드에 버튼 데이터(title, description)가 담김
                        footerText: message.text.split('\n\n').pop().trim() 
                    }}
                    onDetailPress={handleDetailPress}
                />
              )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.chatbotMessageRow}>
              <Image source={CHATBOT_ICON} style={styles.profileImage} />
              <View style={styles.chatbotBubble}>
                <Text style={styles.messageText}>
                  답변을 생성 중입니다...
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 10 }} />
        </ScrollView>

        {/* 🔹 입력창: 탭바 높이만큼 marginBottom 줘서 가려지지 않게 */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: (insets.bottom || 0) + 4,
              marginBottom: 40,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="어떤 여행을 떠나고 싶으신가요?"
            placeholderTextColor="#999"
            onSubmitEditing={handleSend}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={loading || input.trim() === ''}
          >
            {loading ? (
              <Text style={{ color: '#fff', fontSize: 16 }}>...</Text>
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -----------------------------------------------------------------
// 스타일
// -----------------------------------------------------------------
const cardStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
    lineHeight: 20,
  },
  footerText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 13,
    color: '#333',
    flexShrink: 1,
    marginRight: 8,
  },
  favoriteButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 4,
  },
  detailButton: {
    backgroundColor: '#6D99FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailButtonText: {
    fontSize: 12,
    color: '#fff',
  },
});

const buttonCardStyles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    summaryText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
        lineHeight: 20,
    },
    recommendationsList: {
        marginTop: 5,
        marginBottom: 10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // 양쪽 끝으로 정렬
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // 남은 공간을 차지하도록 flex 설정
    },
    locationIcon: {
        marginRight: 8,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D4C3A', // 도시 이름 색상
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // 버튼 간의 간격 조정
    },
    likeButton: {
        padding: 5, // 터치 영역 확보
        marginRight: 10, // 상세보기 버튼과의 간격
    },
    detailButton: {
        backgroundColor: '#6C757D', // 상세보기 버튼 배경색
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    footerText: {
        fontSize: 12,
        color: '#777',
        marginTop: 10,
        lineHeight: 18,
    },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8, // 첫 메시지 위 여백 최소화
  },
  messageListContent: {
    paddingBottom: 16,
  },
  chatbotMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  chatbotBubble: {
    backgroundColor: '#F3F3F3',
    padding: 10,
    borderRadius: 15,
    borderTopLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: '#6D99FF',
    padding: 10,
    borderRadius: 15,
    borderTopRightRadius: 0,
    maxWidth: '80%',
  },
  messageBubble: {
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  userMessageText: {
    fontSize: 15,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 8,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6D99FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityButton: {
    backgroundColor: '#F8F8F8', // 배경색
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'flex-start',
  },
  cityButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  cityButtonDesc: {
    fontSize: 13,
    color: '#666',
  },
});
