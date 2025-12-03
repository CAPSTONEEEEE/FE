// FE/sosohaeng-app/src/config/api.js
import apiClient from './client';

// 1. 여기에 1단계에서 찾은 본인 Mac의 Wi-Fi IP 주소를 입력하세요.
const MY_MAC_IP = '?????????'; 

// 2. BE 서버 주소를 '/api/v1' 없이 루트로 설정합니다.
let base = `http://${MY_MAC_IP}:8000`;

// 3. API_BASE_URL은 /api/v1을 포함한 주소로 만듭니다.
// (다른 코드들이 API_BASE_URL을 사용할 수 있으므로 유지)
export const API_BASE_URL = `${base}/api/v1`;

// 4. BE 루트 URL도 export합니다.
// (ProductCreateScreen, MarketHome 등에서 사용)
export const SERVER_ROOT_URL = base;

console.log("✅ 현재 설정된 API_BASE_URL:", API_BASE_URL);
console.log("✅ 현재 설정된 SERVER_ROOT_URL:", SERVER_ROOT_URL);

// ----------------------------------------------------
// 5. Favorites API 함수 
// ----------------------------------------------------

/**
 * 찜 상태 토글. (POST 요청)
 * @param {string} item_type - 찜 항목의 종류 (FESTIVAL, PRODUCT, SPOT)
 * @param {number|string} item_id - 찜 항목의 고유 ID
 * @param {string} token - 인증 토큰
 * @returns {Promise<object>} 응답 데이터
 */
export async function toggleFavorite(item_type, item_id, token) {
    const endpoint = '/favorites/'; 
    
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const data = {
        item_type: item_type,
        item_id: String(item_id)
    };

    try {
        const response = await apiClient.post(endpoint, data, config);
        // 서버에서 204 No Content를 반환할 수 있으므로, data가 없을 수 있습니다.
        return response.data; 
    } catch (error) {
        console.error("Axios Toggle Favorite Failed:", error.response?.data || error.message);
        throw error;
    }
}


/**
 * 사용자의 전체 찜 목록을 조회합니다. (GET 요청)
 * @param {string} token - 인증 토큰
 * @returns {Promise<object>} 
 */
export async function getFavorites(token) {
    const endpoint = '/favorites/';
    
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        const response = await apiClient.get(endpoint, config);
        return response.data;
    } catch (error) {
        console.error("Axios Get Favorites Failed:", error.response?.data || error.message);
        throw error;
    }
}