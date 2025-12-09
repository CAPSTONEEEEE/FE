import axios from 'axios';
import { API_BASE_URL } from './api';

//const FINAL_BASE_URL = 'http://{본인IP주소}:8000/api/v1';
const FINAL_BASE_URL = 'https://sosohaeng-server.onrender.com/api/v1';


// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: FINAL_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const sendChatbotMessage = async (payload) => {
  try {
    const response = await apiClient.post('/recommend/chatbot', payload, {
        timeout: 60000 // 여기에도 명시적으로 60초 설정
    });
    return response.data;
  } catch (error) {
    console.error("챗봇 메시지 전송 실패:", error);
    throw error;
  }
};

export default apiClient;