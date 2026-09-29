import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/layout/Header';
import ProtectedRoute from './ProtectedRoute';

// 기능 페이지 컴포넌트 임포트
import LoginPage from '../features/auth/LoginPage';
import MyPage from '../features/auth/MyPage';
import StoreListPage from '../features/store/StoreListPage';
import StoreDetailPage from '../features/order/StoreDetailPage';
import CheckoutPage from '../features/order/CheckoutPage';
import OwnerDashboardPage from '../features/dashboard/OwnerDashboardPage';
import StoreEditPage from '../features/store/StoreEditPage';

function AppRouter() {
  return (
    <BrowserRouter>
      {/* 상단 글로벌 헤더 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="main-container">
        <Routes>
          {/* 1. 누구나 접근 가능한 공개 라우트 */}
          <Route path="/" element={<StoreListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/stores/:storeId" element={<StoreDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* 2. 사장님(OWNER) 전용 보호 라우트 (시연용으로는 누구나 접근 가능하도록 열어둠) */}
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="/owner/store/edit" element={<StoreEditPage />} />

          {/* 알 수 없는 경로는 홈으로 리다이렉트 */}
          <Route path="*" element={<StoreListPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default AppRouter;

