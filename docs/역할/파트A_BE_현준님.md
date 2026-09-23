# ⚙️ [파트 A - BE] 현준님 업무 가이드

---

## 1. 나의 핵심 미션 (식당 비유)
> 🏠 **"건물 짓고, 간판 달고, 사장님/손님 명찰 나눠주기!"**  
> 데이터베이스에 유저(`User`)와 매장(`Store`, `StoreDetail`)의 토대를 구축하고, 인증(Spring Security/JWT)과 매장 목록 조회 및 등록 API를 제공합니다.

---

## 2. 작업할 엔티티 및 패키지 구조

* **패키지 위치**: `com.rookies6.MiniProject2.domain.user`, `com.rookies6.MiniProject2.domain.store`

### 1) 담당 Entity 설계 및 생성
1. **`User.java`**: 
   - 필드: `id`, `email` (unique), `password`, `name`, `role` (`CUSTOMER`, `OWNER`, `ADMIN`)
2. **`Store.java`**: 
   - 필드: `id`, `owner` (`User`와 1:1 매핑), `name`, `category`, `address`, `storePhone`, `imageUrl`
3. **`StoreDetail.java`**: 
   - 필드: `storeId` (MapsId PK/FK), `openTime`, `closeTime`, `description`

---

## 3. 구현해야 할 Controller / Service / Repository

### 1) Auth 도메인
* `AuthController.java`:
  * `POST /api/auth/signup`: 회원가입 처리 (비밀번호 `BCryptPasswordEncoder` 암호화)
  * `POST /api/auth/login`: 로그인 검증 후 JWT 토큰 생성 및 반환
* `AuthService.java`: 로그인/회원가입 비즈니스 로직
* `UserRepository.java`: `findByEmail(String email)`

### 2) Store 도메인
* `StoreController.java`:
  * `GET /api/stores`: 메인 홈용 매장 목록 (카테고리 필터링 쿼리 파라미터 지원)
  * `GET /api/stores/{storeId}`: 매장 상세 정보 조회
  * `POST /api/stores`: 사장님의 매장 신규 등록 / 수정 (로그인한 `owner` 정보 매핑)
* `StoreService.java`: 매장 조회 및 등록 로직 (영업시간 `StoreDetail` 함께 저장)
* `StoreRepository.java`: `findAllByCategory(String category)` 등

---

## 4. 파트 B, C를 위한 핵심 기여 (DataInitRunner 더미 데이터)
다른 팀원들이 현준님의 API 완성을 기다리지 않고 개발할 수 있도록, **스프링 부트 기동 시 초기 데이터**를 꼭 넣어주세요!

```java
@Component
public class DataInitRunner implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // 1. 사장님 계정 & 손님 계정 생성
        // 2. 1번 가게 (루키즈 베이커리) 등록! -> 파트 B가 이걸 보고 바로 시작합니다.
    }
}
```

---

## 5. 단계별 체크리스트
- [ ] `User`, `Store`, `StoreDetail` JPA 엔티티 작성
- [ ] Spring Security & JWT 기본 설정 구성
- [ ] 회원가입 및 로그인 API 개발 & Postman 테스트
- [ ] 매장 목록 조회 (`GET /api/stores`) 개발 (카테고리 검색 포함)
- [ ] `DataInitRunner`에 `가게 1번` 더미 데이터 등록하여 파트 B/C 지원
- [ ] 승호님(FE)과 로그인 및 가게 목록 연동 테스트
