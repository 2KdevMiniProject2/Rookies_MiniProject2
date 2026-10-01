import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../features/order/DashboardPage';
import OrderStatusPage from '../features/order/OrderStatusPage';
import StoreOrderPage from '../features/order/StoreOrderPage';
import CartPage from '../features/order/CartPage';

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
        <Route path="/" element={<div>홈 화면(본영) (추후 각자 페이지로 교체)</div>} />

        {/* 로그인 없이 접근 가능한 라우트는 여기에 추가 */}
        {/* [파트 C · 본영] 로그인 기능이 붙기 전까지는 공개 영역에 둠 */}
          {/* 주문 페이지*/}
          <Route path="/stores/:storeId" element={<StoreOrderPage />} />
          {/* 장바구니 — 주문 페이지에서 담은 메뉴를 넘겨받는다 */}
          <Route path="/cart" element={<CartPage />} />
          {/* 사장님 주문 대시보드 — 가게 번호를 주소로 받는다 */}
          <Route path="/owner/stores/:storeId/orders" element={<DashboardPage />} />
          {/* 사장님 대시보드 페이지 1번 사장님만 보임. (로그인 붙기 전 임시)*/}
          <Route path="/owner/dashboard" element={<Navigate to="/owner/stores/1/orders" replace/>} />
          {/* 손님용 주문 현황 페이지 */}
          <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        {/* 로그인만 하면 접근 가능한 라우트 예시 */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/mypage" element={<MyPage />} /> */}
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
