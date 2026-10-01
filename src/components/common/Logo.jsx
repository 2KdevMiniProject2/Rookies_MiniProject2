import logoSrc from '../../assets/logo.svg';
import styles from './Logo.module.css';

/**
 * 서비스 로고 이미지 (공용)
 *
 * Props:
 *   className?: string  — 화면별 크기 지정용 (예: height 값). 가로 폭은 원본 비율(약 3:1)에 맞춰 자동
 *
 * 로고 파일: src/assets/logo.svg (909 x 307)
 */
function Logo({ className = '' }) {
  return <img src={logoSrc} alt="주문앱 로고" className={`${styles.logo} ${className}`} />;
}

export default Logo;
