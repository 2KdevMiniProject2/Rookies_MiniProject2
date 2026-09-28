# auth
로그인 상태(사용자 정보·토큰)는 `src/store/authStore.js`(Zustand)에 저장하고, API 호출은 `src/api/client.js`를 통해 진행

> 담당: Part A 전승호

---

## ⚠️ 현재 API 연동 상태

- **로그인·회원가입 화면은 더미 데이터로 동작하지 않습니다.** 두 화면 모두 실제 API(`POST /api/auth/login`, `POST /api/auth/signup`)를 호출하는 코드로 작성되어 있음
- **백엔드가 아직 연결되지 않아서**, 지금 "로그인"·"회원가입 완료" 버튼을 누르면 요청이 실패하고 폼 위에 실패 알림이 뜸
  - 로그인: "로그인에 실패했습니다. 잠시 후 다시 시도해주세요."
  - 회원가입: "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요."
- **백엔드 없이 테스트하는 방법**: 로그인 화면 하단의 **"사장님 모의 로그인" / "손님 모의 로그인"** 버튼 (개발 모드 `npm run dev`에서만 보임). API를 호출하지 않고 가짜 사용자 정보를 `authStore`에 바로 저장
- 회원가입에는 모의 기능이 없습니다. 백엔드 연결 전에는 가입 성공 흐름(→ `/login` 이동)을 확인할 수 없음

---

## 파일 구성

| 파일 | 역할 |
|---|---|
| `LoginPage.jsx` | 로그인 화면 (`/login`) |
| `SignupForm.jsx` | 회원가입 화면 (`/signup`) |
| `AuthForm.module.css` | 두 화면 공용 스타일 (CSS Modules) |

라우트 등록은 `src/routes/AppRouter.jsx`에 되어 있으며, 두 화면 모두 로그인 없이 접근 가능한 공개 라우트

---

## 로그인 화면 — `LoginPage.jsx` (`/login`)

### 폼 필드
| 필드 | 입력 타입 | 비고 |
|---|---|---|
| 이메일 (`email`) | `email` | placeholder `you@example.com` |
| 비밀번호 (`password`) | `password` | |

### 유효성 검사 (제출 버튼을 눌렀을 때만 실행)
| 필드 | 규칙 | 에러 메시지 |
|---|---|---|
| email | 앞뒤 공백 제거 후 빈 값 | 이메일을 입력해주세요. |
| email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` 불일치 | 올바른 이메일 형식이 아닙니다. |
| password | 빈 값 (길이 제한 없음) | 비밀번호를 입력해주세요. |

- 브라우저 기본 검증은 끄고(`noValidate`) 에러를 입력칸 아래에 직접 표시
- 입력을 고치면 그 칸의 에러가 바로 사라짐

### 로그인 요청 처리
1. 검증 통과 시 `POST /api/auth/login`에 `{ email, password }` 전송
2. 요청 중에는 입력칸·버튼 비활성화, 버튼 글자 "로그인 중..."
3. **성공**: 응답의 `data.accessToken`, `data.user`로 `authStore.login(user, accessToken)` 호출 → 메인 홈(`/`)으로 이동
4. **실패**:
   - 서버 에러에 `field`가 있으면 → 해당 입력칸 아래에 서버 메시지 표시
   - `field`가 없으면 → 폼 위 알림 박스에 서버 메시지 표시
   - 서버 응답 자체가 없으면(백엔드 꺼짐 등) → 기본 문구 표시

### 모의 로그인 (개발 모드 전용)
| 버튼 | 저장되는 사용자 | 저장되는 토큰 |
|---|---|---|
| 사장님 모의 로그인 | `{ id: 1, email: 'owner@rookie.com', name: '사장님 테스트', role: 'OWNER' }` | `mock-token-owner` |
| 손님 모의 로그인 | `{ id: 2, email: 'user@rookie.com', name: '손님 테스트', role: 'USER' }` | `mock-token-user` |

- `import.meta.env.DEV`가 참일 때만 렌더링 → 배포 빌드에는 나타나지 않음
- 클릭 시 `authStore.login()` 후 `/`로 이동

### 기타
- 하단 "아직 회원이 아니신가요? **회원가입**" 링크 → `/signup`

---

## 회원가입 화면 — `SignupForm.jsx` (`/signup`)

### 폼 필드
| 필드 | 입력 타입 | 비고 |
|---|---|---|
| 회원 유형 (`role`) | 라디오 (카드형 2개) | 일반 손님 `USER` / 가게 사장님 `OWNER`, 기본값 `USER` |
| 이메일 (`email`) | `email` | |
| 비밀번호 (`password`) | `password` | 아래 힌트 "8자 이상 입력해주세요." |
| 비밀번호 확인 (`passwordConfirm`) | `password` | 화면 검증용, 서버로 보내지 않음 |
| 이름 (`name`) | `text` | |
| 전화번호 (`phone`) | `tel` | placeholder `010-1234-5678` |

### 유효성 검사 (제출 버튼을 눌렀을 때만 실행)
| 필드 | 규칙 | 에러 메시지 |
|---|---|---|
| role | 검증 없음 (항상 값이 있음) | — |
| email | 앞뒤 공백 제거 후 빈 값 | 이메일을 입력해주세요. |
| email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` 불일치 | 올바른 이메일 형식이 아닙니다. |
| password | 빈 값 | 비밀번호를 입력해주세요. |
| password | 8자 미만 | 비밀번호는 8자 이상이어야 합니다. |
| passwordConfirm | 빈 값 | 비밀번호를 한 번 더 입력해주세요. |
| passwordConfirm | `password`와 다름 | 비밀번호가 일치하지 않습니다. |
| name | 앞뒤 공백 제거 후 빈 값 | 이름을 입력해주세요. |
| phone | 앞뒤 공백 제거 후 빈 값 | 전화번호를 입력해주세요. |
| phone | `/^01[016789]-?\d{3,4}-?\d{4}$/` 불일치 | 올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678) |

- 전화번호는 하이픈이 있어도 없어도 통과 (`01012345678`, `010-1234-5678` 모두 가능)
- 공백 제거(`trim`)는 빈 값 판단에만 쓰고, **서버에는 입력한 값 그대로 전송**

### 회원가입 요청 처리
1. 검증 통과 시 `POST /api/auth/signup`에 `{ email, password, name, phone, role }` 전송
2. 요청 중에는 입력칸·역할 선택·버튼 비활성화, 버튼 글자 "가입 처리 중..."
3. **성공**: 로그인 화면(`/login`)으로 이동 (자동 로그인하지 않음, 응답 본문은 사용하지 않음)
4. **실패**: 로그인 화면과 같은 방식 (`field` 있으면 해당 칸 아래 / 없으면 폼 위 알림 / 응답 없으면 기본 문구)

### 기타
- 하단 "이미 계정이 있으신가요? **로그인**" 링크 → `/login`
- 회원가입 화면은 `authStore`를 사용하지 않음

---

## authStore 연동 — `src/store/authStore.js`

| 항목 | 내용 |
|---|---|
| 상태 | `user` (`{ id, email, name, role }` 또는 `null`), `token` (문자열 또는 `null`), `isAuthenticated` (`boolean`) |
| `login(user, token)` | 세 값을 저장하고 `isAuthenticated = true`. **이 폴더에서는 `LoginPage`의 로그인 성공 시와 모의 로그인 버튼 클릭 시에만 호출** |
| `logout()` | 세 값을 초기화. 이 폴더에는 로그아웃 버튼이 없음 (메인 홈 `StoreListPage` 헤더에 있음) |
| 토큰 저장 방식 | Zustand `persist` 미들웨어로 **브라우저 localStorage의 `auth-storage` 키**에 저장 → 새로고침해도 로그인 유지 |

### 토큰 사용 — `src/api/client.js`
- Axios 요청 인터셉터가 매 요청마다 `authStore`의 `token`을 읽어, 값이 있으면 `Authorization: Bearer <token>` 헤더를 자동으로 붙임
- baseURL은 `.env.development`의 `VITE_API_BASE_URL`(`http://localhost:8080`, `/api` 미포함) → 호출 경로에 `/api/...`를 붙여 사용

---

## 스타일 — `AuthForm.module.css`

- 두 화면이 같은 CSS 파일을 공유 (가운데 카드 최대 520px, 역할 선택 카드, 에러·알림 스타일 등)
- 최상위 `.page`는 `width: 100vw; margin-left: calc(-50vw + 50%)`로 공용 `#root`(최대 1126px) 박스를 벗어나 배경을 화면 전체 폭으로 표시. 이로 인한 가로 스크롤은 `:global(html):has(.page) { overflow-x: clip; }`로 이 화면이 떠 있을 때만 막음
- 색상은 `src/index.css`의 CSS 변수(`--accent`, `--bg` 등)를 사용 → 다크모드 자동 대응
- 화면 너비 480px 이하에서는 카드 안쪽 여백을 줄임

---

## 아직 안 된 부분 / TODO

**백엔드 연동 관련**
- 백엔드 완성 후 로그인·회원가입 API 실제 연동 테스트 (응답 형태 `data.accessToken`, `data.user` 확인)
- 로그인 API 형식을 가정함 → 백엔드와 확정 필요
- 서버 에러의 `field` 값이 폼 필드명(`email`, `password`, `name`, `phone`)과 같은지 확인
- 비밀번호 8자 이상 규칙은 화면 쪽에서 임의로 정한 값 → 백엔드 검증 규칙과 통일
- 전화번호 저장 형식(하이픈 유무) 백엔드와 맞추기 — 지금은 입력값 그대로 전송

**미구현 기능**
- 토큰 만료·401 응답 시 자동 로그아웃 없음 (`client.js`에 응답 인터셉터 없음)
- 이미 로그인한 상태에서 `/login`, `/signup`에 들어가도 메인 홈으로 돌려보내지 않음
- 로그인 후 역할별 이동 없음 — 사장님·손님 모두 `/`로 이동
- (선택) 회원가입 성공 후 로그인 화면에 안내 메시지나 이메일 자동 입력 없음

**알아둘 점**
- 모의 로그인 토큰(`mock-token-*`)은 가짜라서, 백엔드가 연결되면 이 토큰으로 보낸 요청은 거절(401)됩니다. 백엔드 연동 후에는 실제 계정으로 테스트해야 함
- 토큰을 localStorage에 저장하는 방식은 새로고침 유지에는 편하지만 XSS 공격에 노출될 수 있음
