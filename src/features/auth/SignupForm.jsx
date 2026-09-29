import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import styles from './AuthForm.module.css';

/**
 * 회원가입 페이지 (/signup)
 *
 * form: {
 *   role: 'USER' | 'OWNER',   — 일반 손님 / 가게 사장님
 *   email: string,
 *   password: string,
 *   passwordConfirm: string,  — 화면 검증용, 서버로 보내지 않음
 *   name: string,
 *   phone: string,
 * }
 * 가입 성공 시 로그인 화면(/login)으로 이동
 *
 * API: POST /api/auth/signup
 *   요청: { email, password, name, phone, role }
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;
const MIN_PASSWORD_LENGTH = 8;

const ROLE_OPTIONS = [
  { value: 'USER', title: '일반 손님', desc: '포장 · 예약 주문' },
  { value: 'OWNER', title: '가게 사장님', desc: '매장 · 주문 관리' },
];

const INITIAL_FORM = {
  role: 'USER',
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
};

function validate(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = '이메일을 입력해주세요.';
  else if (!EMAIL_REGEX.test(form.email)) errors.email = '올바른 이메일 형식이 아닙니다.';

  if (!form.password) errors.password = '비밀번호를 입력해주세요.';
  else if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
  }

  if (!form.passwordConfirm) errors.passwordConfirm = '비밀번호를 한 번 더 입력해주세요.';
  else if (form.password !== form.passwordConfirm) errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';

  if (!form.name.trim()) errors.name = '이름을 입력해주세요.';

  if (!form.phone.trim()) errors.phone = '전화번호를 입력해주세요.';
  else if (!PHONE_REGEX.test(form.phone)) errors.phone = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)';

  return errors;
}

function SignupForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
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
      const { email, password, name, phone, role } = form;
      await apiClient.post('/api/auth/signup', { email, password, name, phone, role });
      navigate('/login', { replace: true });
    } catch (err) {
      // 백엔드 에러 응답: { status, message, timestamp, errors } — errors는 검증 실패(400) 시 필드별 메시지 맵
      const data = err.response?.data;
      const fieldErrors = data?.errors ?? {};
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setServerError(data?.message || '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 입력 필드 공통 렌더링 (label + input + 에러 메시지)
  const renderField = ({ name, label, type = 'text', placeholder, autoComplete, hint }) => (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${styles.input} ${errors[name] ? styles.inputError : ''}`}
        value={form[name]}
        onChange={handleChange}
        disabled={loading}
      />
      {errors[name]
        ? <p className={styles.errorText}>{errors[name]}</p>
        : hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo}>오더메이트</div>
          <p className={styles.subtitle}>골목 소상공인을 위한 스마트 오더</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <span id="role-label" className={styles.label}>회원 유형</span>
            <fieldset className={styles.roleGroup} disabled={loading} aria-labelledby="role-label">
              {ROLE_OPTIONS.map((option) => (
                <label key={option.value} className={styles.roleOption}>
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={form.role === option.value}
                    onChange={handleChange}
                  />
                  <span className={styles.roleTitle}>{option.title}</span>
                  <span className={styles.roleDesc}>{option.desc}</span>
                </label>
              ))}
            </fieldset>
          </div>

          {renderField({ name: 'email', label: '이메일', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' })}
          {renderField({
            name: 'password',
            label: '비밀번호',
            type: 'password',
            placeholder: '비밀번호를 입력하세요',
            autoComplete: 'new-password',
            hint: `${MIN_PASSWORD_LENGTH}자 이상 입력해주세요.`,
          })}
          {renderField({ name: 'passwordConfirm', label: '비밀번호 확인', type: 'password', placeholder: '비밀번호를 한 번 더 입력하세요', autoComplete: 'new-password' })}
          {renderField({ name: 'name', label: '이름', placeholder: '홍길동', autoComplete: 'name' })}
          {renderField({ name: 'phone', label: '전화번호', type: 'tel', placeholder: '010-1234-5678', autoComplete: 'tel' })}

          {serverError && <div className={styles.alert} role="alert">{serverError}</div>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '가입 처리 중...' : '회원가입 완료'}
          </button>
        </form>

        <p className={styles.signup}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className={styles.signupLink}>로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
