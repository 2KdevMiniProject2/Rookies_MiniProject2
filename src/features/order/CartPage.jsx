/* ---------------------------------------------------------
   장바구니 페이지 (손님) — 주소 "/cart"
   주문 페이지에서 [장바구니 보기] 를 누르면 오는 화면입니다.

     ① 주문 보내기        → api/cartApi.js
     ② 장바구니 데이터     → store/cartStore.js   (지금은 주문 페이지에서 location.state 로 받음)
     ③ 화면 조각          → components/CartItemRow.jsx · PickupTimePicker.jsx

   사용하는 백엔드 API
     POST /api/orders?customerId=
       body { storeId, items: [{ menuItemId, quantity }], pickupTime, requestNotes }
       → 201 OrderResponse { orderId, status, totalAmount, pickupTime, items }
   --------------------------------------------------------- */

import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import apiClient from "../../api/client";

import "./CartPage.css";

// 로그인 연결 전 임시 손님 번호 (더미데이터 2번 = 이수강 손님)
// TODO: 병합 후 useAuthStore 의 user.id 로 교체
const TEMP_CUSTOMER_ID = 2;

const PICKUP_STEP_MINUTES = 10;   // 픽업 시간 간격
const PICKUP_READY_MINUTES = 15;  // 지금부터 최소 준비 시간
const PICKUP_SLOT_COUNT = 8;      // 보여줄 시간 칸 수
const NOTES_MAX_LENGTH = 255;     // DB request_notes VARCHAR(255)

/* ── 표시용 도우미 ─────────────────────────────────────── */
const won = (amount) => `${amount.toLocaleString("ko-KR")}원`;
const pad = (number) => String(number).padStart(2, "0");
// Date → "15:30"
const toClock = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
// Date → "2026-10-01T15:30:00" (서버 LocalDateTime 형식, 한국 시간 그대로)
// ※ toISOString() 은 UTC 로 바뀌어 9시간 어긋나므로 쓰지 않는다
const toLocalDateTime = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${toClock(date)}:00`;

// "21:00:00" → 오늘 21:00 Date (없으면 null)
const todayAt = (timeText) => {
    if (!timeText) return null;
    const [hours, minutes] = timeText.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

/* 픽업 가능한 시간 칸 만들기
   지금 + 15분 이후, 10분 단위로 올림, 영업 시간 안에서 최대 8칸 */
function makePickupSlots(openTime, closeTime) {
    const earliest = new Date(Date.now() + PICKUP_READY_MINUTES * 60 * 1000);
    const roundedMinutes = Math.ceil(earliest.getMinutes() / PICKUP_STEP_MINUTES) * PICKUP_STEP_MINUTES;
    earliest.setMinutes(roundedMinutes, 0, 0);

    const opening = todayAt(openTime);
    const closing = todayAt(closeTime);
    let slotTime = opening && earliest < opening ? opening : earliest;

    const slots = [];
    while (slots.length < PICKUP_SLOT_COUNT) {
        if (closing && slotTime > closing) break;
        if (slotTime.getDate() !== new Date().getDate()) break; // 오늘 안에서만
        slots.push(new Date(slotTime));
        slotTime = new Date(slotTime.getTime() + PICKUP_STEP_MINUTES * 60 * 1000);
    }
    return slots;
}

function CartPage() {
    const location = useLocation();
    const navigate = useNavigate();

    /* =====================================================
       [나중에 분리 → store/cartStore.js]
       주문 페이지가 navigate("/cart", { state: { store, cartItems } }) 로 넘겨준 값
       새로고침하면 사라짐 → cartStore(zustand) 로 옮기면 해결
       ===================================================== */
    const store = location.state?.store ?? null;
    const [cartItems, setCartItems] = useState(location.state?.cartItems ?? []);

    const [pickupSlot, setPickupSlot] = useState(null); // 고른 픽업 시간 (Date)
    const [requestNotes, setRequestNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 픽업 시간 칸은 처음 한 번만 계산 (다시 그릴 때마다 시간이 바뀌지 않게)
    const pickupSlots = useMemo(
        () => (store ? makePickupSlots(store.openTime, store.closeTime) : []),
        [store]
    );

    const totalCount = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    const totalPrice = cartItems.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);

    /* ── 수량 · 삭제 ── */
    function changeQuantity(menuItemId, amount) {
        setCartItems((prevItems) =>
            prevItems
                .map((cartItem) =>
                    cartItem.menuItemId === menuItemId
                        ? { ...cartItem, quantity: cartItem.quantity + amount }
                        : cartItem
                )
                .filter((cartItem) => cartItem.quantity > 0) // 0개가 되면 빼기
        );
    }

    function removeItem(menuItemId) {
        setCartItems((prevItems) => prevItems.filter((cartItem) => cartItem.menuItemId !== menuItemId));
    }

    // 메뉴 더 담기: 지금 장바구니를 들고 주문 페이지로 돌아간다
    function goBackToMenus() {
        navigate(`/stores/${store.id}`, { state: { cartItems } });
    }

    /* =====================================================
       [나중에 분리 → api/cartApi.js]
       주문 보내기 — POST /api/orders
       ===================================================== */
    async function handleSubmit() {
        if (!pickupSlot) {
            setError("픽업 시간을 골라주세요.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const response = await apiClient.post(
                "/api/orders",
                {
                    storeId: store.id,
                    items: cartItems.map((cartItem) => ({
                        menuItemId: cartItem.menuItemId,
                        quantity: cartItem.quantity,
                    })),
                    pickupTime: toLocalDateTime(pickupSlot),
                    requestNotes: requestNotes.trim() || null,
                },
                { params: { customerId: TEMP_CUSTOMER_ID } }
            );
            // 주문 성공 → 주문 상태 페이지로 (뒤로가기로 장바구니에 다시 오지 않게 replace)
            navigate(`/orders/${response.data.orderId}`, { replace: true });
        } catch (submitError) {
            console.error("주문 실패:", submitError);
            // 서버 문구 예) "품절된 메뉴가 포함되어 있습니다: 크루아상"
            setError(submitError.response?.data?.message ?? "주문을 보내지 못했어요. 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
    }

    /* ── 빈 장바구니 ── */
    if (!store || cartItems.length === 0) {
        return (
            <div className="cart">
                <div className="cart__state">
                    <p className="cart__state-text">장바구니가 비어 있어요.</p>
                    {store ? (
                        <button type="button" className="cart__state-button" onClick={goBackToMenus}>
                            메뉴 보러 가기
                        </button>
                    ) : (
                        <Link to="/" className="cart__state-button">
                            가게 둘러보기
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="cart">
            <div className="cart__inner">
                <button type="button" className="cart__back" onClick={goBackToMenus}>
                    ◀ 메뉴 더 담기
                </button>

                <header className="cart__head">
                    <h1 className="cart__title">장바구니</h1>
                    <p className="cart__store">{store.name}</p>
                </header>

                <div className="cart__layout">
                    <div className="cart__main">
                        {/* ── 담은 메뉴 ── */}
                        <section className="cart__section">
                            <h2 className="cart__section-title">
                                담은 메뉴 <span className="cart__count">{totalCount}</span>
                            </h2>
                            <ul className="cart__list">
                                {cartItems.map((cartItem) => (
                                    /* =========================================
                                       [나중에 분리 → components/CartItemRow.jsx]
                                       props: cartItem, onChangeQuantity, onRemove
                                       ========================================= */
                                    <li key={cartItem.menuItemId} className="cart__item">
                                        <div className="cart__item-text">
                                            <p className="cart__item-name">{cartItem.name}</p>
                                            <p className="cart__item-unit">{won(cartItem.price)}</p>
                                        </div>

                                        <div className="cart__stepper" aria-label={`${cartItem.name} 수량`}>
                                            <button
                                                type="button"
                                                onClick={() => changeQuantity(cartItem.menuItemId, -1)}
                                                aria-label="한 개 빼기"
                                            >
                                                −
                                            </button>
                                            <span className="cart__quantity">{cartItem.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => changeQuantity(cartItem.menuItemId, 1)}
                                                aria-label="한 개 더하기"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="cart__item-price">{won(cartItem.price * cartItem.quantity)}</p>

                                        <button
                                            type="button"
                                            className="cart__remove"
                                            onClick={() => removeItem(cartItem.menuItemId)}
                                            aria-label={`${cartItem.name} 빼기`}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* =========================================
                            [나중에 분리 → components/PickupTimePicker.jsx]
                            props: slots, value, onChange
                            ========================================= */}
                        <section className="cart__section">
                            <h2 className="cart__section-title">픽업 시간</h2>
                            {pickupSlots.length === 0 ? (
                                <p className="cart__empty">오늘은 더 이상 픽업 가능한 시간이 없어요.</p>
                            ) : (
                                <div className="cart__slots" role="radiogroup" aria-label="픽업 시간">
                                    {pickupSlots.map((slot) => {
                                        const selected = pickupSlot?.getTime() === slot.getTime();
                                        return (
                                            <button
                                                key={slot.getTime()}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                className={"cart__slot" + (selected ? " is-selected" : "")}
                                                onClick={() => setPickupSlot(slot)}
                                            >
                                                {toClock(slot)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* ── 요청사항 ── */}
                        <section className="cart__section">
                            <h2 className="cart__section-title">
                                <label htmlFor="cart-notes">요청사항</label>
                                <span className="cart__optional">선택</span>
                            </h2>
                            <textarea
                                id="cart-notes"
                                className="cart__notes"
                                rows={3}
                                maxLength={NOTES_MAX_LENGTH}
                                placeholder="예) 포크 2개 넣어주세요"
                                value={requestNotes}
                                onChange={(event) => setRequestNotes(event.target.value)}
                            />
                            <p className="cart__notes-count">
                                {requestNotes.length} / {NOTES_MAX_LENGTH}
                            </p>
                        </section>
                    </div>

                    {/* ── 주문 요약 (웹: 오른쪽 고정 · 폰: 아래) ── */}
                    <aside className="cart__summary">
                        <h2 className="cart__section-title">주문 금액</h2>
                        <dl className="cart__summary-list">
                            <div>
                                <dt>메뉴 {totalCount}개</dt>
                                <dd>{won(totalPrice)}</dd>
                            </div>
                            <div>
                                <dt>픽업 시간</dt>
                                <dd>{pickupSlot ? `오늘 ${toClock(pickupSlot)}` : "선택 전"}</dd>
                            </div>
                        </dl>
                        <p className="cart__summary-total">
                            <span>총 주문 금액</span>
                            <strong>{won(totalPrice)}</strong>
                        </p>

                        {error && (
                            <p className="cart__error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="button"
                            className="cart__submit"
                            onClick={handleSubmit}
                            disabled={submitting || pickupSlots.length === 0}
                        >
                            {submitting ? "주문 보내는 중…" : `${won(totalPrice)} 주문하기`}
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default CartPage;