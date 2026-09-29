import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loginAsOwner, loginAsCustomer } = useAuthStore();
  const totalQuantity = useCartStore((state) => state.getTotalQuantity());

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header-bar">
      <div className="header-inner">
        {/* 로고 */}
        <Link to="/" className="logo-badge">
          <span style={{ fontSize: '26px' }}>🥐</span>
          <span>루키즈 오더</span>
        </Link>

        {/* 내비게이션 & 계정 상태 */}
        <div className="nav-links">
          {/* 시연용 원클릭 빠른 계정 전환 치트키 */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => { loginAsCustomer(); navigate('/'); }}
              className="btn btn-outline btn-sm"
              title="손님 계정으로 즉시 전환"
            >
              🙋 손님모드
            </button>
            <button
              onClick={() => { loginAsOwner(); navigate('/owner/dashboard'); }}
              className="btn btn-outline btn-sm"
              title="사장님 계정으로 즉시 전환"
            >
              👨‍🍳 사장님모드
            </button>
          </div>

          {/* 사장님 전용 대시보드 링크 */}
          {user?.role === 'OWNER' && (
            <Link to="/owner/dashboard" className="btn btn-outline btn-sm">
              📊 주문관리
            </Link>
          )}

          {/* 장바구니 링크 (손님용) */}
          <Link to="/checkout" className="btn btn-outline btn-sm" style={{ position: 'relative' }}>
            🛒 장바구니
            {totalQuantity > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '1px 6px',
                }}
              >
                {totalQuantity}
              </span>
            )}
          </Link>

          {/* 로그인 / 로그아웃 & 마이페이지 */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/mypage"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                }}
                title="마이페이지로 이동"
              >
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  👤 {user?.name || user?.email}
                  <span className={`badge ${user?.role === 'OWNER' ? 'badge-primary' : 'badge-accepted'}`} style={{ marginLeft: '6px', fontSize: '10px' }}>
                    {user?.role === 'OWNER' ? '사장님' : '손님'}
                  </span>
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-sm btn-outline">
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
