import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../../components/TopBackBar';

export default function ChatbotRecommend() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // 화면 로드 시 자동으로 키보드를 엽니다.
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
    <SafeAreaView style={styles.container}>
      <TopBackBar title="나에게 딱! 맞는 여행" />

      {/* 메시지 목록을 표시하는 영역 */}
      <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.user === 'user' ? styles.userBubble : styles.chatbotBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 키보드와 함께 움직이는 입력 창 */}
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
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#e1ffc7',
  },
  chatbotBubble: {
    alignSelf: 'flex-start',
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
