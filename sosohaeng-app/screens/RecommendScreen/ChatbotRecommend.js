import React, { useState, useEffect, useRef } from 'react-native';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';
// API 호출 오류를 피하기 위해 주석 처리하거나, 이전 단계의 가짜 응답을 사용합니다.
// import { sendChatbotMessage } from '../../src/config/api_Recommend'; 

// 참고: require('../../assets/icons/chatbot.png') 경로는 프로젝트 구조에 따라 다를 수 있습니다.
const CHATBOT_ICON = require('../../assets/icons/chatbot.png');

// 💡 챗봇 대본 정의 (정해진 답변 사용 - RAG 효과)
const CHATBOT_RESPONSES = {
    "자연이 좋아": 
`"자연" 키워드를 입력받았습니다. RAG 구조를 통해 다음과 같은 추가 키워드로 확장했습니다.
키워드: [자연, 휴양, 힐링, 숲]

위의 키워드를 기반으로 당신에게 꼭 맞는 여행지 2곳을 추천해드립니다.

**1. 제주도 서귀포 사려니 숲길**
설명: 오름 사이를 잇는 숲길로 걷는 것만으로도 힐링이 됩니다. 빽빽한 삼나무와 맑은 공기가 특징입니다.
주소: 제주 서귀포시 비자림로 1421

**2. 장성 축령산 편백숲**
설명: 국내 최대 규모의 편백숲으로 피톤치드가 가득한 산림치유의 공간입니다.
주소: 전남 장성군 장성읍 임종국로 167`,
    "자연": 
`"자연" 키워드를 입력받았습니다. RAG 구조를 통해 다음과 같은 추가 키워드로 확장했습니다.
키워드: [자연, 휴양, 힐링, 숲]

위의 키워드를 기반으로 당신에게 꼭 맞는 여행지 2곳을 추천해드립니다.

**1. 제주도 서귀포 사려니 숲길**
설명: 오름 사이를 잇는 숲길로 걷는 것만으로도 힐링이 됩니다. 빽빽한 삼나무와 맑은 공기가 특징입니다.
주소: 제주 서귀포시 비자림로 1421

**2. 장성 축령산 편백숲**
설명: 국내 최대 규모의 편백숲으로 피톤치드가 가득한 산림치유의 공간입니다.
주소: 전남 장성군 장성읍 임종국로 167`,
    "디폴트": "죄송합니다. 아직 학습되지 않은 질문이거나 네트워크 문제로 답변을 드릴 수 없습니다. '자연이 좋아'라고 다시 입력해 보시겠어요?"
};


export default function ChatbotRecommend({ navigation }) {
    // 💡 초기 메시지 수정: 질문 내용에 맞게 수정
  const [messages, setMessages] = useState([
    { 
      id: 0, 
      text: '안녕하십니까? 저는 여러분을 도와드릴 소소행입니다. 어떤 여행지를 찾고 계신가요?', 
      user: 'chatbot', 
      image: CHATBOT_ICON
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null); 
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
        title="나에게 딱! 맞는 여행"
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
        contentContainerStyle={styles.messageListContent}
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
      >
        <View style={styles.inputContainer}>
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
