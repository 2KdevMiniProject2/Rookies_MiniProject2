import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 로그인 상태(사용자 정보, role)를 전역으로 관리하는 zustand 스토어입니다.
 *
 * role은 백엔드 User.role(ENUM: USER, OWNER, ADMIN)과 동일한 값을 그대로 사용합니다.
 * 인증 담당자가 로그인 API를 붙이면서 login()/logout() 내부 구현을 채우면 됩니다.
 * (예: 로그인 성공 시 JWT를 저장하고, apiClient의 요청 인터셉터에서 그 토큰을 실어 보내는 방식)
 *
 * persist 미들웨어로 localStorage('auth-storage')에 저장되어 새로고침해도 로그인이 유지됩니다.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { id, email, name, phone, role } 형태 (로그인 응답의 user 그대로)
      token: null, // JWT accessToken
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' },
  ),
);
