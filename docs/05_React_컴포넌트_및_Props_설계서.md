# ⚛️ [루키즈 미니프로젝트 2] 05. React 컴포넌트 및 Props 설계서

---

## 1. 프론트엔드 설계 원칙 및 상태 관리

* **컴포넌트 설계 원칙**:
  * **단일 책임 원칙**: 하나의 컴포넌트는 오직 하나의 뷰 또는 인터랙션만 담당합니다.
  * **재사용성**: 버튼, 입력창, 모달, 카드 등은 `components/common/`으로 모듈화합니다.
  * **Props 명세**: 각 컴포넌트가 필요로 하는 데이터(Props)와 이벤트 콜백 함수를 엄격히 정의합니다.
* **상태 관리 전략**:
  * **전역 상태 (Zustand)**:
    * `authStore`: 로그인한 사용자 정보 (`user`), 인증 여부 (`isAuthenticated`), 토큰 관리
    * `cartStore`: 현재 선택된 매장 ID (`storeId`), 장바구니 품목 배열 (`items`), 총 금액 계산
  * **로컬 상태 (React `useState`)**: 폼 입력값, 모달 열림/닫힘 상태, 탭 선택 등

---

## 2. 컴포넌트 계층 구조 및 폴더 트리

```
src/
├── api/
│   └── client.js                 # Axios 인터셉터 (JWT 토큰 자동 첨부)
├── store/
│   ├── authStore.js              # 인증 및 유저 상태 (Zustand)
│   └── cartStore.js              # 장바구니 상태 (Zustand)
├── components/
│   ├── common/                   # 공통 UI 컴포넌트
│   │   ├── Button.jsx            # 공통 버튼 (primary, danger, outline 등)
│   │   ├── Input.jsx             # 공통 인풋 (라벨, 에러 메시지 지원)
│   │   ├── Badge.jsx             # 주문 상태 뱃지 (PENDING, ACCEPTED 등)
│   │   └── Modal.jsx             # 공통 팝업 모달
│   └── layout/
│       ├── Header.jsx            # 상단 글로벌 내비게이션 바
│       └── Footer.jsx            # 하단 카피라이트
└── features/
    ├── auth/                     # 🟢 파트 A: 회원 도메인
    │   ├── LoginPage.jsx         # 로그인/회원가입 종합 화면
    │   ├── LoginForm.jsx         # 로그인 폼
    │   └── SignupForm.jsx        # 회원가입 폼
    ├── store/                    # 🟢 파트 A: 가게 도메인
    │   ├── StoreListPage.jsx     # 메인 홈 가게 목록 페이지
    │   ├── StoreCard.jsx         # 개별 가게 카드 컴포넌트
    │   ├── CategoryFilter.jsx    # 카테고리 칩 필터
    │   └── StoreEditPage.jsx     # 사장님 매장 등록/수정 페이지
    ├── order/                    # 🟡 파트 B: 메뉴 & 주문 도메인
    │   ├── StoreDetailPage.jsx   # 가게 상세 및 메뉴판 메인 페이지
    │   ├── MenuList.jsx          # 메뉴 목록 리스트
    │   ├── MenuItemCard.jsx      # 개별 메뉴 카드 (담기 버튼, 품절 처리)
    │   ├── CartBottomBar.jsx     # 하단 장바구니 요약 플로팅 바
    │   ├── CheckoutPage.jsx      # 주문서 작성 및 픽업시간 선택 페이지
    │   └── OwnerMenuPage.jsx     # 사장님 메뉴 등록 및 품절 토글 페이지
    └── dashboard/                # 🔴 파트 C: 사장님 대시보드 도메인
        ├── OwnerDashboardPage.jsx# 사장님 실시간 주문 접수 메인 페이지
        ├── SalesSummaryCard.jsx  # 당일 매출 현황 카드 (건수, 총액)
        ├── OrderQueueList.jsx    # 접수대기 / 조리중 주문 리스트
        ├── OrderItemCard.jsx     # 주문 수락/조리완료 제어 카드
        └── OrderStatusPage.jsx   # 손님용 실시간 주문 진행 상태 페이지
```

---

## 3. 주요 컴포넌트 및 Props 설계

### 3.1 🟢 [파트 A] 공통 및 가게 컴포넌트

#### `StoreCard.jsx` (가게 카드)
* **역할**: 메인 화면에서 가게의 요약 정보(사진, 이름, 평점, 영업시간)를 렌더링하고 클릭 시 상세 페이지로 이동.
* **Props 명세**:
```typescript
interface StoreCardProps {
  store: {
    id: number;
    name: string;
    category: string;
    address: string;
    openTime: string;
    closeTime: string;
    imageUrl?: string;
  };
  onClick: (storeId: number) => void;
}
```

#### `CategoryFilter.jsx` (카테고리 칩)
* **역할**: '전체', '카페/디저트', '베이커리' 등의 카테고리 선택 칩 필터링.
* **Props 명세**:
```typescript
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}
```

---

### 3.2 🟡 [파트 B] 메뉴 및 장바구니 컴포넌트

#### `MenuItemCard.jsx` (메뉴 아이템 카드)
* **역할**: 개별 메뉴 정보 표시 및 `+ 담기` 클릭 이벤트 발송. 품절 시 비활성화.
* **Props 명세**:
```typescript
interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    isSoldOut: boolean;
    imageUrl?: string;
  };
  onAddToCart: (item: MenuItem) => void;
}
```

#### `CartBottomBar.jsx` (하단 장바구니 요약 바)
* **역할**: 장바구니에 담긴 메뉴 개수 및 총 합계 금액을 표시하고 `[주문하기]` 클릭 시 체크아웃 페이지로 이동.
* **Props 명세**:
```typescript
interface CartBottomBarProps {
  totalQuantity: number;
  totalAmount: number;
  onCheckout: () => void;
}
```

---

### 3.3 🔴 [파트 C] 실시간 주문 및 대시보드 컴포넌트

#### `SalesSummaryCard.jsx` (당일 매출 현황 카드)
* **역할**: 사장님 대시보드 최상단에 오늘 처리된 주문 건수와 총 매출액을 시각적으로 표시.
* **Props 명세**:
```typescript
interface SalesSummaryCardProps {
  orderCount: number;
  totalSales: number;
  isLoading: boolean;
}
```

#### `OrderItemCard.jsx` (사장님 주문 접수/제어 카드)
* **역할**: 주문번호, 손님명, 픽업시간, 주문메뉴 내역을 표시하고 원클릭으로 주문 상태를 변경.
* **Props 명세**:
```typescript
interface OrderItemCardProps {
  order: {
    orderId: number;
    customerName: string;
    pickupTime: string;
    status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
    totalAmount: number;
    requestNotes?: string;
    items: Array<{ menuName: string; quantity: number; orderPrice: number }>;
  };
  onAccept: (orderId: number) => void;    // PENDING -> ACCEPTED
  onComplete: (orderId: number) => void;  // ACCEPTED -> COMPLETED
  onReject?: (orderId: number) => void;   // PENDING -> CANCELLED
}
```

#### `OrderStatusBadge.jsx` (주문 상태 뱃지)
* **역할**: `PENDING`, `ACCEPTED`, `COMPLETED` 등 상태에 따라 알맞은 색상과 한글 레이블을 출력.
* **Props 명세**:
```typescript
interface OrderStatusBadgeProps {
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
}
// 출력 예시: PENDING -> 노란색 '접수 대기', ACCEPTED -> 파란색 '조리중', COMPLETED -> 초록색 '조리 완료'
```
