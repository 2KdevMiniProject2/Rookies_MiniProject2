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
import OwnerStoreListPage from '../features/store/OwnerStoreListPage';
import StoreEditPage from '../features/store/StoreEditPage';
import UserInfoPage from '../features/auth/UserInfoPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/stores/:storeId" element={<StoreOrderPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/profile" element={<UserInfoPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
          <Route path="/stores/register" element={<StoreRegisterPage />} />
          <Route path="/owner/stores" element={<OwnerStoreListPage />} />
          <Route path="/owner/stores/:storeId/menus" element={<MenuRegisterPage />} />
          <Route path="/owner/stores/:storeId/edit" element={<StoreEditPage />} />
          <Route path="/owner/stores/:storeId/orders" element={<DashboardPage />} />
          <Route path="/owner/dashboard" element={<Navigate to="/owner/stores/1/orders" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          {/* ADMIN 전용 라우트 */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
