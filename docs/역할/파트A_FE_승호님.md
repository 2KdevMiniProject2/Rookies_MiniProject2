# 🧑‍💻 [파트 A - FE] 승호님 업무 가이드

---

## 1. 나의 핵심 미션 (식당 비유)
> 🏠 **"건물 짓고, 간판 달고, 사장님/손님 명찰 나눠주기!"**  
> 손님과 사장님이 시스템에 들어오는 입구(로그인/회원가입)를 열어주고, 동네 가게들이 쫘르륵 진열된 메인 홈 화면과 사장님의 내 매장 등록/수정 화면을 담당합니다.

---

## 2. 작업할 파일 및 컴포넌트 목록

* **작업 디렉터리**: `frontend/src/features/auth/`, `frontend/src/features/store/`
* **라우팅 등록**: `frontend/src/routes/AppRouter.jsx`

### 1) 구현해야 할 페이지 및 컴포넌트
1. **로그인 / 회원가입 페이지 (`/login`)**
   - 파일: `src/features/auth/LoginPage.jsx`
   - 내용: 
     - 로그인/회원가입 탭 전환
     - 역할 선택 (손님 `CUSTOMER` / 사장님 `OWNER`)
     - 이메일, 비밀번호, 이름 입력 및 유효성 검사
     - **개발 편의 기능**: "사장님 모의 로그인", "손님 모의 로그인" 원클릭 버튼 제공 (테스트할 때 팀원들이 매우 좋아합니다!)
     - 로그인 성공 시 `authStore.login(user)` 호출 및 토큰 저장
2. **메인 홈 페이지 (`/`)**
   - 파일: `src/features/store/StoreListPage.jsx`
   - 컴포넌트:
     - `src/features/store/CategoryFilter.jsx`: 전체, 카페/디저트, 베이커리 등 카테고리 칩 필터
     - `src/features/store/StoreCard.jsx`: 가게 이미지, 가게명, 카테고리, 영업시간, 별점/리뷰수 표시
     - 클릭 시 `/stores/{storeId}` (파트 B 영서님 화면)으로 이동!
3. **사장님 가게 정보 등록 / 수정 페이지 (`/owner/store/edit`)**
   - 파일: `src/features/store/StoreEditPage.jsx`
   - 내용: 가게명, 카테고리, 사업장 주소, 대표 전화번호, 오픈/마감 시간, 가게 소개글 입력 폼

---

## 3. 내가 호출할 백엔드 API (현준님과 소통)

| 기능 | HTTP Method | URI | 설명 |
| :--- | :--- | :--- | :--- |
| 회원가입 | `POST` | `/api/auth/signup` | `{ email, password, name, role }` |
| 로그인 | `POST` | `/api/auth/login` | `{ email, password }` ➔ 토큰 & user 정보 반환 |
| 가게 목록 조회 | `GET` | `/api/stores?category=...` | 메인 홈 가게 카드 배열 수신 |
| 가게 등록/수정 | `POST` | `/api/stores` | 사장님의 내 가게 정보 저장 |

> 💡 **백엔드 연동 전 Tip (Mock Data)**:  
> 현준님이 API를 완성하기 전에는 `StoreListPage.jsx` 내부에 가짜 가게 리스트 더미 객체(3~4개)를 넣어두고 UI 퍼블리싱 및 필터 동작을 먼저 완성하세요!

---

## 4. 다른 파트에 넘겨줄 핵심 선물
* 👉 **`store_id` (가게 번호)**: 메인 홈에서 특정 가게 카드를 클릭했을 때, 파트 B 영서님의 가게 상세 페이지(`/stores/:storeId`)로 `store_id`를 넘겨주어야 합니다.

---

## 5. 단계별 체크리스트
- [ ] `LoginPage.jsx` 퍼블리싱 및 폼 상태(`useState`) 관리
- [ ] `authStore`와 연동하여 로그인 상태 및 유저 정보 전역 보관
- [ ] `StoreCard.jsx` 및 `CategoryFilter.jsx` UI 제작 (반응형 그리드)
- [ ] `StoreListPage.jsx`에서 카테고리 클릭 시 필터링 동작 구현
- [ ] 현준님과 로그인 및 가게 목록 API 연동 테스트
