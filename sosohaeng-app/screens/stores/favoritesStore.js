// screens/stores/favoritesStore.js
// 전역 찜(위시리스트) 스토어
// 사용처 예시:
//  const { isFavorite, toggleFavorite, favoritesArray, likeDelta, upsertItem, syncFromList } = useFavoritesStore();

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 위시리스트에 저장할 item의 최소 스키마
// { id, title, image, location, price, rating, likes, region }

const useFavoritesStore = create(
  persist(
    (set, get) => ({
      // 내부 상태
      favorites: {},         // { [id]: item }
      order: [],             // 보여줄 순서(최근 추가 우선)
      likeDelta: {},         // { [id]: number }  // 상세에서 +1 한 카운터 반영용

      // ---------- Selectors ----------
      isFavorite: (id) => !!get().favorites[String(id)],
      favoritesArray: [],

      // ---------- Mutators ----------
      // 목록에서 넘어온 데이터(또는 상세에서 로딩한 데이터)를 스토어에 보강 저장
      upsertItem: (partial) => {
        if (!partial || !partial.id) return;
        const id = String(partial.id);
        const { favorites } = get();
        const prev = favorites[id] || {};
        const merged = {
          id,
          title: partial.title ?? prev.title ?? '',
          image: partial.image ?? prev.image ?? null,
          location: partial.location ?? prev.location ?? '',
          price: Number(partial.price ?? prev.price ?? 0),
          rating: Number(partial.rating ?? prev.rating ?? 0),
          likes: Number(partial.likes ?? prev.likes ?? 0),
          region: partial.region ?? prev.region ?? '',
        };
        const next = { ...favorites, [id]: merged };
        set({ favorites: next, favoritesArray: remapArray(get().order, next) });
      },

      // 목록 API 로드 직후 최소 정보 동기화 (즐겨찾기 여부와 무관)
      syncFromList: (list) => {
        try {
          if (!Array.isArray(list)) return;
          const { favorites } = get();
          const next = { ...favorites };
          list.forEach((it) => {
            if (!it || !it.id) return;
            const id = String(it.id);
            const prev = next[id] || {};
            next[id] = {
              id,
              title: it.title ?? it.productName ?? prev.title ?? '',
              image: it.image ?? (Array.isArray(it.images) ? it.images[0] : prev.image) ?? null,
              location: it.location ?? prev.location ?? '',
              price: Number(it.price ?? prev.price ?? 0),
              rating: Number(it.rating ?? prev.rating ?? 0),
              likes: Number(it.likes ?? prev.likes ?? 0),
              region: it.region ?? prev.region ?? '',
            };
          });
          set({ favorites: next, favoritesArray: remapArray(get().order, next) });
        } catch {}
      },

      // 찜 토글: 없으면 추가(+1), 있으면 해제(-1)
      toggleFavorite: (itemOrId) => {
        const id = String(typeof itemOrId === 'string' ? itemOrId : itemOrId?.id);
        if (!id) return;

        const { favorites, order, likeDelta } = get();
        const exists = !!favorites[id];

        // 추가 시, item 정보가 객체로 들어왔다면 upsert 보강
        if (!exists && typeof itemOrId === 'object') {
          get().upsertItem(itemOrId);
        }

        if (exists) {
          // 해제: order에서 제거, likeDelta -1 (최소 0)
          const nextFav = { ...favorites };
          delete nextFav[id];
          const nextOrder = order.filter((x) => x !== id);
          const cur = Number(likeDelta[id] ?? 0);
          const nextDelta = { ...likeDelta, [id]: Math.max(cur - 1, 0) };
          set({
            favorites: nextFav,
            order: nextOrder,
            favoritesArray: remapArray(nextOrder, nextFav),
            likeDelta: nextDelta,
          });
        } else {
          // 추가: order 맨 앞에, likeDelta +1
          const nextOrder = [id, ...order.filter((x) => x !== id)];
          const cur = Number(likeDelta[id] ?? 0);
          const nextDelta = { ...likeDelta, [id]: cur + 1 };
          set({
            order: nextOrder,
            favoritesArray: remapArray(nextOrder, get().favorites),
            likeDelta: nextDelta,
          });
        }
      },

      // 전부 지우기 (디버깅용)
      clearAll: () => set({ favorites: {}, order: [], favoritesArray: [], likeDelta: {} }),
    }),
    {
      name: 'sosohaeng-favorites-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        order: state.order,
        likeDelta: state.likeDelta,
      }),
      onRehydrateStorage: () => (state) => {
        // 복원 후 favoritesArray 재계산
        if (!state) return;
        const { order, favorites } = state;
        state.favoritesArray = remapArray(order || [], favorites || {});
      },
    }
  )
);

// order + favorites로 배열 재구성
function remapArray(order, favorites) {
  const list = [];
  (order || []).forEach((id) => {
    const item = favorites?.[id];
    if (item) list.push(item);
  });
  // 혹시 order에 없는데 favorites에만 남아있는게 있으면 뒤에 붙여줌
  Object.keys(favorites || {}).forEach((id) => {
    if (!order?.includes(id)) list.push(favorites[id]);
  });
  return list;
}

export default useFavoritesStore;
