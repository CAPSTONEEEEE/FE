// screens/stores/favoritesStore.js
import { create } from 'zustand';
import { produce } from 'immer';
import { toggleFavorite, getFavorites } from '../../src/config/api'; 
import useAuthStore from '../../src/stores/authStore'; 

const initialState = {
    festivals: [], 
    products: [], 
    spots: [], 
    isLoading: false,
    error: null,
};

// 찜 항목을 구분하는 키를 생성하는 헬퍼 함수
const getFavoriteKey = (item_type, item_id) => `${item_type}_${item_id}`;

const useFavoritesStore = create((set, get) => ({
    ...initialState,
    likeDelta: {},

    // ----------------------------------------------------
    // 1. 상태 조회 함수
    // ----------------------------------------------------

    /**
     * 특정 항목이 찜 목록에 있는지 확인
     * @param {number|string} itemId - 항목의 고유 ID
     * @param {string} itemType - 항목 타입 (FESTIVAL, PRODUCT, SPOT)
     * @returns {boolean}
     */
    isFavorite: (itemId, itemType = 'FESTIVAL') => {
        if (!itemId || !itemType) return false;
        
        const idKey = getFavoriteKey(itemType.toUpperCase(), String(itemId));
        
        // 모든 찜 목록을 하나의 Set으로 변환하여 빠르게 확인
        const allFavorites = [
            ...get().festivals,
            ...get().products,
            ...get().spots,
        ];
        
        return allFavorites.some(item => getFavoriteKey(item.item_type, item.item_id) === idKey);
    },

    // ----------------------------------------------------
    // 2. API 통신 및 상태 업데이트 함수
    // ----------------------------------------------------

    /**
     * 서버에서 전체 찜 목록을 불러와 스토어에 저장
     */
    fetchFavorites: async () => {

        const MAX_WAIT_TIME = 5000;
        const START_TIME = Date.now();

        while (useAuthStore.getState().isAuthLoading && (Date.now() - START_TIME < MAX_WAIT_TIME)) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
      
        const { token } = useAuthStore.getState();
        if (!token) {
            console.warn("인증 토큰이 없어 찜 목록을 불러올 수 없습니다.");
            set({ festivals: [], products: [], spots: [], isLoading: false });
            return;
        }
        

        set({ isLoading: true, error: null });
        try {
            const data = await getFavorites(token);

            set(produce(state => {
                // 서버 응답 구조 (FavoriteListResponse)를 기반으로 상태 업데이트
                state.festivals = data.festivals || [];
                state.products = data.products || [];
                // 추천 여행지(spots)가 List<List> 형태일 경우, List<FavoriteItemOut> 형태로 평탄화
                state.spots = (data.spots || []).flat(); 
            }));
            
        } catch (e) {
            console.error("찜 목록 불러오기 실패:", e);
            set({ error: e.message || "찜 목록을 불러오는 데 실패했습니다." });
        } finally {
            set({ isLoading: false });
        }
    },

    /**
     * 특정 항목의 찜 상태를 토글하고 스토어 상태를 업데이트
     * @param {object} item - 찜/찜 해제할 항목 객체 (FestivalRead, MarketProductOut 등)
     * @param {string} type - 항목 타입 (FESTIVAL, PRODUCT, SPOT)
     */
    toggleFavorite: async (item, type = 'FESTIVAL') => {
        const itemType = type.toUpperCase();
        // 축제 상세 화면처럼 item 객체만 넘어왔을 경우 item.id를 사용
        const itemId = item.contentid || item.id; 
        
        if (!itemId) {
            console.error("찜 항목의 ID를 찾을 수 없습니다.");
            return;
        }

        const { token } = useAuthStore.getState();
        if (!token) {
            // 사용자에게 로그인 필요 알림 (Alert는 컴포넌트에서 처리하는 것이 좋음)
            console.warn("로그인이 필요합니다.");
            return;
        }
        
        const isCurrentlyFavorite = get().isFavorite(itemId, itemType);

        try {
            // 1. 서버에 토글 요청
            const apiResponse = await toggleFavorite(itemType, itemId, token);
            // 서버 응답 (200/201/204) 성공 시 로컬 상태 업데이트
            
            // 2. 로컬 상태 업데이트 (Immer 사용)
            set(produce(state => {
                const targetKey = itemType.toLowerCase() + 's'; // 'festivals', 'products', 'spots'
                const favoritesList = state[targetKey];
                
                if (isCurrentlyFavorite) {
                    // 찜 해제: 목록에서 제거
                    state[targetKey] = favoritesList.filter(
                        fav => getFavoriteKey(fav.item_type, fav.item_id) !== getFavoriteKey(itemType, itemId)
                    );
                    console.log(`[찜 해제] ${itemType}: ${itemId}`);
                } else {
                    // 찜 추가: 목록에 추가
                    const newFavoriteItem = {
                        item_id: String(itemId), // DB 저장 형태에 맞춰 String으로
                        item_type: itemType,
                        title: item.title || '제목 없음',
                        image_url: item.image_url || item.images?.[0]?.image_url || null, 
                    };
                    favoritesList.push(newFavoriteItem);
                    console.log(`[찜 추가] ${itemType}: ${itemId}`);
                }
            }));

        } catch (e) {
            console.error("찜 토글 실패:", e);
            // 실패 시 사용자에게 알림 필요
        }
    },
    
    // ----------------------------------------------------
    // 3. 기타 유틸리티 함수
    // ----------------------------------------------------
    
    // 스토어 초기화
    resetFavorites: () => set(initialState),
}));

export default useFavoritesStore;