/* ---------------------------------------------------------
   주문 페이지 (손님) — 주소 "/stores/:storeId"

     목데이터·불러오기   → api/storeOrderApi.js   (분리 완료 · 백엔드 연결)
     장바구니           → store/cartStore.js     (zustand, 장바구니 페이지와 공유)
     화면 조각          → components/StoreInfo.jsx · MenuItemCard.jsx · CartBar.jsx
   --------------------------------------------------------- */

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { fetchStore, fetchMenus } from "../../api/storeOrderApi";
import { useAuthStore } from "../../store/authStore";

import "./StoreOrderPage.css";

// 장바구니 보기 버튼이 이동할 주소 (CartPage)
const CART_PATH = "/cart";

/* ── 표시용 도우미 ─────────────────────────────────────── */
// 13000 → "13,000원"
const won = (amount) => `${amount.toLocaleString("ko-KR")}원`;
// "09:00:00" → "09:00"
const hhmm = (time) => (time ? time.slice(0, 5) : "--:--");

function StoreOrderPage() {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    // 장바구니는 로그인해야 볼 수 있음 → 로그인 전이면 버튼이 로그인 화면으로 보냄
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    /* ── 화면 데이터 (useState) ── */
    const [store, setStore] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* =====================================================
       [나중에 분리 → store/cartStore.js]
       장바구니 — 장바구니 페이지와 같이 써야 하므로 나중에 zustand 로 옮길 예정
       cartItems: [{ menuItemId, name, price, quantity }]
       장바구니에서 [메뉴 더 담기] 로 돌아오면 location.state 로 담은 메뉴를 다시 받는다
       ===================================================== */
    const [cartItems, setCartItems] = useState(location.state?.cartItems ?? []);

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
                // 두 요청은 서로 기다릴 필요가 없으므로 동시에 보낸다
                const [storeData, menuList] = await Promise.all([fetchStore(storeId), fetchMenus(storeId)]);
                setStore(storeData);
                setMenus(menuList);
            } catch (loadError) {
                console.error("가게 정보 불러오기 실패:", loadError);
                // 서버가 준 문구(예: "존재하지 않는 매장입니다") → 없으면 기본 문구
                setError(loadError.response?.data?.message ?? "가게 정보를 불러오지 못했어요.");
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
                    [나중에 분리 → components/StoreInfo.jsx]
                    props: store
                    ================================================= */}
                <section className={"store-order__store" + (store.imageUrl ? " has-photo" : "")}>
                    <div className="store-order__store-text">
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
                    </div>

                    {/* 가게 사진 — 있을 때만 (사장님이 가게 등록 때 넣은 사진) */}
                    {store.imageUrl && (
                        <img className="store-order__store-photo" src={store.imageUrl} alt={`${store.name} 사진`} />
                    )}
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
                                       [나중에 분리 → components/MenuItemCard.jsx]
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
                [나중에 분리 → components/CartBar.jsx]
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
                        onClick={() =>
                            isAuthenticated
                                ? navigate(CART_PATH, { state: { store, cartItems } })
                                : navigate("/login")
                        }
                        disabled={totalCount === 0}
                    >
                        <span className="store-order__cart-badge">{totalCount}</span>
                        {isAuthenticated ? "장바구니 보기" : "로그인하고 장바구니 보기"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StoreOrderPage;