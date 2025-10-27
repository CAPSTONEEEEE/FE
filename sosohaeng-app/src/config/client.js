import axios from 'axios';
import { API_BASE_URL } from './api';

const FINAL_BASE_URL = API_BASE_URL + '/api/v1'; 

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: FINAL_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;