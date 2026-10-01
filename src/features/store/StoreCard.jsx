import { useState } from 'react';
import styles from './StoreCard.module.css';

/**
 * 가게 카드 — 메인 홈 목록의 매장 요약 정보
 * 모든 텍스트 줄을 1줄로 고정해 가게명 길이·이미지 로딩 여부와 상관없이 카드 높이가 같게 유지됨
 *
 * Props:
 *   store: {
 *     id: number,
 *     name: string,
 *     category: string,
 *     address: string,
 *     openTime: string | null,   — 백엔드는 'HH:mm:ss', 더미는 'HH:mm' (화면엔 'HH:mm'으로 표시)
 *     closeTime: string | null,  — 영업시간 정보가 없는 매장은 null
 *     imageUrl?: string,         — 백엔드 응답엔 없음 → 회색 대체 박스
 *     description?: string,      — 한 줄 소개 (백엔드 응답엔 없음, 있을 때만 표시)
 *   }
 *   onClick: (storeId: number) => void
 */

// "09:00:00" → "09:00" (초 제거). 이미 "HH:mm"이면 그대로, 값이 없으면 null
function toHHmm(time) {
  return time ? time.slice(0, 5) : null;
}

// 현재 시각이 영업시간 안인지 확인 (마감이 자정을 넘기는 경우도 처리). 인자는 "HH:mm"
function isOpenNow(openTime, closeTime) {
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (openTime <= closeTime) return openTime <= current && current < closeTime;
  return current >= openTime || current < closeTime;
}

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="m21 16-5-5-9 9" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

function StoreCard({ store, onClick }) {
  const [imageError, setImageError] = useState(false);
  const openTime = toHHmm(store.openTime);
  const closeTime = toHHmm(store.closeTime);
  const hasHours = Boolean(openTime && closeTime);
  // 영업시간 정보가 없으면 "준비 중"으로 표시
  const open = hasHours && isOpenNow(openTime, closeTime);
  const showImage = store.imageUrl && !imageError;

  return (
    <article className={styles.card} onClick={() => onClick(store.id)}>
      <div className={styles.thumb}>
        {showImage ? (
          <img
            src={store.imageUrl}
            alt={store.name}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.placeholder}>
            <ImageIcon />
          </div>
        )}
        <span className={`${styles.status} ${open ? styles.open : styles.closed}`}>
          {open ? '주문 가능' : '준비 중'}
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name} title={store.name}>{store.name}</h3>

        <p className={styles.tagline}>
          <span className={styles.badge}>{store.category}</span>
          {store.description}
        </p>

        <p className={styles.info}>
          <ClockIcon />
          <span>{hasHours ? `${openTime} ~ ${closeTime}` : '영업시간 정보 없음'}</span>
        </p>
        <p className={styles.info}>
          <PinIcon />
          <span title={store.address}>{store.address}</span>
        </p>

        <button
          type="button"
          className={styles.detailButton}
          onClick={(e) => {
            e.stopPropagation();
            onClick(store.id);
          }}
        >
          가게 상세보기
        </button>
      </div>
    </article>
  );
}

export default StoreCard;
