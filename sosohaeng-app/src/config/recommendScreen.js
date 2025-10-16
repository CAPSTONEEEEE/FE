import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Keyboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendChatbotMessage } from './recommend';

export default function ChatbotRecommend({ navigation }) {
  const [messages, setMessages] = useState([
    { 
      id: 0, 
      text: '안녕하세요! 당신의 여행을 도와드릴 소소행 챗봇입니다.\n어떤 여행지를 찾고 계신가요?', 
      user: 'chatbot', 
      image: require('../../assets/icons/chatbot.png')
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState(false); // <-- 로딩 상태 추가

  useEffect(() => {
    // 키보드가 나타났을 때 스크롤을 맨 아래로 이동
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }
    );
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSend = async () => { // <-- async 함수로 변경
    if (input.trim() === '') return;

    // 1. 사용자 메시지 추가
    const userMessage = input;
    const newMessage = { id: messages.length, text: userMessage, user: 'user' };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    
    // 2. 로딩 상태 시작 (챗봇 응답 대기)
    setLoading(true);
    
    // 3. 백엔드 API 호출
    try {
      const gptResponse = await sendChatbotMessage(userMessage); // <-- API 호출
      
      // 4. 챗봇 응답 메시지 추가
      const chatbotResponse = {
        id: messages.length + 1, // 새로운 ID 부여
        text: gptResponse.response,
        user: 'chatbot',
        image: require('../../assets/icons/chatbot.png')
      };
      setMessages(prevMessages => [...prevMessages, chatbotResponse]);
    } catch (e) {
      // API 호출 실패 시 오류 메시지 추가
      const errorMessage = {
        id: messages.length + 1,
        text: '오류가 발생했습니다. 다시 시도해 주세요.',
        user: 'chatbot',
        image: require('../../assets/icons/chatbot.png')
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      console.error('API 호출 실패:', e);
    } finally {
      // 5. 로딩 상태 종료
      setLoading(false);
      // 스크롤을 맨 아래로 이동
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
      
      <ScrollView ref={scrollViewRef} style={styles.messageList} contentContainerStyle={styles.messageListContent}>
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
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          </View>
        ))}
        {loading && ( // <-- 로딩 중 표시
          <View style={styles.chatbotMessageRow}>
            <Image source={require('../../assets/icons/chatbot.png')} style={styles.profileImage} />
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>입력 중...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputIcon}>
            <Ionicons name="add" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            {loading ? ( // <-- 로딩 중 아이콘 변경
              <Text>...</Text>
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... (기존 스타일 코드)
const styles = StyleSheet.create({
  // ... (기존 스타일)
});