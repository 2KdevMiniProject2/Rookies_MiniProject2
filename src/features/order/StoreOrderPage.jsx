/* ---------------------------------------------------------
   주문 페이지 (손님) — 주소 "/stores/:storeId"
   메인에서 [가게 보러가기] 를 누르면 오는 화면입니다.
   가게 정보를 보고 → 메뉴를 담고 → [장바구니 보기] 로 넘어갑니다.

   목표
     ① 목데이터·불러오기   → api/storeOrderApi.js   (백엔드 연결)
     ② 장바구니           → store/cartStore.js     (zustand, 장바구니 페이지와 공유)
     ③ 화면 조각          → components/StoreInfo.jsx · MenuItemCard.jsx · CartBar.jsx
   --------------------------------------------------------- */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "./StoreOrderPage.css";

// 장바구니 보기 버튼이 이동할 주소 — 장바구니 담당과 맞출 것
const CART_PATH = "/cart";

/* =========================================================
   목데이터 — 백엔드 응답과 같은 이름
     GET /api/stores/{storeId}        → StoreResponse
     GET /api/stores/{storeId}/menus  → Page<MenuItemResponse> (content 안에 목록)
   phone · description 은 아직 백엔드에 없음 (있으면 보이고, 없으면 안 보이게 해 둠)
   ========================================================= */
const MOCK_STORE = {
    id: 1,
    name: "루키즈 베이커리",
    address: "서울시 강남구 테헤란로 123 1층",
    category: "베이커리",
    openTime: "09:00:00",
    closeTime: "21:00:00",
    phone: "02-1234-5678",
    description: "매일 아침 직접 굽는 빵과 커피를 판매해요.",
};

const MOCK_MENUS = {
    content: [
        { id: 101, name: "바닐라라떼", price: 5500, soldOut: false, imageUrl: null, description: "달콤한 바닐라 시럽을 넣은 부드러운 라떼" },
        { id: 102, name: "아메리카노", price: 4000, soldOut: false, imageUrl: null, description: "매일 볶은 원두로 내린 기본 커피" },
        { id: 103, name: "소금빵", price: 3500, soldOut: false, imageUrl: null, description: "겉은 바삭, 속은 버터 향 가득" },
        // 품절 화면 확인용으로 true (백엔드 더미는 false)
        { id: 104, name: "크루아상", price: 4500, soldOut: true, imageUrl: null, description: "결이 살아 있는 버터 크루아상" },
        { id: 105, name: "딸기 생크림 케이크", price: 7500, soldOut: false, imageUrl: null, description: "생딸기를 듬뿍 올린 조각 케이크" },
    ],
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 300)); // 서버처럼 잠깐 기다림

async function fetchStore(storeId) {
    await wait();
    return { ...MOCK_STORE, id: Number(storeId) };
}

async function fetchMenus() {
    await wait();
    return MOCK_MENUS.content; // 백엔드는 Page 형식 → content 가 메뉴 배열
}

/* ── 표시용 도우미 ─────────────────────────────────────── */
// 13000 → "13,000원"
const won = (amount) => `${amount.toLocaleString("ko-KR")}원`;
// "09:00:00" → "09:00"
const hhmm = (time) => (time ? time.slice(0, 5) : "--:--");

function StoreOrderPage() {
    const { storeId } = useParams();
    const navigate = useNavigate();

    /* ── 화면 데이터 (useState) ── */
    const [store, setStore] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* =====================================================
       [나중에 분리 필요 → store/cartStore.js]
       장바구니 — 장바구니 페이지와 같이 써야 하므로 나중에 zustand 로 옮긴다
       cartItems: [{ menuItemId, name, price, quantity }]
       ===================================================== */
    const [cartItems, setCartItems] = useState([]);

    function addToCart(menu) {
        setCartItems((prevItems) => {
            const found = prevItems.find((cartItem) => cartItem.menuItemId === menu.id);
            if (found) {
                // 이미 담긴 메뉴면 수량만 1 늘린다
                return prevItems.map((cartItem) =>
                    cartItem.menuItemId === menu.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevItems, { menuItemId: menu.id, name: menu.name, price: menu.price, quantity: 1 }];
        });
    }

    // 담은 개수 · 총 금액은 저장하지 않고 cartItems 에서 계산 (어긋날 일이 없게)
    const totalCount = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    const totalPrice = cartItems.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);

    // 이 메뉴를 몇 개 담았는지 (메뉴 카드에 표시)
    const countInCart = (menuId) =>
        cartItems.find((cartItem) => cartItem.menuItemId === menuId)?.quantity ?? 0;

    /* ── 가게 정보 + 메뉴 불러오기 ── */
    useEffect(() => {
        async function loadPage() {
            setLoading(true);
            setError(null);
            try {
                const [storeData, menuList] = await Promise.all([fetchStore(storeId), fetchMenus(storeId)]);
                setStore(storeData);
                setMenus(menuList);
            } catch (loadError) {
                console.error("Error:", loadError);
                setError(loadError.message ?? "가게 정보를 불러오지 못했어요.");
            } finally {
                setLoading(false);
            }
        }
        loadPage();
    }, [storeId]);

    /* ── 불러오는 중 / 에러 ── */
    if (loading || error || !store) {
        return (
            <div className="store-order">
                <div className="store-order__state">
                    <p className="store-order__state-text">{error ?? "가게 정보를 불러오는 중…"}</p>
                    {error && (
                        <Link to="/" className="store-order__state-button">
                            메인으로 가기
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="store-order">
            <div className="store-order__inner">
                <Link to="/" className="store-order__back">
                    ◀ 메인으로 돌아가기
                </Link>

                {/* =================================================
                    [나중에 분리 필요→ components/StoreInfo.jsx]
                    props: store
                    ================================================= */}
                <section className="store-order__store">
                    <div className="store-order__store-title-row">
                        <h1 className="store-order__store-name">{store.name}</h1>
                        <span className="store-order__category">{store.category}</span>
                    </div>

                    <ul className="store-order__store-info">
                        <li>
                            <span className="store-order__info-label">주소</span>
                            {store.address}
                        </li>
                        {store.phone && (
                            <li>
                                <span className="store-order__info-label">전화</span>
                                {store.phone}
                            </li>
                        )}
                        <li>
                            <span className="store-order__info-label">영업시간</span>
                            {hhmm(store.openTime)} ~ {hhmm(store.closeTime)}
                        </li>
                    </ul>

                    {store.description && <p className="store-order__store-desc">{store.description}</p>}
                </section>

                {/* ── 메뉴 목록 ── */}
                <section className="store-order__menus">
                    <h2 className="store-order__section-title">
                        대표 메뉴 <span className="store-order__menu-count">{menus.length}</span>
                    </h2>

                    {menus.length === 0 ? (
                        <p className="store-order__empty">등록된 메뉴가 없어요.</p>
                    ) : (
                        <ul className="store-order__menu-list">
                            {menus.map((menu) => {
                                const count = countInCart(menu.id);
                                return (
                                    /* =========================================
                                       [나중에 분리 필요→ components/MenuItemCard.jsx]
                                       props: menu, count, onAdd
                                       ========================================= */
                                    <li
                                        key={menu.id}
                                        className={"store-order__menu" + (menu.soldOut ? " is-sold-out" : "")}
                                    >
                                        <div className="store-order__menu-text">
                                            <div className="store-order__menu-name-row">
                                                <h3 className="store-order__menu-name">{menu.name}</h3>
                                                {count > 0 && <span className="store-order__menu-in-cart">{count}개 담음</span>}
                                            </div>
                                            {menu.description && <p className="store-order__menu-desc">{menu.description}</p>}
                                            <p className="store-order__menu-price">{won(menu.price)}</p>
                                        </div>

                                        <div className="store-order__menu-photo">
                                            {menu.imageUrl ? (
                                                <img src={menu.imageUrl} alt={menu.name} />
                                            ) : (
                                                <span className="store-order__menu-placeholder" aria-hidden="true">
                                                    <svg viewBox="0 0 24 24">
                                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                                        <circle cx="9" cy="10" r="1.6" />
                                                        <path d="M21 16l-5-5-8 8" />
                                                    </svg>
                                                </span>
                                            )}
                                            {menu.soldOut && <span className="store-order__sold-out">품절</span>}

                                            <button
                                                type="button"
                                                className="store-order__add"
                                                onClick={() => addToCart(menu)}
                                                disabled={menu.soldOut}
                                                aria-label={`${menu.name} 담기`}
                                            >
                                                + 담기
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            {/* =====================================================
                [나중에 분리 필요→ components/CartBar.jsx]
                props: totalCount, totalPrice, onOpenCart
                화면 아래에 고정되는 장바구니 미리보기 바
                ===================================================== */}
            <div className="store-order__cart-bar">
                <div className="store-order__cart-inner">
                    <p className="store-order__cart-summary">
                        현재 담은 메뉴 <strong>{totalCount}개</strong>
                        <span className="store-order__cart-total">총 {won(totalPrice)}</span>
                    </p>
                    <button
                        type="button"
                        className="store-order__cart-button"
                        onClick={() => navigate(CART_PATH)}
                        disabled={totalCount === 0}
                    >
                        <span className="store-order__cart-badge">{totalCount}</span>
                        장바구니 보기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StoreOrderPage;