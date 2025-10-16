import React, { useState, useEffect, useRef } from 'react';

import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Keyboard, Image } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import TopBackBar from '../../components/TopBackBar';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { sendChatbotMessage } from '../../src/config/recommend';



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

  const [loading, setLoading] = useState(false);



  const insets = useSafeAreaInsets(); // ✅ SafeAreaInsets 훅 사용

  const TAB_HEIGHT = 60; // ✅ CustomTabBar의 대략적인 높이 (App.js의 TabBar 높이와 맞추세요)

  const INPUT_HEIGHT = 56; // ✅ inputContainer의 높이



  useEffect(() => {

    // 키보드 리스너를 추가하여 키보드가 나타날 때 스크롤을 맨 아래로 이동

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



  const handleSend = async () => {

    if (input.trim() === '') return;



    const userMessage = input;

    const newMessage = { id: messages.length, text: userMessage, user: 'user' };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    setInput('');

    setLoading(true);

    

    try {

      const gptResponse = await sendChatbotMessage(userMessage);

      const chatbotResponse = {

        id: messages.length + 1,

        text: gptResponse.response,

        user: 'chatbot',

        image: require('../../assets/icons/chatbot.png')

      };

      setMessages(prevMessages => [...prevMessages, chatbotResponse]);

    } catch (e) {

      const errorMessage = {

        id: messages.length + 1,

        text: '오류가 발생했습니다. 다시 시도해 주세요.',

        user: 'chatbot',

        image: require('../../assets/icons/chatbot.png')

      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);

      console.error('API 호출 실패:', e);

    } finally {

      setLoading(false);

      if (scrollViewRef.current) {

        scrollViewRef.current.scrollToEnd({ animated: true });

      }

    }

  };



  return (

    <SafeAreaView style={styles.safeAreaContainer}>

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

      

      {/* ScrollView의 하단 패딩을 조정하여 입력창과 겹치지 않도록 함 */}

      <ScrollView

        ref={scrollViewRef}

        style={styles.messageList}

        contentContainerStyle={[

          styles.messageListContent,

          { paddingBottom: INPUT_HEIGHT + TAB_HEIGHT + insets.bottom } // ✅ 패딩 계산

        ]}

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

              <Text style={styles.messageText}>{message.text}</Text>

            </View>

          </View>

        ))}

        {loading && (

          <View style={styles.chatbotMessageRow}>

            <Image source={require('../../assets/icons/chatbot.png')} style={styles.profileImage} />

            <View style={styles.messageBubble}>

              <Text style={styles.messageText}>입력 중...</Text>

            </View>

          </View>

        )}

      </ScrollView>



      {/* ✅ inputContainer를 화면 하단에 고정 */}

      <View style={[styles.inputContainer, { bottom: TAB_HEIGHT + insets.bottom }]}>

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

        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>

          {loading ? (

            <Text style={{color: '#fff'}}>...</Text>

          ) : (

            <Ionicons name="send" size={20} color="#fff" />

          )}

        </TouchableOpacity>

      </View>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safeAreaContainer: {

    flex: 1,

    backgroundColor: '#fff',

  },

  messageList: {

    flex: 1,

    padding: 16,

  },

  messageListContent: {

    flexGrow: 1,

    justifyContent: 'flex-end',

  },

  userMessageRow: {

    flexDirection: 'row',

    justifyContent: 'flex-end',

    marginBottom: 8,

  },

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

    backgroundColor: '#f0f0f0',

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

    // ✅ 화면 하단에 고정

    position: 'absolute',

    left: 0,

    right: 0,

    // bottom: 0, // bottom 값은 useEffect에서 계산

    height: 56, // ✅ 높이 고정

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