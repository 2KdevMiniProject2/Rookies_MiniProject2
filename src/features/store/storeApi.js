import apiClient from '../../api/client';
import { DUMMY_STORES } from './dummyStores';

// true면 백엔드 없이 dummyStores.js 데이터를 사용합니다.
const USE_DUMMY = false;

/*
 * 백엔드 GET /api/stores는 페이지 객체를 응답합니다 (매장 배열은 content 안).
 *   { content: [...], totalElements, totalPages, number, size, first, last, ... } — 페이지 정보는 최상위
 *
 * 매장명 검색 파라미터가 아직 없어서, 서버 페이지네이션으로 가면 검색이 "현재 페이지 안에서만" 동작합니다.
 * 매장 수가 적으므로 당분간 size=100으로 전체를 한 번에 받아 화면에서 검색·필터·페이지네이션을 처리합니다.
 * TODO: 매장 수가 늘거나 백엔드가 검색 파라미터를 지원하면 서버 페이지네이션(?page=&size=&category=)으로 전환
 */
const FETCH_ALL_SIZE = 100;

/**
 * 매장 목록 조회
 * @returns {Promise<Array<{ id, name, category, address, openTime, closeTime, ownerId, ownerName }>>}
 *   openTime/closeTime은 백엔드 기준 "HH:mm:ss" (화면 표시는 StoreCard에서 "HH:mm"으로 변환)
 */
export async function getStores() {
  if (USE_DUMMY) {
    // 로딩 UI 확인용으로 실제 네트워크처럼 약간 지연
    await new Promise((resolve) => setTimeout(resolve, 400));
    return DUMMY_STORES;
  }
  const res = await apiClient.get('/api/stores', { params: { size: FETCH_ALL_SIZE } });
  return res.data.content ?? [];
}
