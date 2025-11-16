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
import { Ionicons } from '@expo/vector-icons';
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
const RecommendationCard = ({ recommendation, onDetailPress }) => {
  return (
    <View style={cardStyles.cardContainer}>
      {!!recommendation.summaryText && (
        <Text style={cardStyles.summaryText}>{recommendation.summaryText}</Text>
      )}

      {Array.isArray(recommendation.items) &&
        recommendation.items.map((item, index) => (
          <ItemRowWithFavorite
            key={item.contentid || index}
            item={item}
            onDetailPress={onDetailPress}
          />
        ))}

      {!!recommendation.footerText && (
        <Text style={cardStyles.footerText}>{recommendation.footerText}</Text>
      )}
    </View>
  );
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

      // 필요 없으면 주석 처리해도 됨
      // parent.setOptions({
      //   tabBarStyle: { display: 'none' },
      // });

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

    let botResponseText =
      '죄송합니다. 챗봇이 답변을 생성하는 데 실패했습니다. 서버 상태를 확인해주세요. 😟';
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
          botResponseText = rawResponse;
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
        recommendations:
          recommendations.length > 0 ? recommendations : null,
      };

      setMessages((prevMessages) => [...prevMessages, chatbotResponse]);
      setLoading(false);

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleDetailPress = (contentid) => {
    console.log(`상세 보기 요청: ${contentid}`);
    navigation.navigate('TravelSpotDetail', { contentId: contentid });
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
                  {message.text}
                </Text>

                {message.user === 'chatbot' &&
                  message.recommendations && (
                    <RecommendationCard
                      recommendation={{
                        summaryText:
                          message.text.split('\n\n')[0]?.trim() ?? '',
                        items: message.recommendations,
                        footerText:
                          message.text.split('\n\n').pop()?.trim() ?? '',
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
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
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
});
