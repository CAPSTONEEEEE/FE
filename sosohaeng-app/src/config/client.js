import axios from 'axios';
import { API_BASE_URL } from './api';\

const FINAL_BASE_URL = 'http://10.240.10.28:8000/api/v1'; 

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: FINAL_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;