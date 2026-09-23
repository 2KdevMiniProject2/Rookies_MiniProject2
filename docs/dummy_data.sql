-- ==========================================================
-- 📦 [루키즈 미니프로젝트 2] DB 테이블 스키마 및 더미 데이터 (DDL + DML)
-- 대상 DB: MariaDB / MySQL (reservation_db)
-- ==========================================================

-- 1. 기존 테이블 초기화 (외래키 제약조건 해제 후 드롭)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS store_details;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 2. DDL: 테이블 생성
-- ==========================================================

-- 2.1 회원 테이블 (users)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 가게 테이블 (stores)
CREATE TABLE stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    address VARCHAR(200) NOT NULL,
    store_phone VARCHAR(20) NULL,
    image_url VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3 가게 상세 테이블 (store_details)
CREATE TABLE store_details (
    store_id BIGINT PRIMARY KEY,
    open_time TIME NOT NULL DEFAULT '09:00:00',
    close_time TIME NOT NULL DEFAULT '21:00:00',
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_details_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.4 메뉴 테이블 (menu_items)
CREATE TABLE menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL DEFAULT 0,
    is_sold_out BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.5 주문 마스터 테이블 (orders)
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount INT NOT NULL DEFAULT 0,
    pickup_time TIME NOT NULL,
    request_notes VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users (id),
    CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.6 주문 상세 품목 테이블 (order_items)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    order_price INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- 3. DML: 초기 더미 데이터 삽입 (치트키)
-- ==========================================================

-- 3.1 회원 데이터 (비밀번호: password123 / BCrypt 해시 예시)
INSERT INTO users (id, email, password, name, role) VALUES
(1, 'owner@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '김루키 사장님', 'OWNER'),
(2, 'customer@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '이수강 손님', 'CUSTOMER'),
(3, 'customer2@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '박영희 손님', 'CUSTOMER');

-- 3.2 가게 데이터 (1번: 루키즈 베이커리)
INSERT INTO stores (id, owner_id, name, category, address, store_phone, image_url) VALUES
(1, 1, '루키즈 베이커리 & 카페', '베이커리', '서울시 강남구 테헤란로 123 1층', '02-555-1234', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80');

INSERT INTO store_details (store_id, open_time, close_time, description) VALUES
(1, '08:30:00', '21:00:00', '매일 아침 갓 구워내는 천연 발효종 소금빵과 스페셜티 커피 전문점입니다.');

-- 3.3 메뉴 데이터 (1번 매장의 메뉴 5개)
INSERT INTO menu_items (id, store_id, name, price, is_sold_out, image_url) VALUES
(101, 1, '시그니처 바닐라빈 라떼', 5500, FALSE, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=300&q=80'),
(102, 1, '아메리카노 (고소한 원두)', 4000, FALSE, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80'),
(103, 1, '프랑스 고메버터 소금빵', 3500, FALSE, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80'),
(104, 1, '무화과 크림치즈 휘낭시에', 3200, FALSE, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=300&q=80'),
(105, 1, '생딸기 생크림 케이크 조각', 7500, TRUE, 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=300&q=80');

-- 3.4 주문 데이터 (5001: PENDING, 5002: ACCEPTED, 5003: COMPLETED)
-- 파트 C 독립 개발을 위한 5001번 주문
INSERT INTO orders (id, customer_id, store_id, status, total_amount, pickup_time, request_notes, created_at) VALUES
(5001, 2, 1, 'PENDING', 11000, '15:30:00', '얼음 많이 넣어주시고 바닐라라떼 덜 달게 해주세요!', NOW()),
(5002, 3, 1, 'ACCEPTED', 11000, '15:40:00', '소금빵 따뜻하게 데워주시면 감사하겠습니다.', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(5003, 2, 1, 'COMPLETED', 7200, '15:00:00', '선물용 포장 부탁드려요.', DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- 3.5 주문 상세 데이터
INSERT INTO order_items (id, order_id, menu_item_id, quantity, order_price) VALUES
(1, 5001, 101, 2, 5500), -- 5001번: 바닐라라떼 2잔 (11,000원)
(2, 5002, 102, 1, 4000), -- 5002번: 아메리카노 1잔
(3, 5002, 103, 2, 3500), -- 5002번: 소금빵 2개
(4, 5003, 102, 1, 4000), -- 5003번: 아메리카노 1잔
(5, 5003, 104, 1, 3200); -- 5003번: 휘낭시에 1개
