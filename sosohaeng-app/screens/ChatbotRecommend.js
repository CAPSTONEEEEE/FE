import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { sendChatbotMessage } from '../src/config/api_Recommend'; 

const CHATBOT_ICON = require('../assets/icons/chatbot.png');

const RecommendationCard = ({ recommendation, onDetailPress }) => {
  return (
    <View style={cardStyles.cardContainer}>
      <Text style={cardStyles.summaryText}>{recommendation.summaryText}</Text>
      
      {recommendation.items.map((item, index) => (
        <View key={index} style={cardStyles.itemRow}>
          <Ionicons name="location-sharp" size={16} color="#6D99FF" style={{ marginRight: 8 }} />
          <Text style={cardStyles.itemTitle}>{item.title}</Text>
          <TouchableOpacity 
            style={cardStyles.detailButton} 
            onPress={() => onDetailPress(item.contentid)}
          >
            <Text style={cardStyles.detailButtonText}>상세 보기</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {recommendation.footerText && (
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
      image: CHATBOT_ICON
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null); 
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // 하단 탭바 + 홈바(안전영역) 높이만큼 띄우기 위한 계산
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight?.() ?? 0;
  const INPUT_BAR_HEIGHT = 30;                 // 입력창(버튼/패딩 포함) 대략 높이
  const bottomGap = tabBarHeight + insets.bottom - 40;

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation?.getParent?.();
      if (!parent) return undefined;

      // 탭바 숨기기
      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });

      // 화면을 떠날 때 원상 복구
      return () => {
        parent.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [navigation])
  );

  // 1. 컴포넌트 마운트 시 TextInput에 자동 포커스 
  useEffect(() => {
    if (inputRef.current) {
        const timer = setTimeout(() => {
            inputRef.current.focus();
        }, 300); 
        return () => clearTimeout(timer);
    }
  }, []); 

  // 2. 메시지가 업데이트되거나 콘텐츠 크기가 바뀔 때 스크롤을 맨 아래로 이동
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
    
    // 1. 사용자 메시지 추가
    const newMessage = { id: messages.length, text: userMessage, user: 'user' };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    
    // 2. 로딩 상태 시작 
    setLoading(true);

    let botResponseText = "죄송합니다. 챗봇이 답변을 생성하는 데 실패했습니다. 서버 상태를 확인해주세요. 😟";
    
    try {
        // 3. API 호출
        const apiResponse = await sendChatbotMessage(userMessage);
        
        // 4. 챗봇 응답 텍스트 추출
        if (apiResponse && apiResponse.response) {
            botResponseText = apiResponse.response;
        }

    } catch (error) {
        console.error("챗봇 API 호출 실패:", error);
    } finally {
        // 5. 챗봇 응답 추가
        const chatbotResponse = {
            id: messages.length + 1,
            text: botResponseText,
            user: 'chatbot',
            image: CHATBOT_ICON
        };
        
        setMessages(prevMessages => [...prevMessages, chatbotResponse]);
        setLoading(false);
        
        // 6. 키보드 닫히지 않도록 포커스 유지
        if (inputRef.current) {
            inputRef.current.focus(); 
        }
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <TopBackBar
        title={<Text style={styles.titleText}>나에게 딱! 맞는 여행</Text>}
        right={
          <TouchableOpacity
            // 라우팅 오류 해결을 위해 Main 스택을 통해 '찜'으로 이동하도록 수정
            onPress={() => navigation.navigate('Main', { screen: '찜' })} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />{ }
      <ScrollView
        ref={scrollViewRef} 
        style={styles.messageList} 
        contentContainerStyle={[
          styles.messageListContent,
          { paddingBottom: bottomGap + INPUT_BAR_HEIGHT }
        ]}
        onContentSizeChange={() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }
        }}
      >
        {messages.map((message, index) => (
          <View key={index} style={message.user === 'user' ? styles.userMessageRow : styles.chatbotMessageRow}>
            {message.user === 'chatbot' && message.image && (
              <Image source={message.image} style={styles.profileImage} />
            )}
            <View
              style={[
                styles.messageBubble,
                message.user === 'user' ? styles.userBubble : styles.chatbotBubble,
              ]}
            >
              <Text style={message.user === 'user' ? styles.userMessageText : styles.messageText}>
                  {message.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={styles.chatbotMessageRow}>
            <Image source={CHATBOT_ICON} style={styles.profileImage} />
            <View style={styles.chatbotBubble}>
              <Text style={styles.messageText}>답변을 생성 중입니다...</Text>
            </View>
          </View>
        )}
        <View style={{ height: 10 }} /> {/* 메시지 목록 하단 여백 */}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputContainer, { marginBottom: bottomGap }]}>
          <TouchableOpacity style={styles.inputIcon} disabled={loading}>
            <Ionicons name="add" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            ref={inputRef} 
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#999"
            onSubmitEditing={handleSend}
            editable={!loading}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading || input.trim() === ''}>
            {loading ? (
              <Text style={{color: '#fff', fontSize: 16}}>...</Text>
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



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
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    color: '#555',
  },
  detailButton: {
    backgroundColor: '#6D99FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 10,
    fontSize: 14,
    color: '#777',
    textAlign: 'right',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  }
});

// ------------------------------------
// 스타일 코드
// ------------------------------------
const styles = StyleSheet.create({
  titleText: { fontSize: 17, fontWeight: '700', color: '#111' },
  page: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  // 대화 목록 (화면의 대부분을 차지해야 함)
  messageList: {
    flex: 1, 
    paddingHorizontal: 10,
  },
  messageListContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  
  // 챗봇 메시지 줄 (왼쪽 정렬)
  chatbotMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    maxWidth: '85%', 
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#eee'
  },
  chatbotBubble: {
    backgroundColor: '#F3F3F3', 
    padding: 10,
    borderRadius: 15,
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  
  // 사용자 메시지 줄 (오른쪽 정렬)
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    marginLeft: '15%', 
  },
  userBubble: {
    backgroundColor: '#6D99FF', 
    padding: 10,
    borderRadius: 15,
    borderTopRightRadius: 0,
  },
  userMessageText: {
    fontSize: 15,
    color: '#fff', 
  },

  // 입력창 컨테이너
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  inputIcon: {
    padding: 5,
  },
  textInput: {
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
  }
});