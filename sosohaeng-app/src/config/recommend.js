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

// POST /random_recommendations 엔드포인트에 테마를 보내는 함수
export const getRandomRecommendations = async (themes) => {
  try {
    const response = await apiClient.post('/random_recommendations', { themes });
    return response.data;
  } catch (error) {
    console.error('랜덤 추천 요청 실패:', error);
    throw error;
  }
};