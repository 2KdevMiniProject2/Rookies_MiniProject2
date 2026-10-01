import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import CategoryFilter from './CategoryFilter';
import StoreCard from './StoreCard';

// 백엔드 미응답 시 시연 끊김 방지용 기본 매장 데이터 (DB 더미데이터와 일치)
const FALLBACK_STORES = [
  {
    id: 1,
    name: '루키즈 베이커리 (본점)',
    category: '베이커리',
    address: '서울시 강남구 테헤란로 123',
    openTime: '08:00:00',
    closeTime: '21:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: '감성 커피 하우스 (강남점)',
    category: '카페/디저트',
    address: '서울시 강남구 역삼로 45',
    openTime: '09:00:00',
    closeTime: '22:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: '달콤 디저트 랩',
    category: '카페/디저트',
    address: '서울시 서초구 서초대로 88',
    openTime: '10:00:00',
    closeTime: '20:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: '루키 버거앤프라이즈',
    category: '패스트푸드',
    address: '서울시 송파구 올림픽로 12',
    openTime: '11:00:00',
    closeTime: '23:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: '동네 정성 솥밥',
    category: '한식',
    address: '서울시 마포구 독막로 50',
    openTime: '10:30:00',
    closeTime: '21:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80',
  },
];

function StoreListPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [stores, setStores] = useState(FALLBACK_STORES);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(FALLBACK_STORES.length);
  const [loading, setLoading] = useState(false);

  // 카테고리 변경 시 1페이지(0)로 리셋
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  // 백엔드 매장 목록 API 조회 (페이징 연동)
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          size: 9, // 한 페이지당 9개 (3x3 그리드)
        };
        if (selectedCategory !== '전체') {
          params.category = selectedCategory;
        }

        const res = await apiClient.get('/api/stores', { params });
        const resData = res.data?.data || res.data;

        // 1. Spring Data Page 객체 ({ content: [...], totalPages, totalElements })
        if (resData && Array.isArray(resData.content)) {
          setStores(resData.content);
          setTotalPages(resData.totalPages || 1);
          setTotalElements(resData.totalElements || resData.content.length);
        }
        // 2. 일반 배열 응답
        else if (Array.isArray(resData) && resData.length > 0) {
          setStores(resData);
          setTotalPages(1);
          setTotalElements(resData.length);
        } else {
          // 카테고리 필터링 폴백
          const fallback = selectedCategory === '전체'
            ? FALLBACK_STORES
            : FALLBACK_STORES.filter((s) => s.category === selectedCategory);
          setStores(fallback);
          setTotalPages(1);
          setTotalElements(fallback.length);
        }
      } catch (err) {
        console.warn('API 매장 조회 폴백 처리', err);
        const fallback = selectedCategory === '전체'
          ? FALLBACK_STORES
          : FALLBACK_STORES.filter((s) => s.category === selectedCategory);
        setStores(fallback);
        setTotalPages(1);
        setTotalElements(fallback.length);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [selectedCategory, currentPage]);

  return (
    <div>
      {/* 상단 히어로 배너 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8e53 100%)',
          color: '#fff',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 28px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>
          스마트 픽업 주문 서비스
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0 10px', color: '#fff' }}>
          동네 단골 매장의 갓 만든 메뉴를<br />기다림 없이 바로 픽업하세요! 🥐
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.95 }}>
          주문 후 픽업 시간에 맞춰 매장을 방문하시면 방금 조리된 따뜻한 메뉴가 준비되어 있습니다.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 매장 목록 그리드 */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
          🔥 {selectedCategory === '전체' ? '지금 주문 가능한 동네 매장' : `${selectedCategory} 매장`}
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: '500' }}>
            (총 {totalElements}곳)
          </span>
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          매장 목록을 불러오는 중입니다...
        </div>
      ) : stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          선택하신 카테고리의 매장이 아직 없습니다.
        </div>
      ) : (
        <>
          <div className="grid-cards">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={(id) => navigate(`/stores/${id}`)}
              />
            ))}
          </div>

          {/* 🌟 페이징 네비게이션 컨트롤러 */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '36px',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                style={{ padding: '8px 14px', fontSize: '14px' }}
              >
                ◀ 이전
              </button>

              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  className={`btn ${currentPage === idx ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    minWidth: '38px',
                    height: '38px',
                    padding: 0,
                    fontWeight: currentPage === idx ? '700' : '500',
                  }}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                type="button"
                className="btn btn-outline"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                style={{ padding: '8px 14px', fontSize: '14px' }}
              >
                다음 ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StoreListPage;
