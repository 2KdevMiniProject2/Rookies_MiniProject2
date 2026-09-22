import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * 로그인 여부 및 역할(role)에 따라 접근을 제한하는 라우트 가드입니다.
 *
 * 사용 예시 (AppRouter.jsx):
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 *
 * allowedRoles를 생략하면 "로그인만 되어 있으면 통과"로 동작합니다.
 * 실제 보안 검증은 백엔드(SecurityConfig, 인증 담당자가 구현할 접근 제어)가 최종 책임지며,
 * 이 컴포넌트는 화면 라우팅 레벨에서의 1차 방어(사용자 경험 개선)입니다.
 */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
