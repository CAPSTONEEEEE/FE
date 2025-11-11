import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
// API 호출 오류를 피하기 위해 주석 처리하거나, 이전 단계의 가짜 응답을 사용합니다.
// import { sendChatbotMessage } from '../../src/config/api_Recommend'; 

// 참고: require('../../assets/icons/chatbot.png') 경로는 프로젝트 구조에 따라 다를 수 있습니다.
const CHATBOT_ICON = require('../../assets/icons/chatbot.png');

// 💡 챗봇 대본 정의 (정해진 답변 사용 - 대화 심화 버전)
const CHATBOT_RESPONSES = {
    // 1단계: 사용자 입력 '자연이 좋아' 또는 '자연'
    "자연이 좋아":
`자연이 좋으시군요! 🏞️ "자연" 키워드를 입력받았습니다.

**잠깐, 더 심도 있는 추천을 위해 한 가지 질문을 드릴게요!**
당신은 **산**에서 맑은 공기를 마시며 트레킹하는 것을 선호하시나요, 아니면 **바다**에서 시원한 바람을 맞으며 휴식하는 것을 선호하시나요?

'산' 또는 '바다' 중 하나를 입력해주세요!`,

    "자연":
`자연이 좋으시군요! 🏞️ "자연" 키워드를 입력받았습니다.

**잠깐, 더 심도 있는 추천을 위해 한 가지 질문을 드릴게요!**
당신은 **산**에서 맑은 공기를 마시며 트레킹하는 것을 선호하시나요, 아니면 **바다**에서 시원한 바람을 맞으며 휴식하는 것을 선호하시나요?

'산' 또는 '바다' 중 하나를 입력해주세요!`,

    // 2단계: 사용자 입력 '산'
    "산":
`🌲 **산**을 선호하시는군요! 완벽한 힐링을 위한 '숲' 키워드를 확장했습니다.

**당신에게 꼭 맞는 숲/산림 여행지 2곳을 추천해드립니다.**

**1. 제주도 서귀포 사려니 숲길**
설명: 오름 사이를 잇는 숲길로 걷는 것만으로도 힐링이 됩니다. 빽빽한 삼나무와 맑은 공기가 특징입니다.
주소: 제주 서귀포시 비자림로 1421

**2. 장성 축령산 편백숲**
설명: 국내 최대 규모의 편백숲으로 피톤치드가 가득한 산림치유의 공간입니다.
주소: 전남 장성군 장성읍 임종국로 167

마음에 드는 곳이 있으신가요? 🌳`,

    // 2단계: 사용자 입력 '바다'
    "바다":
`🌊 **바다**를 선호하시는군요! 탁 트인 풍경과 힐링을 위한 '해변' 키워드를 확장했습니다.

**당신에게 꼭 맞는 해변/바다 여행지 2곳을 추천해드립니다.**

**1. 강릉 안목해변 커피거리**
설명: 아름다운 동해 바다를 바라보며 유명 카페에서 여유를 즐길 수 있는 곳입니다.
주소: 강원 강릉시 창해로14번길 20

**2. 태안 만리포 해수욕장**
설명: 서해안의 대표적인 해변 중 하나로, 아름다운 일몰과 해변 산책로가 특징입니다.
주소: 충남 태안군 소원면 만리포해수욕장

마음에 드는 곳이 있으신가요? 🏖️`,

    // 디폴트 (예상치 못한 입력, 또는 2단계 이후 추가 대화가 필요할 때)
    "디폴트": "죄송합니다. 아직 '산' 또는 '바다'와 같은 구체적인 답변을 기다리고 있습니다. 다시 한번 '산' 또는 '바다' 중 하나를 입력해 보시겠어요?"
};


export default function ChatbotRecommend() {
  const navigation = useNavigation();
    // 💡 초기 메시지 수정: 질문 내용에 맞게 수정
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
          tabBarStyle: undefined, // 또는 기존 스타일이 있으면 그걸로 되돌리세요
          // 예: { height: 56 } 처럼 프로젝트 기본 tabBarStyle이 있다면 그대로 넣기
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
    const userMessageLower = userMessage.toLowerCase();
    
    // 1. 사용자 메시지 추가
    const newMessage = { id: messages.length, text: userMessage, user: 'user' };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    
    // 2. 로딩 상태 시작 
    setLoading(true);

    // 3. 정해진 답변 가져오기 (키워드 매칭)
    let botResponseText;
    if (userMessageLower.includes('자연이 좋아') || userMessageLower.includes('자연')) {
        botResponseText = CHATBOT_RESPONSES["자연이 좋아"];
    } else if (userMessageLower.includes('바다')) {
        botResponseText = CHATBOT_RESPONSES["바다"];
    } else {
        botResponseText = CHATBOT_RESPONSES["디폴트"];
    }

    // 4. 5초 딜레이 후 챗봇 응답 추가
    setTimeout(() => {
        const chatbotResponse = {
            id: messages.length + 1, // 메시지 목록이 업데이트된 후의 인덱스
            text: botResponseText,
            user: 'chatbot',
            image: CHATBOT_ICON
        };
        
        setMessages(prevMessages => [...prevMessages, chatbotResponse]);
        setLoading(false);
        
        // 5. 키보드 닫히지 않도록 포커스 유지
        if (inputRef.current) {
            inputRef.current.focus(); 
        }
    }, 5000); // 💡 5초 (5000ms) 딜레이 적용
    
  };

  return (
    <SafeAreaView style={styles.page}>
      <TopBackBar
        title={<Text style={styles.titleText}>나에게 딱! 맞는 여행"</Text>}
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('찜')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />
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

// ------------------------------------
// 스타일 코드 (변화 없음)
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
  },
});

