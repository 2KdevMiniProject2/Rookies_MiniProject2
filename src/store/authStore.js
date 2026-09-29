import { create } from 'zustand';

/**
 * 로그인 상태(사용자 정보, role)를 전역으로 관리하는 zustand 스토어입니다.
 *
 * role은 백엔드 User.role(ENUM: USER, OWNER, ADMIN)과 동일한 값을 그대로 사용합니다.
 * 인증 담당자가 로그인 API를 붙이면서 login()/logout() 내부 구현을 채우면 됩니다.
 * (예: 로그인 성공 시 JWT를 저장하고, apiClient의 요청 인터셉터에서 그 토큰을 실어 보내는 방식)
 */
const STORAGE_KEY = 'rookie_order_auth';

// 새로고침 시 localStorage에서 복원
const getInitialAuth = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: !!parsed.user,
      };
    }
  } catch (e) {
    console.error('Failed to parse auth from localStorage', e);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initial = getInitialAuth();

export const useAuthStore = create((set) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: initial.isAuthenticated,

  // 실제 API 로그인 시 호출
  login: (userData, token = null) => {
    const finalToken = token || (userData && userData.accessToken) || 'mock-token';
    const finalUser = userData.user || userData;
    const authData = { user: finalUser, token: finalToken, isAuthenticated: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    set(authData);
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  // 회원 정보 업데이트
  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updatedFields };
      const authData = { user: updatedUser, token: state.token, isAuthenticated: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      return { user: updatedUser };
    });
  },

  // 발표 및 시연용 원클릭 모의 로그인 (사장님)
  loginAsOwner: () => {
    const ownerUser = {
      id: 1,
      email: 'owner@rookie.com',
      name: '김루키 사장님',
      role: 'OWNER',
      storeId: 1,
      storeName: '루키즈 베이커리',
    };
    const authData = { user: ownerUser, token: 'mock-jwt-token-for-owner@rookie.com', isAuthenticated: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    set(authData);
  },

  // 발표 및 시연용 원클릭 모의 로그인 (손님)
  loginAsCustomer: () => {
    const customerUser = {
      id: 2,
      email: 'customer1@rookie.com',
      name: '김손님',
      role: 'CUSTOMER',
      phone: '010-3333-4444',
    };
    const authData = { user: customerUser, token: 'mock-jwt-token-for-customer1@rookie.com', isAuthenticated: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    set(authData);
  },
}));
