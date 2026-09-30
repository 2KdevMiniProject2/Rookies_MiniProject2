-- ==========================================================
-- 📦 [루키즈 미니프로젝트 2] 팀 최종 확정 ERD 기반 DB 스키마 및 더미 데이터 (DDL + DML)
-- 대상 DB: MariaDB / MySQL (reservation_db)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS store_details;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 1. DDL: 테이블 생성 (최종 확정 ERD 6개 테이블)
-- ==========================================================

-- 1.1 회원 테이블 (users)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2 가게 테이블 (stores)
CREATE TABLE stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(500) NULL,
    deleted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3 가게 상세 테이블 (store_details)
CREATE TABLE store_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL UNIQUE,
    open_time TIME NULL,
    close_time TIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_details_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.4 메뉴 테이블 (menu_items)
CREATE TABLE menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL DEFAULT 0,
    sold_out BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(500) NULL,
    deleted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.5 주문 테이블 (orders)
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    pickup_time DATETIME NOT NULL,
    request_notes VARCHAR(255) NULL,
    total_price INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.6 주문 상세 품목 테이블 (order_items)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- 2. DML: 초기 더미 데이터 삽입 (치트키)
-- ==========================================================

-- 2.1 회원 (총 6명: 사장님 3명, 손님 3명 / 비밀번호는 모두 1234)
INSERT INTO users (id, email, password, name, phone, role) VALUES
(1, 'owner@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '김루키 사장님', '010-1111-2222', 'OWNER'),
(2, 'customer@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '이수강 손님', '010-3333-4444', 'USER'),
(3, 'customer2@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '박영희 손님', '010-5555-6666', 'USER'),
(4, 'owner2@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '최사장 사장님', '010-7777-8888', 'OWNER'),
(5, 'customer3@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '정민우 손님', '010-9999-0000', 'USER'),
(6, 'owner3@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '강대표 사장님', '010-2222-3333', 'OWNER');

-- 2.2 가게 목록 (총 30개 매장: 페이징 테스트 지원 및 고화질 이미지 URL 포함)
INSERT INTO stores (id, owner_id, name, address, category, image_url) VALUES
(1,  1, '루키즈 베이커리',       '서울시 강남구 테헤란로 123 1층',     '베이커리', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'),
(2,  1, '루키즈 로스터리 카페',   '서울시 서초구 서초대로 45 2층',       '카페',     'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80'),
(3,  4, '골목길 분식당',         '서울시 마포구 와우산로 88 1층',       '분식',     'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80'),
(4,  4, '하쿠나마타타 돈카츠',   '서울시 송파구 올림픽로 300 지하1층',   '일식',     'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80'),
(5,  6, '황금바삭 옛날통닭',     '서울시 영등포구 여의대방로 200 1층',   '치킨',     'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80'),
(6,  1, '달콤한 크루아상팩토리', '서울시 성동구 연무장길 15 1층',       '베이커리', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80'),
(7,  1, '블루문 스페셜티 커피',   '서울시 마포구 양화로 45 1층',         '카페',     'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80'),
(8,  4, '할머니 가래떡볶이',     '서울시 종로구 대학로 102 1층',       '분식',     'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'),
(9,  4, '도쿄 스시야 본점',       '서울시 강남구 압구정로 180 2층',     '일식',     'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&auto=format&fit=crop&q=80'),
(10, 6, '치맥라이프 강남점',     '서울시 서초구 강남대로 380 1층',     '치킨',     'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80'),
(11, 1, '파리지앵 바게트 공방',   '서울시 용산구 이태원로 220 1층',     '베이커리', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80'),
(12, 1, '선셋 드립 바',           '서울시 마포구 독막로 60 3층',         '카페',     'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'),
(13, 4, '청년김밥 왕만두',       '서울시 관악구 신림로 90 1층',         '분식',     'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'),
(14, 4, '멘야하나비 라멘공방',   '서울시 송파구 백제고분로 45 1층',     '일식',     'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'),
(15, 6, '숯불향 가득 바비큐치킨', '서울시 광진구 아차산로 150 1층',     '치킨',     'https://images.unsplash.com/photo-1527477378378-0c670a595304?w=600&auto=format&fit=crop&q=80'),
(16, 1, '성수 베이글 하우스',     '서울시 성동구 아차산로 70 1층',       '베이커리', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=80'),
(17, 1, '그린티 포레스트 카페',   '서울시 종로구 인사동길 33 2층',       '카페',     'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'),
(18, 4, '빨간맛 떡순튀 전문점',   '서울시 구로구 디지털로 288 지하1층', '분식',     'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'),
(19, 4, '우사기 수제 가츠동',     '서울시 마포구 망원로 75 1층',         '일식',     'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&auto=format&fit=crop&q=80'),
(20, 6, '단짠 간장치킨 마당',     '서울시 중랑구 면목로 120 1층',       '치킨',     'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80'),
(21, 1, '소금빵 명가 몽블랑',     '서울시 서초구 방배로 110 1층',       '베이커리', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'),
(22, 1, '모닝 브루 커피하우스',   '서울시 강남구 논현로 210 1층',       '카페',     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'),
(23, 4, '추억의 컵떡볶이네',     '서울시 노원구 동일로 1350 1층',       '분식',     'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop&q=80'),
(24, 4, '사쿠라 생라멘 본가',     '서울시 동작구 노량진로 100 2층',     '일식',     'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80'),
(25, 6, '오븐에 빠진 크리스피닭', '서울시 은평구 통일로 720 1층',       '치킨',     'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80'),
(26, 1, '뺑드미 프리미엄 식빵',   '서울시 양천구 목동동로 250 1층',     '베이커리', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80'),
(27, 1, '아늑한 다락방 북카페',   '서울시 서대문구 연희로 18 2층',       '카페',     'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80'),
(28, 4, '얼큰 즉석떡볶이 뷔페',   '서울시 중구 을지로 100 지하1층',     '분식',     'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'),
(29, 4, '오사카 골목 텐동',       '서울시 영등포구 국제금융로 10 3층',   '일식',     'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80'),
(30, 6, '파닭파닭 파닭천국',     '서울시 강동구 천호대로 1050 1층',     '치킨',     'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80');

-- 2.3 가게 상세 (영업시간 총 30개 매장 매핑)
INSERT INTO store_details (id, store_id, open_time, close_time) VALUES
(1,  1,  '09:00:00', '21:00:00'),
(2,  2,  '08:00:00', '22:00:00'),
(3,  3,  '10:30:00', '20:30:00'),
(4,  4,  '11:00:00', '21:30:00'),
(5,  5,  '15:00:00', '23:59:00'),
(6,  6,  '08:30:00', '21:00:00'),
(7,  7,  '09:00:00', '22:00:00'),
(8,  8,  '11:00:00', '21:00:00'),
(9,  9,  '11:30:00', '22:00:00'),
(10, 10, '16:00:00', '01:00:00'),
(11, 11, '08:00:00', '20:00:00'),
(12, 12, '10:00:00', '23:00:00'),
(13, 13, '09:30:00', '21:00:00'),
(14, 14, '11:00:00', '21:30:00'),
(15, 15, '15:00:00', '24:00:00'),
(16, 16, '08:30:00', '20:30:00'),
(17, 17, '10:00:00', '22:00:00'),
(18, 18, '11:00:00', '21:00:00'),
(19, 19, '11:30:00', '21:30:00'),
(20, 20, '16:00:00', '02:00:00'),
(21, 21, '09:00:00', '21:00:00'),
(22, 22, '07:30:00', '21:30:00'),
(23, 23, '10:30:00', '20:30:00'),
(24, 24, '11:00:00', '22:00:00'),
(25, 25, '15:30:00', '01:00:00'),
(26, 26, '08:00:00', '20:00:00'),
(27, 27, '10:00:00', '23:00:00'),
(28, 28, '11:00:00', '22:00:00'),
(29, 29, '11:30:00', '21:30:00'),
(30, 30, '15:00:00', '01:30:00');

-- 2.4 메뉴 목록 (총 21개 메뉴)
-- 1번 가게 (루키즈 베이커리)
INSERT INTO menu_items (id, store_id, name, price, sold_out) VALUES
(101, 1, '바닐라라떼', 5500, FALSE),
(102, 1, '아메리카노', 4000, FALSE),
(103, 1, '소금빵', 3500, FALSE),
(104, 1, '크루아상', 4500, FALSE),
(105, 1, '딸기 생크림 케이크', 7500, FALSE),

-- 2번 가게 (루키즈 로스터리 카페)
(201, 2, '시그니처 아인슈페너', 6000, FALSE),
(202, 2, '디카페인 콜드브루', 5000, FALSE),
(203, 2, '제주 말차 라떼', 6000, FALSE),
(204, 2, '클래식 버터 스콘', 3800, FALSE),

-- 3번 가게 (골목길 분식당)
(301, 3, '매콤 쌀떡볶이', 4500, FALSE),
(302, 3, '수제 모둠 튀김', 5000, FALSE),
(303, 3, '찰순대', 4500, FALSE),
(304, 3, '참치 마요 김밥', 4500, FALSE),

-- 4번 가게 (하쿠나마타타 돈카츠)
(401, 4, '특 로스카츠 정식', 13000, FALSE),
(402, 4, '히레카츠 정식', 14000, FALSE),
(403, 4, '치즈카츠 (4P)', 13500, FALSE),
(404, 4, '살얼음 냉모밀', 8500, FALSE),

-- 5번 가게 (황금바삭 옛날통닭)
(501, 5, '황금 후라이드 치킨', 18000, FALSE),
(502, 5, '달콤 양념 치킨', 19000, FALSE),
(503, 5, '단짠 간장 치킨', 19500, FALSE),
(504, 5, '쫀득 치즈볼 (5개)', 5000, FALSE),

-- 6~30번 매장 대표 메뉴 (각 매장별 2개씩 총 50개 메뉴 추가)
(601, 6, '아몬드 크루아상', 4800, FALSE),
(602, 6, '초코 뺑오쇼콜라', 4600, FALSE),
(701, 7, '에티오피아 드립커피', 5500, FALSE),
(702, 7, '플랫화이트', 5000, FALSE),
(801, 8, '옛날 가래떡볶이', 4500, FALSE),
(802, 8, '부산어묵 꼬치(3개)', 3500, FALSE),
(901, 9, '특선 모둠초밥 12P', 18000, FALSE),
(902, 9, '생연어 사케동', 14000, FALSE),
(1001, 10, '허니버터 순살치킨', 19000, FALSE),
(1002, 10, '크림 생맥주 500cc', 4500, FALSE),
(1101, 11, '정통 프랑스 바게트', 4000, FALSE),
(1102, 11, '잠봉뵈르 샌드위치', 8500, FALSE),
(1201, 12, '선셋 시그니처 라떼', 6000, FALSE),
(1202, 12, '수제 바스크 치즈케이크', 6500, FALSE),
(1301, 13, '청년 고기왕만두', 6000, FALSE),
(1302, 13, '묵은지 참치김밥', 4800, FALSE),
(1401, 14, '진한 돈코츠라멘', 10000, FALSE),
(1402, 14, '매콤 카라구치 라멘', 10500, FALSE),
(1501, 15, '숯불 바비큐치킨', 20000, FALSE),
(1502, 15, '치즈양념 감자튀김', 6000, FALSE),
(1601, 16, '플레인 베이글 & 크림치즈', 4500, FALSE),
(1602, 16, '대파 크림치즈 베이글', 5800, FALSE),
(1701, 17, '숲속 말차 플로트', 6500, FALSE),
(1702, 17, '유기농 캐모마일 티', 4500, FALSE),
(1801, 18, '국물 떡볶이', 4000, FALSE),
(1802, 18, '바삭 모둠 튀김', 5000, FALSE),
(1901, 19, '도톰 수제 가츠동', 10500, FALSE),
(1902, 19, '왕새우 에비동', 11500, FALSE),
(2001, 20, '마늘간장 윙봉세트', 21000, FALSE),
(2002, 20, '달콤 꿀고구마맛탕', 5000, FALSE),
(2101, 21, '트러플 소금빵', 4200, FALSE),
(2102, 21, '밤 몽블랑 페이스트리', 6800, FALSE),
(2201, 22, '모닝 아메리카노', 3500, FALSE),
(2202, 22, '잉글리시 블랙퍼스트 티', 4500, FALSE),
(2301, 23, '추억의 컵떡볶이', 3000, FALSE),
(2302, 23, '수제 야채튀김 (3개)', 3000, FALSE),
(2401, 24, '도쿄 쇼유라멘', 9500, FALSE),
(2402, 24, '특제 차슈 볶음밥', 8500, FALSE),
(2501, 25, '오븐 크리스피 베이크치킨', 18500, FALSE),
(2502, 25, '양파 크리미 순살', 20000, FALSE),
(2601, 26, '탕종 쫄깃 생식빵', 5500, FALSE),
(2602, 26, '통팥 가득 앙금빵', 2800, FALSE),
(2701, 27, '다락방 핸드드립 블렌드', 5000, FALSE),
(2702, 27, '로얄 얼그레이 밀크티', 5500, FALSE),
(2801, 28, '2인 즉석떡볶이 세트', 14000, FALSE),
(2802, 28, '날치알 볶음밥', 3500, FALSE),
(2901, 29, '바삭 에비 텐동', 11000, FALSE),
(2902, 29, '스페셜 모둠 텐동', 14500, FALSE),
(3001, 30, '원조 알싸한 파닭', 19500, FALSE),
(3002, 30, '핫양념 순살치킨', 19000, FALSE);

-- 2.5 주문 목록 (총 13건: 1번 매장 중심 상태별 [대기/준비/호출/완료/거절] 골고루 구성)
INSERT INTO orders (id, user_id, store_id, status, pickup_time, request_notes, total_price, created_at) VALUES
-- [1번 루키즈 베이커리] 대기 (PENDING)
(5001, 2, 1, 'PENDING',   '2026-09-29 15:30:00', '포장 꼼꼼히 부탁드립니다.', 13000, NOW()),
(5002, 3, 1, 'PENDING',   '2026-09-29 16:00:00', '케이크 초 2개 부탁드려요.', 12000, NOW()),
-- [1번 루키즈 베이커리] 준비중 (ACCEPTED)
(5003, 5, 1, 'ACCEPTED',  '2026-09-29 14:30:00', '얼음 적게 넣어주세요.', 8000, NOW()),
(5004, 2, 1, 'ACCEPTED',  '2026-09-29 14:50:00', '소금빵 따로 포장 부탁드려요.', 10500, NOW()),
-- [1번 루키즈 베이커리] 호출 (READY)
(5005, 3, 1, 'READY',     '2026-09-29 14:00:00', '빨대는 빼주세요.', 9500, NOW()),
(5006, 5, 1, 'READY',     '2026-09-29 14:10:00', '케이크 보냉팩 부탁드려요.', 16500, NOW()),
-- [1번 루키즈 베이커리] 완료 (COMPLETED) - 5008번은 어제 주문 (오늘 매출 제외 확인용)
(5007, 2, 1, 'COMPLETED', '2026-09-29 12:00:00', '크루아상 따뜻하게 데워주세요.', 14500, NOW()),
(5008, 3, 1, 'COMPLETED', '2026-09-28 18:00:00', '종이봉투에 담아주세요.', 7000, DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- [1번 루키즈 베이커리] 거절 (REJECTED)
(5009, 5, 1, 'REJECTED',  '2026-09-29 13:00:00', '케이크 문구 넣어주실 수 있나요?', 7500, NOW()),
-- [2~5번 매장] 매장별 1건씩
(5010, 3, 2, 'ACCEPTED',  '2026-09-29 16:00:00', '얼음 조금만 넣어주세요.', 12000, NOW()),
(5011, 5, 3, 'READY',     '2026-09-29 12:40:00', '단무지 많이 챙겨주세요!', 14000, NOW()),
(5012, 2, 4, 'COMPLETED', '2026-09-29 12:00:00', '돈카츠 소스 하나 더 부탁해요.', 27000, NOW()),
(5013, 3, 5, 'REJECTED',  '2026-09-29 21:00:00', '콜라 큰 걸로 교환 가능한가요?', 23000, NOW());

-- 2.6 주문 상세 품목 (order_items)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) VALUES
-- 5001번 주문 품목 (13,000원 / 대기)
(1, 5001, 101, 1, 5500),  -- 바닐라라떼 1잔 (5,500원)
(2, 5001, 102, 1, 4000),  -- 아메리카노 1잔 (4,000원)
(3, 5001, 103, 1, 3500),  -- 소금빵 1개 (3,500원)

-- 5002번 주문 품목 (12,000원 / 대기)
(4, 5002, 105, 1, 7500),  -- 딸기 생크림 케이크 1조각 (7,500원)
(5, 5002, 104, 1, 4500),  -- 크루아상 1개 (4,500원)

-- 5003번 주문 품목 (8,000원 / 준비중)
(6, 5003, 102, 2, 4000),  -- 아메리카노 2잔 (8,000원)

-- 5004번 주문 품목 (10,500원 / 준비중)
(7, 5004, 103, 3, 3500),  -- 소금빵 3개 (10,500원)

-- 5005번 주문 품목 (9,500원 / 호출)
(8, 5005, 101, 1, 5500),  -- 바닐라라떼 1잔 (5,500원)
(9, 5005, 102, 1, 4000),  -- 아메리카노 1잔 (4,000원)

-- 5006번 주문 품목 (16,500원 / 호출)
(10, 5006, 105, 1, 7500), -- 딸기 생크림 케이크 1조각 (7,500원)
(11, 5006, 101, 1, 5500), -- 바닐라라떼 1잔 (5,500원)
(12, 5006, 103, 1, 3500), -- 소금빵 1개 (3,500원)

-- 5007번 주문 품목 (14,500원 / 완료)
(13, 5007, 104, 2, 4500), -- 크루아상 2개 (9,000원)
(14, 5007, 101, 1, 5500), -- 바닐라라떼 1잔 (5,500원)

-- 5008번 주문 품목 (7,000원 / 완료, 어제)
(15, 5008, 103, 2, 3500), -- 소금빵 2개 (7,000원)

-- 5009번 주문 품목 (7,500원 / 거절)
(16, 5009, 105, 1, 7500), -- 딸기 생크림 케이크 1조각 (7,500원)

-- 5010번 주문 품목 (12,000원 / 카페)
(17, 5010, 201, 2, 6000), -- 시그니처 아인슈페너 2잔 (12,000원)

-- 5011번 주문 품목 (14,000원 / 분식)
(18, 5011, 301, 1, 4500), -- 매콤 쌀떡볶이 1인분 (4,500원)
(19, 5011, 302, 1, 5000), -- 수제 모둠 튀김 1인분 (5,000원)
(20, 5011, 303, 1, 4500), -- 찰순대 1인분 (4,500원)

-- 5012번 주문 품목 (27,000원 / 일식)
(21, 5012, 401, 1, 13000), -- 특 로스카츠 정식 1개 (13,000원)
(22, 5012, 402, 1, 14000), -- 히레카츠 정식 1개 (14,000원)

-- 5013번 주문 품목 (23,000원 / 치킨)
(23, 5013, 501, 1, 18000), -- 황금 후라이드 치킨 1마리 (18,000원)
(24, 5013, 504, 1, 5000);  -- 쫀득 치즈볼 1세트 (5,000원)