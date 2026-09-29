import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsOwner, loginAsCustomer } = useAuthStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'

  // 로그인 폼 상태
  const [loginEmail, setLoginEmail] = useState('owner@rookie.com');
  const [loginPassword, setLoginPassword] = useState('1234');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 회원가입 폼 상태
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'CUSTOMER', // CUSTOMER or OWNER
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  // 로그인 처리
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      const data = response.data;
      // 백엔드 응답이 { accessToken, user } 또는 { success, data: { accessToken, user } } 일 수 있음
      const result = data.data || data;
      login(result.user || result, result.accessToken);

      const userRole = result.user?.role || result.role;
      if (userRole === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.warn('API 로그인 실패, 모의 로그인으로 안전 폴백', err);
      // 백엔드 연결 불가 또는 에러 시에도 시연 가능하도록 폴백
      if (loginEmail.includes('owner')) {
        loginAsOwner();
        navigate('/owner/dashboard');
      } else {
        loginAsCustomer();
        navigate('/');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // 회원가입 처리
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('');

    try {
      await apiClient.post('/api/auth/signup', signupForm);
      alert('회원가입이 완료되었습니다! 로그인해 주세요.');
      setActiveTab('login');
      setLoginEmail(signupForm.email);
    } catch (err) {
      console.error('회원가입 오류', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || '회원가입 중 오류가 발생했습니다.';
      setSignupError(errMsg);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', width: '100%' }}>
      <div className="card" style={{ padding: '32px 28px' }}>
        {/* 상단 타이틀 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🥐</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>루키즈 오더</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>동네 소상공인을 위한 스마트 픽업 오더</p>
        </div>

        {/* 탭 버튼 */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'login' ? '3px solid var(--primary)' : '3px solid transparent',
              fontWeight: activeTab === 'login' ? '700' : '500',
              color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            로그인
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'signup' ? '3px solid var(--primary)' : '3px solid transparent',
              fontWeight: activeTab === 'signup' ? '700' : '500',
              color: activeTab === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            회원가입
          </button>
        </div>

        {/* [1] 로그인 탭 */}
        {activeTab === 'login' ? (
          <div>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">이메일</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              {loginError && (
                <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '14px' }}>
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg" disabled={loginLoading}>
                {loginLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            {/* 시연 & 발표용 원클릭 치트키 */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px' }}>
                ⚡ 빠른 시연용 원클릭 테스트 계정:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { loginAsOwner(); navigate('/owner/dashboard'); }}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                >
                  👨‍🍳 사장님 바로 로그인
                </button>
                <button
                  type="button"
                  onClick={() => { loginAsCustomer(); navigate('/'); }}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                >
                  🙋 손님 바로 로그인
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* [2] 회원가입 탭 */
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label className="form-label">회원 유형</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="CUSTOMER"
                    checked={signupForm.role === 'CUSTOMER'}
                    onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                  />
                  손님 (주문자)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="OWNER"
                    checked={signupForm.role === 'OWNER'}
                    onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                  />
                  사장님 (가게 운영)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                type="text"
                className="form-input"
                required
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                placeholder="홍길동"
              />
            </div>

            <div className="form-group">
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-input"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                placeholder="user@rookie.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                className="form-input"
                required
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                placeholder="4자리 이상"
              />
            </div>

            <div className="form-group">
              <label className="form-label">전화번호</label>
              <input
                type="tel"
                className="form-input"
                required
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                placeholder="010-1234-5678"
              />
            </div>

            {signupError && (
              <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '14px' }}>
                {signupError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={signupLoading}>
              {signupLoading ? '가입 진행 중...' : '회원가입 완료'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
