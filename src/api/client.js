import axios from 'axios';

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

// 인증 담당자가 JWT를 도입하면, 여기에 요청 인터셉터를 추가해서
// 저장된 토큰을 Authorization 헤더에 자동으로 실어보내는 로직을 넣으면 됩니다.
// apiClient.interceptors.request.use((config) => { ... });

export default apiClient;
