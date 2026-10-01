import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useCartStore } from '../../store/cartStore';

// 1번 매장(루키즈 베이커리) 및 일반 매장용 안전 더미 메뉴 (dummy-data.sql 기반)
const FALLBACK_MENUS = [
  {
    id: 1,
    name: '소금빵',
    price: 3200,
    description: '프랑스산 고메 버터와 게랑드 소금으로 구운 시그니처 겉바속촉 빵',
    isSoldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: '아메리카노 (Ice/Hot)',
    price: 3500,
    description: '고소한 너티 향과 다크초콜릿 여운미가 일품인 시그니처 원두',
    isSoldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: '카페라떼',
    price: 4500,
    description: '신선한 1등급 원유와 에스프레소의 부드럽고 고소한 조화',
    isSoldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: '크로와상',
    price: 3800,
    description: '겹겹이 살아있는 바삭한 결에 버터 풍미 가득한 정통 프렌치 크로와상',
    isSoldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: '바닐라 빈 라떼',
    price: 5200,
    description: '마다가스카르산 천연 바닐라빈으로 직접 끓여낸 수제 시럽 라떼',
    isSoldOut: false,
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
  },
];

function StoreDetailPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState({
    id: Number(storeId) || 1,
    name: '루키즈 베이커리 (본점)',
    category: '베이커리',
    address: '서울시 강남구 테헤란로 123',
    openTime: '08:00',
    closeTime: '21:00',
  });
  const [menus, setMenus] = useState(FALLBACK_MENUS);
  const [loading, setLoading] = useState(false);

  const { items, addItem, getTotalPrice, getTotalQuantity } = useCartStore();
  const totalQty = getTotalQuantity();
  const totalPrice = getTotalPrice();

  useEffect(() => {
    const fetchStoreAndMenus = async () => {
      setLoading(true);
      try {
        // 1. 매장 상세 정보 조회
        const storeRes = await apiClient.get(`/api/stores/${storeId}`);
        const storeData = storeRes.data?.data || storeRes.data;
        if (storeData) setStore(storeData);

        // 2. 메뉴 목록 조회 (Spring Data Page 객체 및 배열 모두 지원)
        const menuRes = await apiClient.get(`/api/stores/${storeId}/menus`);
        const resData = menuRes.data?.data || menuRes.data;
        const list = Array.isArray(resData) ? resData : (resData?.content || []);
        if (list.length > 0) {
          // soldOut / isSoldOut 호환 처리
          const formattedList = list.map((item) => ({
            ...item,
            isSoldOut: item.isSoldOut !== undefined ? item.isSoldOut : !!item.soldOut,
          }));
          setMenus(formattedList);
        }
      } catch (err) {
        console.warn('API 매장 상세/메뉴 폴백 데이터 유지', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndMenus();
  }, [storeId]);

  const handleAddToCart = (menu) => {
    if (menu.isSoldOut) {
      alert('현재 품절된 메뉴입니다.');
      return;
    }
    addItem(store, menu);
  };

  return (
    <div style={{ paddingBottom: '90px' }}>
      {/* 상단 뒤로가기 & 매장 정보 카드 */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '12px' }}
        >
          ← 전체 매장 목록으로
        </button>
      </div>

      <div className="card" style={{ marginBottom: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-accepted" style={{ marginBottom: '8px' }}>
              {store.category || '베이커리'}
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0 8px' }}>
              {store.name}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              📍 {store.address}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
              ⭐ 4.9
            </span>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              ⏰ {store.openTime ? `${store.openTime.slice(0, 5)} ~ ${store.closeTime?.slice(0, 5)}` : '08:00 ~ 21:00'}
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴판 제목 */}
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
        📋 대표 메뉴판
      </h2>

      {/* 메뉴 목록 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 20px',
            }}
          >
            {/* 메뉴 설명 및 가격 */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{menu.name}</h3>
                {menu.isSoldOut && <span className="badge badge-rejected">품절</span>}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {menu.description || '정성을 다해 준비한 시그니처 메뉴입니다.'}
              </p>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                {menu.price?.toLocaleString()}원
              </div>
            </div>

            {/* 메뉴 사진 & 담기 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              {menu.imageUrl && (
                <img
                  src={menu.imageUrl}
                  alt={menu.name}
                  style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
              )}
              <button
                onClick={() => handleAddToCart(menu)}
                disabled={menu.isSoldOut}
                className={`btn btn-sm ${menu.isSoldOut ? 'btn-outline' : 'btn-primary'}`}
              >
                {menu.isSoldOut ? '품절' : '+ 담기'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 플로팅 장바구니 바 */}
      {totalQty > 0 && (
        <div className="floating-bottom-bar">
          <div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>
              총 <strong style={{ color: '#ffb088' }}>{totalQty}개</strong> 선택됨
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>
              {totalPrice.toLocaleString()}원
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '15px' }}
          >
            주문하러 가기 →
          </button>
        </div>
      )}
    </div>
  );
}

export default StoreDetailPage;
