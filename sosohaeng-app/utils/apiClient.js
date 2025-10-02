// utils/apiClient.js
//API 통신 담당
import axios from 'axios';

// ❗️ 중요: 'localhost' 대신 컴퓨터의 실제 IP 주소를 사용해야 합니다.
// Mac: 터미널에서 `ifconfig | grep "inet "`
// Windows: 터미널에서 `ipconfig`
// 위 명령어로 나오는 IP 주소 (예: 192.168.1.5)를 사용하세요.
const apiClient = axios.create({
  baseURL: 'https://be-saix.onrender.com/api/v1', // 백엔드 API 기본 주소
  timeout: 10000,
});

export default apiClient;