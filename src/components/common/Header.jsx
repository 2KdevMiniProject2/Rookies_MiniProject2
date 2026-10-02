import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Logo from './Logo';
import styles from './Header.module.css';

/**
 * 공용 상단 헤더 — 메인 홈(StoreListPage) 헤더에서 로고 · 로그인 메뉴만 떼어 낸 것
 * 검색창은 메인 홈에서만 쓰므로 뺐다. 모양 · 색 · 크기는 메인 홈 헤더와 같은 값.
 * 쓰는 곳: 주문(메뉴) 페이지 · 장바구니 · 주문 현황 (손님 화면)
 */
function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // 로그아웃하면 메인 홈으로 (로그인이 필요한 페이지에 남아 있지 않도록)
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo} aria-label="메인 홈으로">
        <Logo className={styles.logoImage} />
      </Link>

      <nav className={styles.nav}>
        {isAuthenticated ? (
          <>
            <span className={styles.userName}>{user?.name}님</span>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => navigate('/mypage')}
              aria-label="마이페이지"
              title="마이페이지"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </button>
            <button type="button" className={styles.navButton} onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.navButton}>
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;