import React from 'react';

// 카테고리/매장별 감성 고화질 사진 (플레이스홀더 대신 사용)
const DEFAULT_IMAGES = {
  베이커리: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  '카페/디저트': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  패스트푸드: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
  한식: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80',
  기본: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
};

function StoreCard({ store, onClick }) {
  const imageUrl =
    store.imageUrl ||
    DEFAULT_IMAGES[store.category] ||
    DEFAULT_IMAGES['기본'];

  return (
    <div
      className="card card-hover"
      onClick={() => onClick(store.id)}
      style={{
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 매장 대표 이미지 */}
      <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={store.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <span
          className="badge"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.65)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
          }}
        >
          {store.category || '가게'}
        </span>
      </div>

      {/* 매장 정보 */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
            {store.name}
          </h3>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
            ⭐ 4.9
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', flex: 1 }}>
          📍 {store.address || '서울시 강남구 테헤란로'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            ⏰ {store.openTime ? `${store.openTime.slice(0, 5)} ~ ${store.closeTime?.slice(0, 5)}` : '09:00 ~ 21:00'}
          </span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
            메뉴 보러가기 →
          </span>
        </div>
      </div>
    </div>
  );
}

export default StoreCard;
