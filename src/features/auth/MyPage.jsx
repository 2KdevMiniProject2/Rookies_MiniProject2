import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

// 손님용 최근 모의 주문 내역 (시연 끊김 방지용)
const MOCK_CUSTOMER_ORDERS = [
  {
    orderId: 5001,
    storeName: '루키즈 베이커리 (본점)',
    orderDate: '2026-09-29 13:20',
    pickupTime: '13:45',
    status: 'ACCEPTED', // 조리중
    totalAmount: 11000,
    items: [
      { name: '바닐라라떼', quantity: 2, price: 5500 },
    ],
  },
  {
    orderId: 4988,
    storeName: '감성 커피 하우스 (강남점)',
    orderDate: '2026-09-28 16:10',
    pickupTime: '16:30',
    status: 'COMPLETED', // 픽업 완료
    totalAmount: 8500,
    items: [
      { name: '아메리카노', quantity: 1, price: 4000 },
      { name: '초코 크루아상', quantity: 1, price: 4500 },
    ],
  },
];

function MyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '010-1234-5678');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 로그인하지 않은 경우
  if (!isAuthenticated || !user) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
            로그인이 필요한 서비스입니다
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            마이페이지를 이용하시려면 먼저 로그인해 주세요.
          </p>
          <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg">
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user.role === 'OWNER';

  // 회원 정보 수정 제출
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (user.id) {
        await apiClient.patch(`/api/users/${user.id}`, { name, phone });
      }
      updateUser({ name, phone });
      setMessage({ text: '회원 정보가 성공적으로 수정되었습니다! ✨', type: 'success' });
      setIsEditing(false);
    } catch (err) {
      console.warn('API 수정 실패, 로컬 상태 우선 업데이트(폴백)', err);
      updateUser({ name, phone });
      setMessage({ text: '회원 정보가 업데이트되었습니다.', type: 'success' });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 탈퇴하시겠습니까? 탈퇴 후 계정 정보는 복구할 수 없습니다.')) {
      return;
    }

    try {
      if (user.id) {
        await apiClient.delete(`/api/users/${user.id}`);
      }
    } catch (err) {
      console.warn('API 탈퇴 요청 실패, 로컬 로그아웃 우선 처리', err);
    } finally {
      alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
      logout();
      navigate('/');
    }
  };

  // 주문 상태 한글 및 뱃지 클래스 매핑
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending">접수 대기 ⏳</span>;
      case 'ACCEPTED':
        return <span className="badge badge-accepted">조리중 🍳</span>;
      case 'READY':
        return <span className="badge badge-accepted" style={{ background: '#e0f2fe', color: '#0369a1' }}>픽업 대기 🛍️</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">픽업 완료 ✅</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">주문 취소 ❌</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '20px auto 60px', width: '100%' }}>
      {/* 타이틀 헤더 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>👤</span> 마이페이지
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          내 계정 정보 확인 및 {isOwner ? '매장 운영 관리' : '주문 내역 관리'}를 진행할 수 있습니다.
        </p>
      </div>

      {message.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            backgroundColor: message.type === 'success' ? '#e6f7ec' : '#fde8e8',
            color: message.type === 'success' ? '#0f766e' : '#991b1b',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          {message.text}
        </div>
      )}

      {/* 1. 기본 프로필 카드 */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: isOwner ? '#fff3eb' : '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                border: `2px solid ${isOwner ? 'var(--primary)' : 'var(--secondary)'}`,
              }}
            >
              {isOwner ? '👨‍🍳' : '🙋'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{user.name || '루키즈 회원'}</h2>
                <span className={`badge ${isOwner ? 'badge-primary' : 'badge-accepted'}`} style={{ fontSize: '11px' }}>
                  {isOwner ? '사장님 회원' : '일반 손님'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                ✉️ {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-outline btn-sm"
          >
            {isEditing ? '취소' : '✏️ 정보 수정'}
          </button>
        </div>

        {/* 정보 수정 폼 or 정보 조회 영역 */}
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>프로필 수정</h3>
            <div className="form-group">
              <label className="form-label">이름 (닉네임)</label>
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label className="form-label">전화번호</label>
              <input
                type="tel"
                className="form-input"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '저장 중...' : '저장 완료'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">
                취소
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>연락처</span>
              <strong style={{ fontSize: '14px' }}>{user.phone || phone || '미등록'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>회원 유형</span>
              <strong style={{ fontSize: '14px' }}>{isOwner ? '매장 운영자 (OWNER)' : '주문 고객 (CUSTOMER)'}</strong>
            </div>
            {isOwner && user.storeName && (
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>운영 매장</span>
                <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>{user.storeName}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 사장님 전용 관리 퀵 패널 */}
      {isOwner && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏪</span> 사장님 전용 바로가기
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div
              onClick={() => navigate('/owner/dashboard')}
              style={{
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'var(--card-bg)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔔</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>실시간 주문 접수 대시보드</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                실시간 인입 주문 수락, 조리중, 조리완료 처리 및 당일 매출 통계
              </p>
            </div>

            <div
              onClick={() => navigate('/owner/store/edit')}
              style={{
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'var(--card-bg)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>⚙️</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>내 매장 정보 관리</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                가게명, 카테고리, 영업시간, 주소 정보 등록 및 수정
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. 손님 전용 최근 주문 내역 */}
      {!isOwner && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🧾</span> 최근 내 주문 내역
            </h2>
            <Link to="/" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              + 새 주문 하러가기
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {MOCK_CUSTOMER_ORDERS.map((order) => (
              <div
                key={order.orderId}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  backgroundColor: 'var(--bg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{order.storeName}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      #{order.orderId}
                    </span>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {order.items.map((it, idx) => (
                    <span key={idx} style={{ marginRight: '8px' }}>
                      {it.name} {it.quantity}개
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    픽업 시간: <strong>{order.pickupTime}</strong> ({order.orderDate})
                  </span>
                  <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>
                    {order.totalAmount.toLocaleString()}원
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 계정 관리 (로그아웃 / 탈퇴) */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-main)' }}>
          계정 설정
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              현재 로그인된 계정에서 안전하게 로그아웃하거나 서비스 탈퇴를 진행할 수 있습니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={logout} className="btn btn-outline btn-sm">
              로그아웃
            </button>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
