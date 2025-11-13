 /* 두 지점(위도, 경도) 간의 거리를 킬로미터(km) 단위로 계산합니다. (하버사인 공식)
 * @param {number} lat1 - 첫 번째 지점의 위도
 * @param {number} lon1 - 첫 번째 지점의 경도
 * @param {number} lat2 - 두 번째 지점의 위도
 * @param {number} lon2 - 두 번째 지점의 경도
 * @returns {number} 거리 (km)
 */

/**
 * 거리를 소수점 두 자리까지 포맷합니다.
 * @param {number} distance - 거리 (km)
 * @returns {string} 포맷된 거리 문자열
 */
export const formatDistance = (distance) => {
  // distance가 null이거나 숫자가 아닐 경우 '계산 불가' 처리
  if (distance === null || distance === undefined || isNaN(distance)) {
    return '계산 불가';
  }
  // 1km 미만은 미터(m)로 표시
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`; 
  }
  // 1km 이상은 킬로미터(km)로 소수점 두 자리 표시
  return `${distance.toFixed(2)}km`;
};