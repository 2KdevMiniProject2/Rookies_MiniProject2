import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * 백엔드(reservation-backend)와 통신하는 axios 인스턴스입니다.
 *
 * baseURL은 하드코딩하지 않고 Vite 환경변수(VITE_API_BASE_URL)로 관리합니다.
 * - 개발 중: .env.development → http://localhost:8080
 * - 배포 시: .env.production → 실제 배포 도메인
 *
 * 백엔드와 프론트엔드가 서로 다른 저장소/브랜치로 분리되어 있기 때문에,
 * 두 프로젝트를 연결하는 지점은 여기 baseURL과 REST API 설계서뿐입니다.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// authStore에 저장된 JWT를 모든 요청의 Authorization 헤더에 자동으로 실어 보냅니다.
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
