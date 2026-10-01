import apiClient from '../../api/client';
import { DUMMY_STORES } from './dummyStores';

// true면 백엔드 없이 dummyStores.js 데이터를 사용합니다.
const USE_DUMMY = false;

/*
 * 서버 페이지네이션 + 검색: GET /api/stores?keyword=&category=&page=&size=
 *   응답은 페이지 객체 { content: [...], totalElements, totalPages, number, size, ... } — 페이지 정보는 최상위
 *   Spring 페이지 번호는 0부터 → 화면의 1페이지를 page=0으로 보냄
 *   keyword: 매장명 부분 일치 (백엔드 기준 대소문자 구분)
 */

/**
 * 매장 목록 조회 (한 페이지)
 * @param {{ keyword?: string, category?: string, page: number, size: number }} query
 *   keyword: 비어 있으면 전체, category: 없거나 '전체'면 전체 조회, page: 화면 기준 1부터
 * @returns {Promise<{ content: Array<{ id, name, category, address, openTime, closeTime, ownerId, ownerName }>,
 *                     totalElements: number, totalPages: number }>}
 *   openTime/closeTime은 백엔드 기준 "HH:mm:ss" (화면 표시는 StoreCard에서 "HH:mm"으로 변환)
 */
export async function getStores({ keyword, category, page, size }) {
  const filterKeyword = keyword || undefined;
  const filterCategory = category && category !== '전체' ? category : undefined;

  if (USE_DUMMY) {
    // 로딩 UI 확인용으로 실제 네트워크처럼 약간 지연 + 서버와 같은 모양으로 잘라서 반환
    await new Promise((resolve) => setTimeout(resolve, 400));
    const filtered = DUMMY_STORES.filter(
      (s) => (!filterCategory || s.category === filterCategory) && (!filterKeyword || s.name.includes(filterKeyword)),
    );
    return {
      content: filtered.slice((page - 1) * size, page * size),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    };
  }

  const res = await apiClient.get('/api/stores', {
    params: { keyword: filterKeyword, category: filterCategory, page: page - 1, size },
  });
  return {
    content: res.data.content ?? [],
    totalElements: res.data.totalElements ?? 0,
    totalPages: res.data.totalPages ?? 0,
  };
}
