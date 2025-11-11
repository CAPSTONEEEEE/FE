// utils/apiClient.js
//API 통신 담당
import axios from 'axios';

// Mac: 터미널에서 `ifconfig | grep "inet "`
// Windows: 터미널에서 `ipconfig`
const apiClient = axios.create({
  //baseURL: 'https://be-saix.onrender.com/api/v1', // 백엔드 API 기본 주소
baseURL: 'http://{host}:8000/api/v1',
  timeout: 20000,
});

export default apiClient;
