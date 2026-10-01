# 🛡️ [미니프로젝트 2 - 파트 A] Spring Security & JWT 전체 로드맵

> **수업 교재 `[수업중 실습 2-7]`의 내용을 우리 프로젝트(`User`, `Store`, `MariaDB`, `React`)에 1:1로 맞춤 변환한 실무 로드맵입니다.**  
> 대화가 길어지거나 세션이 변경되어도 언제든 이 문서를 기준으로 진행 상태를 확인하고 이어서 작업할 수 있습니다.

---

## 📌 진행 현황 요약 (현재 위치: 10단계 📍)

| 단계 | 작업 내용 | 매핑 파일 / 엔드포인트 | 상태 |
| :--- | :--- | :--- | :---: |
| **1단계** | **JJWT 0.12.7 의존성 추가** | `backend/pom.xml` | ✅ 완료 |
| **2단계** | **JWT 비밀키 및 만료 시간 설정** | `backend/src/main/resources/application.properties` | ✅ 완료 |
| **3단계** | **시큐리티 신분증 모델 생성** | `security/models/UserInfoUserDetails.java` | ✅ 완료 |
| **4단계** | **DB 유저 조회 서비스 구현** | `security/service/UserInfoUserDetailsService.java` | ✅ 완료 |
| **5단계** | **JWT 토큰 생성/검증 공장 완성** | `security/jwt/JwtService.java` | ✅ 완료 |
| **6단계** | **JWT 검문소 필터 완성** | `security/jwt/JwtAuthenticationFilter.java` | ✅ 완료 |
| **7단계** | **스프링 시큐리티 최종 조립** | `common/config/SecurityConfig.java` | ✅ 완료 |
| **8단계** | **UserService 로그인에 진짜 JWT 연결** | `user/service/UserService.java` | ✅ 완료 |
| **9단계** | **더미 유저 해시 동기화 & 로그인 검증** | `dummy-data.sql` 및 DB `users` (포스트맨 발급 성공) | ✅ 완료 |
| **10단계** | **[인가 검증] 발급받은 토큰으로 보호된 API 호출** | `GET /api/users/1` (Header: `Authorization: Bearer <토큰>`) | ⏳ **현재 진행 차례 📍** |
| **11단계** | **[권한 제어] 컨트롤러 사장님 권한 제한** | `StoreController`에 `@PreAuthorize("hasAuthority('OWNER')")` | ⏳ 진행 예정 |
| **12단계** | **[신분증 추출기] `@CurrentUser` 어노테이션 생성** | `security/annotation/CurrentUser.java` | ⏳ 진행 예정 |
| **13단계** | **[가게 등록 연동] 사장님 정보 자동 주입** | `StoreController.createStore`에 `@CurrentUser` 연결 | ⏳ 진행 예정 |
| **14단계** | **[내 정보 API] `GET /api/users/me` 추가** | `user/controller/UserController.java` | ⏳ 진행 예정 |

---

## 📝 단계별 상세 가이드

### [완료된 작업]
- **1단계~7단계 (보안 인프라 구축)**: Spring Security 필터체인, STATELESS 세션, JJWT 토큰 생성기, 인증 필터 구축 완료.
- **8단계 (로그인 서비스 연동)**: `UserService.login()`에서 `AuthenticationManager` 인증 후 `JwtService.generateToken()`을 호출해 진짜 JWT 발급.
- **9단계 (더미 데이터 해시 일치)**: `dummy-data.sql` 및 DB 비밀번호를 실제 `1234`의 BCrypt 해시(`$2a$10$P4nSfOHDM8lNQkFzSIZB6eepCP1Fv7rGzyp3PGPTfrlxDWGKe2GJu`)로 통일하여 포스트맨 로그인 200 OK 확인.

---

### [지금부터 이어서 할 작업]

### 10단계. [인가 검증] 발급받은 토큰으로 보호된 API 호출 테스트 📍
- **목적**: 발급받은 JWT가 실제로 Security 필터를 통과하여 보호된 리소스에 접근할 수 있는지 확인.
- **테스트 방법**:
  - 포스트맨에서 `GET http://localhost:8080/api/users/1` 호출
  - **Headers**: `Authorization: Bearer <9단계에서_발급받은_accessToken>`
  - 토큰이 있을 때: `200 OK` 및 유저 정보 반환
  - 토큰이 없을 때: `401 Unauthorized` 차단 확인

### 11단계. [권한 제어] 컨트롤러 사장님 전용 권한 걸기 (`@PreAuthorize`)
- **목적**: 일반 손님(`USER`)이 가게를 등록하거나 수정/삭제하지 못하도록 권한 차단.
- **작업 파일**: `StoreController.java`
- **적용 어노테이션**: `@PreAuthorize("hasAuthority('OWNER')")`

### 12단계. [신분증 추출기] `@CurrentUser` 메타 어노테이션 만들기
- **목적**: 컨트롤러 파라미터에서 긴 표현식(`@AuthenticationPrincipal...`) 대신 깔끔하게 로그인 유저 객체를 받기 위함.
- **작업 파일**: `security/annotation/CurrentUser.java` 생성
- **코드 형태**:
  ```java
  @Target(ElementType.PARAMETER)
  @Retention(RetentionPolicy.RUNTIME)
  @AuthenticationPrincipal(expression = "#this == 'anonymousUser' ? null : userInfo")
  public @interface CurrentUser {}
  ```

### 13단계. [가게 등록 연동] 사장님 정보 자동 주입
- **목적**: `StoreController.createStore()`에서 임시로 받던 `Long ownerId` 파라미터를 제거하고, `@CurrentUser User currentUser`로 자동 매핑.
- **작업 내용**: 가게 등록 시 로그인한 사장님이 소유자로 자동 저장.

### 14단계. [내 정보 API] `GET /api/users/me` 엔드포인트 추가
- **목적**: 프론트엔드(React)에서 새로고침 시 토큰만으로 로그인한 사람의 프로필(이름, 역할)을 조회할 수 있도록 지원.
- **작업 파일**: `UserController.java`

---

## 🔑 테스트용 계정 정보 (비밀번호: 모두 `1234`)
- **사장님(OWNER) 계정**: `owner@rookie.com` / `1234`
- **일반 손님(USER) 계정**: `customer@rookie.com` / `1234`
