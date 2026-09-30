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
 * 상태: stores(서버 데이터), loading, error, keyword(검색어), category(선택 탭), page(현재 페이지) — 모두 로컬 useState
 * 필터링·페이지네이션은 받아온 전체 목록을 화면에서 처리 (백엔드가 정렬/페이지/검색 파라미터를 지원하지 않음)
 * 카드 클릭 시 /stores/:storeId (파트 B 가게 상세)로 이동
 */

const ALL = '전체';
// 백엔드 매장 카테고리 값과 글자가 정확히 같아야 필터가 동작함
const CATEGORIES = [ALL, '베이커리', '카페', '분식', '일식', '치킨'];
const SKELETON_COUNT = 6;
const PAGE_SIZE = 8;

function StoreListPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState(ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    getStores()
      .then((data) => {
        if (!ignore) setStores(data);
      })
      .catch(() => {
        if (!ignore) setError('가게 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const filteredStores = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return stores.filter((store) => {
      const matchCategory = category === ALL || store.category === category;
      const matchKeyword = !q || store.name.toLowerCase().includes(q);
      return matchCategory && matchKeyword;
    });
  }, [stores, keyword, category]);

  // 필터 결과를 PAGE_SIZE개씩 잘라서 현재 페이지 분량만 표시
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedStores = filteredStores.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 카테고리·검색어가 바뀌면 결과가 달라지므로 1페이지로 돌아감
  const handleCategoryChange = (next) => {
    setCategory(next);
    setPage(1);
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  const retry = () => {
    setLoading(true);
    setError('');
    setReloadKey((k) => k + 1);
  };

  // TODO: 마이페이지 화면(다른 파트) 완성되면 navigate('/mypage')로 연결
  const handleMyPage = () => {
    console.log('[StoreListPage] 마이페이지 클릭 — 경로 연결 예정');
  };

  const resetFilters = () => {
    setKeyword('');
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

    if (filteredStores.length === 0) {
      return (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>조건에 맞는 가게가 없어요</p>
          <p className={styles.emptyDesc}>다른 카테고리를 선택하거나 검색어를 바꿔보세요.</p>
          <button type="button" className={styles.emptyButton} onClick={resetFilters}>
            전체 가게 보기
          </button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.grid}>
          {pagedStores.map((store) => (
            <StoreCard key={store.id} store={store} onClick={(id) => navigate(`/stores/${id}`)} />
          ))}
        </div>
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
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.pageButton} ${n === currentPage ? styles.pageButtonActive : ''}`}
          onClick={() => goToPage(n)}
          aria-current={n === currentPage ? 'page' : undefined}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
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
            가게 <strong>{filteredStores.length}</strong>곳
          </p>
        )}

        {renderContent()}
      </main>
    </div>
  );
}

export default StoreListPage;
