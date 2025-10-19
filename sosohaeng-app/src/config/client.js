import axios from 'axios';

// 백엔드 API의 기본 URL을 설정합니다.
// 로컬 테스트 시에는 'http://127.0.0.1:8000'을 사용합니다.
// Expo Go 앱에서는 컴퓨터의 로컬 IP 주소를 사용해야 합니다.
// 예: 'http://192.168.0.5:8000'
const BASE_URL = 'http://{host}:8000/api/v1'; // 반드시 본인의 IP 주소로 변경하세요.

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;