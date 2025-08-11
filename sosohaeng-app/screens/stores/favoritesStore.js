// stores/favoritesStore.js
// 아주 가벼운 전역 찜 스토어 (이벤트 기반)

const listeners = new Set();

/** 내부 상태: [{ id, category, data }] */
let items = [];

/** 구독 */
export function subscribe(cb) {
  listeners.add(cb);
  // 초기 상태도 한번 보내줌
  cb(items);
  return () => listeners.delete(cb);
}

function emit() {
  for (const l of listeners) l(items);
}

/** 카테고리/ID로 존재 여부 */
export function isFavorite(category, id) {
  return items.some((it) => it.category === category && it.id === id);
}

/** 추가 */
export function addFavorite(category, id, data) {
  if (isFavorite(category, id)) return;
  items = [{ id, category, data }, ...items];
  emit();
}

/** 제거 */
export function removeFavorite(category, id) {
  items = items.filter((it) => !(it.category === category && it.id === id));
  emit();
}

/** 토글 */
export function toggleFavorite(category, id, data) {
  if (isFavorite(category, id)) removeFavorite(category, id);
  else addFavorite(category, id, data);
}

/** 전부 반환 */
export function getFavorites() {
  return items.slice();
}
