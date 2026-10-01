import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getStores } from './storeApi';
import CategoryFilter from './CategoryFilter';
import StoreCard from './StoreCard';
import Logo from '../../components/common/Logo';
import styles from './StoreListPage.module.css';

/**
 * 메인 홈 — 매장 찾기 (/)
 *
 * 구성: 헤더(로고 · 검색창 · 로그인/마이페이지/로그아웃) → 카테고리 탭 → 가게 카드 그리드 → 페이지 번호
 * 상태: result(서버 응답 한 페이지), keyword(입력칸 값), searchKeyword(실제로 검색한 값),
 *       category(선택 탭), page(현재 페이지) — 모두 로컬 useState
 * 카테고리 필터·페이지네이션은 서버에서 처리하고, 매장명 검색은 현재 백엔드 API에 keyword 파라미터가 없어 storeApi에서 보완합니다.
 * 검색은 디바운스: 타이핑이 SEARCH_DELAY 동안 멈추면 그때 검색어를 확정해 요청
 * 카드 클릭 시 /stores/:storeId (파트 B 가게 상세)로 이동
 */

const ALL = '전체';
// 백엔드 매장 카테고리 값과 글자가 정확히 같아야 필터가 동작함
const CATEGORIES = [ALL, '베이커리', '카페', '분식', '일식', '치킨'];
const PAGE_SIZE = 8;
// 로딩 스켈레톤 개수 — 한 페이지 개수와 같게
const SKELETON_COUNT = PAGE_SIZE;
// 타이핑이 이 시간(ms) 동안 멈추면 검색 요청을 보냄
const SEARCH_DELAY = 300;

function StoreListPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [category, setCategory] = useState(ALL);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  // 어떤 요청(requestKey)에 대한 결과인지 함께 저장 → 현재 조건과 다르면 "불러오는 중"
  const [result, setResult] = useState({ key: null, data: null, error: '' });

  const requestKey = `${searchKeyword}|${category}|${page}|${reloadKey}`;
  const loading = result.key !== requestKey;
  const error = loading ? '' : result.error;

  /* 디바운스: 글자를 칠 때마다 타이머를 새로 걸고, 이전 타이머는 정리 함수(clearTimeout)로 취소한다.
     SEARCH_DELAY 동안 입력이 없으면 검색어를 확정하고 1페이지로 돌아간다.
     (검색어가 같으면 아무것도 바꾸지 않아 불필요한 요청이 나가지 않음) */
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = keyword.trim();
      if (next !== searchKeyword) {
        setSearchKeyword(next);
        setPage(1);
      }
    }, SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [keyword, searchKeyword]);

  // 검색어·카테고리·페이지가 바뀔 때마다 해당 페이지만 서버에서 받아옴
  useEffect(() => {
    let ignore = false;

    getStores({ keyword: searchKeyword, category, page, size: PAGE_SIZE })
      .then((data) => {
        if (!ignore) setResult({ key: requestKey, data, error: '' });
      })
      .catch(() => {
        if (!ignore) setResult({ key: requestKey, data: null, error: '가게 목록을 불러오지 못했습니다.' });
      });

    return () => {
      ignore = true;
    };
  }, [searchKeyword, category, page, requestKey]);

  const stores = useMemo(() => (loading ? [] : result.data?.content ?? []), [loading, result]);
  const totalElements = result.data?.totalElements ?? 0;
  const totalPages = result.data?.totalPages ?? 0;

  const goToPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 카테고리가 바뀌면 결과가 달라지므로 1페이지로 돌아감
  const handleCategoryChange = (next) => {
    setCategory(next);
    setPage(1);
  };

  // 입력칸 값만 바꿈 — 실제 검색은 위 디바운스 useEffect가 처리
  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const retry = () => {
    setReloadKey((k) => k + 1);
  };

  const handleMyPage = () => {
    navigate('/mypage');
  };

  // "전체 가게 보기" — 기다리지 않고 바로 초기화
  const resetFilters = () => {
    setKeyword('');
    setSearchKeyword('');
    setCategory(ALL);
    setPage(1);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{error}</p>
          <button type="button" className={styles.emptyButton} onClick={retry}>
            다시 시도
          </button>
        </div>
      );
    }

    // 결과가 비어도 (없는 페이지 번호 등) 다른 페이지로 갈 수 있도록 페이지 버튼은 계속 보여줌
    return (
      <>
        {stores.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>조건에 맞는 가게가 없어요</p>
            <p className={styles.emptyDesc}>다른 카테고리를 선택하거나 검색어를 바꿔보세요.</p>
            <button type="button" className={styles.emptyButton} onClick={resetFilters}>
              전체 가게 보기
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} onClick={(id) => navigate(`/stores/${id}`)} />
            ))}
          </div>
        )}
        {totalPages > 1 && renderPagination()}
      </>
    );
  };

  // 페이지 번호 버튼 (이전 · 1 · 2 · … · 다음)
  const renderPagination = () => (
    <nav className={styles.pagination} aria-label="페이지 이동">
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.pageButton} ${n === page ? styles.pageButtonActive : ''}`}
          onClick={() => goToPage(n)}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        다음
      </button>
    </nav>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label="메인 홈으로">
          <Logo className={styles.logoImage} />
        </Link>

        <div className={styles.search}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="매장명을 검색해보세요"
            aria-label="매장 검색"
            value={keyword}
            onChange={handleKeywordChange}
          />
        </div>

        <nav className={styles.nav}>
          {isAuthenticated ? (
            <>
              <span className={styles.userName}>{user?.name}님</span>
              <button type="button" className={styles.iconButton} onClick={handleMyPage} aria-label="마이페이지" title="마이페이지">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </button>
              <button type="button" className={styles.navButton} onClick={logout}>로그아웃</button>
            </>
          ) : (
            <Link to="/login" className={styles.navButton}>로그인</Link>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>스마트 픽업 주문 서비스</p>
          <h1 className={styles.title}>
            동네 단골 매장의 갓 만든 메뉴를 
            <br />
            기다림 없이 바로 픽업하세요!
          </h1>
          <p className={styles.subtitle}>
            주문 후 픽업 시간에 맞춰 방문하시면, 갓 준비된 메뉴를 바로 받아가실 수 있어요.
          </p>
        </section>

        <CategoryFilter categories={CATEGORIES} selectedCategory={category} onSelectCategory={handleCategoryChange} />

        {!loading && !error && (
          <p className={styles.count}>
            가게 <strong>{totalElements}</strong>곳
          </p>
        )}

        {renderContent()}
      </main>
    </div>
  );
}

export default StoreListPage;
