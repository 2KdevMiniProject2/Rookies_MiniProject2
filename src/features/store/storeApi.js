import apiClient from '../../api/client';
import { DUMMY_STORES } from './dummyStores';

// 백엔드(GET /api/stores)가 준비되면 false로 바꾸면 실제 API를 호출합니다.
const USE_DUMMY = true;

/**
 * 매장 목록 조회
 * @returns {Promise<Array<{ id, name, category, address, storePhone, openTime, closeTime, imageUrl, rating?, reviewCount? }>>}
 */
export async function getStores() {
  if (USE_DUMMY) {
    // 로딩 UI 확인용으로 실제 네트워크처럼 약간 지연
    await new Promise((resolve) => setTimeout(resolve, 400));
    return DUMMY_STORES;
  }
  const res = await apiClient.get('/api/stores');
  return res.data.data;
}
