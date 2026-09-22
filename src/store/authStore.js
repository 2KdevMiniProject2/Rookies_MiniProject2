import { create } from 'zustand';

/**
 * 로그인 상태(사용자 정보, role)를 전역으로 관리하는 zustand 스토어입니다.
 *
 * role은 백엔드 User.role(ENUM: USER, OWNER, ADMIN)과 동일한 값을 그대로 사용합니다.
 * 인증 담당자가 로그인 API를 붙이면서 login()/logout() 내부 구현을 채우면 됩니다.
 * (예: 로그인 성공 시 JWT를 저장하고, apiClient의 요청 인터셉터에서 그 토큰을 실어 보내는 방식)
 */
export const useAuthStore = create((set) => ({
  user: null, // { id, email, role } 형태 예정
  isAuthenticated: false,

  login: (user) => set({ user, isAuthenticated: true }),

  logout: () => set({ user: null, isAuthenticated: false }),
}));
