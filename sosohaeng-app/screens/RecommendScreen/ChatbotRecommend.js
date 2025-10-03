import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Keyboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../../components/TopBackBar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatbotRecommend({ navigation }) {
  const [messages, setMessages] = useState([
    { 
      id: 0, 
      text: '안녕하세요! 당신의 여행을 도와드릴 &&&입니다!\n\n### 문구 추가 예정 ###', 
      user: 'chatbot', 
      image: require('../../assets/icons/chatbot.png')
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // 키보드가 나타났을 때 수행할 작업
      }
    );

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = { id: messages.length, text: input, user: 'user' };
    setMessages([...messages, newMessage]);
    setInput('');
    // TODO: 여기에 GPT API 호출 로직 추가
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
      
      <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent}>
        {messages.map((message) => (
          <View key={message.id} style={message.user === 'user' ? styles.userMessageRow : styles.chatbotMessageRow}>
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
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
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
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageListContent: {
    justifyContent: 'flex-end',
  },
  // 나의 메시지 행을 위한 스타일
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  // 챗봇 메시지 행을 위한 스타일
  chatbotMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    overflow: 'hidden',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#e1ffc7',
  },
  chatbotBubble: {
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007aff',
    borderRadius: 24,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
