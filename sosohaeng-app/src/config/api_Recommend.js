import apiClient from './client';

// POST /chatbot 엔드포인트에 메시지를 보내는 함수
export const sendChatbotMessage = async (message) => {
  try {
    const response = await apiClient.post('/chatbot', { message });
    return response.data; // 서버에서 받은 데이터 반환
  } catch (error) {
    console.error('챗봇 메시지 전송 실패:', error);
    throw error;
  }
};