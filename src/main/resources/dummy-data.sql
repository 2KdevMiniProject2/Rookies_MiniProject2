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
    CONSTRAINT fk_menu_items_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE,
    CONSTRAINT uk_menu_items_store_name UNIQUE (store_id, name)
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

-- 2.2 가게 목록 (총 5개 매장: 베이커리, 카페, 분식, 일식, 치킨)
INSERT INTO stores (id, owner_id, name, address, category) VALUES
(1, 1, '루키즈 베이커리', '서울시 강남구 테헤란로 123 1층', '베이커리'),
(2, 1, '루키즈 로스터리 카페', '서울시 서초구 서초대로 45 2층', '카페'),
(3, 4, '골목길 분식당', '서울시 마포구 와우산로 88 1층', '분식'),
(4, 4, '하쿠나마타타 돈카츠', '서울시 송파구 올림픽로 300 지하1층', '일식'),
(5, 6, '황금바삭 옛날통닭', '서울시 영등포구 여의대방로 200 1층', '치킨');

-- 2.3 가게 상세 (영업시간 총 5개)
INSERT INTO store_details (id, store_id, open_time, close_time) VALUES
(1, 1, '09:00:00', '21:00:00'),
(2, 2, '08:00:00', '22:00:00'),
(3, 3, '10:30:00', '20:30:00'),
(4, 4, '11:00:00', '21:30:00'),
(5, 5, '15:00:00', '23:59:00');

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
(504, 5, '쫀득 치즈볼 (5개)', 5000, FALSE);

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