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

-- 2.1 회원 (1: 사장님, 2: 손님1, 3: 손님2)
INSERT INTO users (id, email, password, name, phone, role) VALUES
(1, 'owner@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '김루키 사장님', '010-1111-2222', 'OWNER'),
(2, 'customer@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '이수강 손님', '010-3333-4444', 'USER'),
(3, 'customer2@rookie.com', '$2a$10$wE99o7zRvhT5wS3tYh6z4.Xv18vF5K.gX8bS5F1Rj1V8b7F4K.X0G', '박영희 손님', '010-5555-6666', 'USER');

-- 2.2 1번 가게 (루키즈 베이커리)
INSERT INTO stores (id, owner_id, name, address, category) VALUES
(1, 1, '루키즈 베이커리', '서울시 강남구 테헤란로 123 1층', '베이커리');

INSERT INTO store_details (id, store_id, open_time, close_time) VALUES
(1, 1, '09:00:00', '21:00:00');

-- 2.3 1번 가게 메뉴 3종 (바닐라라떼, 아메리카노, 소금빵)
INSERT INTO menu_items (id, store_id, name, price, sold_out) VALUES
(101, 1, '바닐라라떼', 5500, FALSE),
(102, 1, '아메리카노', 4000, FALSE),
(103, 1, '소금빵', 3500, FALSE);

-- 2.4 파트 C 독립 개발을 위한 5001번 주문 더미 (PENDING)
INSERT INTO orders (id, user_id, store_id, status, pickup_time, total_price, created_at) VALUES
(5001, 2, 1, 'PENDING', '2026-09-28 15:30:00', 11000, NOW());

INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) VALUES
(1, 5001, 101, 2, 5500); -- 바닐라라떼 2잔 (11,000원)
