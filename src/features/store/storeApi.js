import apiClient from '../../api/client';
import { DUMMY_STORES } from './dummyStores';

// true면 백엔드 없이 dummyStores.js 데이터를 사용합니다.
const USE_DUMMY = false;
const SEARCH_FETCH_SIZE = 1000;

/*
 * 백엔드 매장 목록 API: GET /api/stores?category=&page=&size=
 * 현재 백엔드는 keyword 검색 파라미터를 지원하지 않으므로,
 * 검색어가 있을 때는 목록을 넉넉히 받아 프론트에서 매장명 필터링 후 페이지를 나눕니다.
 */

/**
 * 매장 목록 조회 (한 페이지)
 * @param {{ keyword?: string, category?: string, page: number, size: number }} query
 * @returns {Promise<{ content: Array, totalElements: number, totalPages: number }>}
 */
export async function getStores({ keyword, category, page, size }) {
  const filterKeyword = keyword?.trim() || '';
  const filterCategory = category && category !== '전체' ? category : undefined;

  if (USE_DUMMY) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedKeyword = filterKeyword.toLowerCase();
    const filtered = DUMMY_STORES.filter((store) => {
      const categoryMatches = !filterCategory || store.category === filterCategory;
      const keywordMatches = !normalizedKeyword || store.name.toLowerCase().includes(normalizedKeyword);
      return categoryMatches && keywordMatches;
    });

    return {
      content: filtered.slice((page - 1) * size, page * size),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    };
  }

  if (filterKeyword) {
    const res = await apiClient.get('/api/stores', {
      params: {
        category: filterCategory,
        page: 0,
        size: SEARCH_FETCH_SIZE,
      },
    });

    const normalizedKeyword = filterKeyword.toLowerCase();
    const filtered = (res.data.content ?? []).filter((store) =>
      store.name?.toLowerCase().includes(normalizedKeyword),
    );

    return {
      content: filtered.slice((page - 1) * size, page * size),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    };
  }

  const res = await apiClient.get('/api/stores', {
    params: {
      category: filterCategory,
      page: page - 1,
      size,
    },
  });

  return {
    content: res.data.content ?? [],
    totalElements: res.data.totalElements ?? 0,
    totalPages: res.data.totalPages ?? 0,
  };
}
