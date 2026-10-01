import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/LoginPage';
import SignupForm from '../features/auth/SignupForm';
import StoreListPage from '../features/store/StoreListPage';

import DashboardPage from '../features/order/DashboardPage';
import OrderStatusPage from '../features/order/OrderStatusPage';
import StoreOrderPage from '../features/order/StoreOrderPage';
import CartPage from '../features/order/CartPage';

import MyPage from '../features/auth/MyPage';
import StoreRegisterPage from '../features/store/StoreRegisterPage';
import MenuRegisterPage from '../features/store/MenuRegisterPage';
import StoreListPage from '../features/store/OwnerStoreListPage';
import StoreEditPage from '../features/store/StoreEditPage';
import UserInfoPage from '../features/auth/UserInfoPage';

/**
 * 전체 라우팅을 한 곳에 모아두는 파일입니다.
 * 각 담당자는 자신의 features/<도메인> 폴더에 페이지 컴포넌트를 만들고,
 * 이 파일에 Route 한 줄만 추가하면 됩니다. (여러 명이 같은 파일을 조금씩만 건드리게 되어
 * 병합 충돌이 나더라도 범위가 작습니다.)
 *
 * 예시:
 *   import LoginPage from '../features/auth/LoginPage';
 *   <Route path="/login" element={<LoginPage />} />
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreListPage />} />

        {/* 로그인 없이 접근 가능한 라우트는 여기에 추가 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />
        {/* [파트 C · 본영] 가게 메뉴 보고 담기 (가게 · 메뉴 조회는 로그인 없이 가능) */}
        <Route path="/stores/:storeId" element={<StoreOrderPage />} />

        {/* [파트 B · 본영] 마이페이지 부분 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/stores/register"  element={<StoreRegisterPage />} />
        <Route path="/owner/stores" element={<OwnerStoreListPage />} />
        <Route path="/owner/stores/:storeId/menus" element={<MenuRegisterPage />} />
        <Route path="/owner/stores/:storeId/edit" element={<StoreEditPage />} />
        <Route path="/mypage/profile" element={<UserInfoPage />} />


        {/* 로그인만 하면 접근 가능한 라우트 예시 */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/mypage" element={<MyPage />} /> */}
          {/* [파트 C · 본영] 장바구니 · 손님 주문 상태 (주문하기 · 내 주문 조회 API 토큰 필요) */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        </Route>

        {/* [파트 C · 본영] 사장님(OWNER)만 접근 — 주문 대시보드 */}
        <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
          <Route path="/owner/stores/:storeId/orders" element={<DashboardPage />} />
          {/* 임시: 1번 가게 대시보드로 (가게 선택 화면이 생기면 교체) */}
          <Route path="/owner/dashboard" element={<Navigate to="/owner/stores/1/orders" replace />} />
        </Route>

        {/* ADMIN만 접근 가능한 라우트 예시 */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          {/* <Route path="/admin" element={<AdminPage />} /> */}
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;