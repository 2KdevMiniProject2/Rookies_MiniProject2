import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/common/Logo';
import styles from './AuthForm.module.css';

/**
 * 로그인 페이지 (/login)
 *
 * form: { email: string, password: string }  — 로컬 useState로 관리
 * 로그인 성공 시 authStore.login(user, accessToken) 호출 후 메인 홈(/)으로 이동
 *
 * API: POST /api/auth/login
 *   요청: { email, password }
 *   응답(200): { accessToken, user: { id, email, name, phone, role } } — 감싸지 않고 최상위에 바로 옴
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 개발 모드에서만 보이는 모의 로그인 계정 (백엔드 없이 화면 테스트용)
const MOCK_USERS = {
  OWNER: { id: 1, email: 'owner@rookie.com', name: '사장님 테스트', role: 'OWNER' },
  USER: { id: 2, email: 'user@rookie.com', name: '손님 테스트', role: 'USER' },
};

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = '이메일을 입력해주세요.';
  else if (!EMAIL_REGEX.test(email)) errors.email = '올바른 이메일 형식이 아닙니다.';
  if (!password) errors.password = '비밀번호를 입력해주세요.';
  return errors;
}

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', form);
      const { accessToken, user } = res.data;
      login(user, accessToken);
      navigate('/', { replace: true });
    } catch (err) {
      // 백엔드 에러 응답: { status, message, timestamp, errors } — errors는 검증 실패(400) 시 필드별 메시지 맵
      const data = err.response?.data;
      const fieldErrors = data?.errors ?? {};
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setServerError(data?.message || '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (role) => {
    login(MOCK_USERS[role], `mock-token-${role.toLowerCase()}`);
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <Logo className={styles.logo} />
          <p className={styles.subtitle}>동네 소상공인을 위한 스마트 픽업 오더</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
          </div>

          {serverError && <div className={styles.alert} role="alert">{serverError}</div>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className={styles.signup}>
          아직 회원이 아니신가요?{' '}
          <Link to="/signup" className={styles.signupLink}>회원가입</Link>
        </p>

        {import.meta.env.DEV && (
          <div className={styles.mock}>
            <span className={styles.mockLabel}>테스트 계정으로 바로 로그인</span>
            <div className={styles.mockButtons}>
              <button type="button" className={styles.mockButton} onClick={() => handleMockLogin('OWNER')}>
                사장님 모의 로그인
              </button>
              <button type="button" className={styles.mockButton} onClick={() => handleMockLogin('USER')}>
                손님 모의 로그인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
