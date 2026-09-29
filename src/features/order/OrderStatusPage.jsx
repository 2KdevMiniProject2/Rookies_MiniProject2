import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOrder } from "../../api/orderApi";

import "./OrderStatusPage.css";

// 자동 새로고침 간격(ms)
const REFRESH_MS = 5000;

// 진행 단계 이름
const STEPS = ["접수 대기", "조리 중", "픽업 대기", "픽업 완료"];

// 상태별 단계 번호 / 제목 / 안내 문구
const STATUS_INFO = {
    PENDING: {
        step: 0,
        title: "주문이 정상적으로 접수되었습니다!",
        message: "사장님이 주문을 확인하고 있어요. 잠시만 기다려 주세요.",
    },
    ACCEPTED: {
        step: 1,
        title: "주문이 정상적으로 접수되었습니다!",
        message: "사장님이 주문을 수락하여 맛있게 준비 중입니다!",
    },
    READY: {
        step: 2,
        title: "음식이 준비되었습니다!",
        message: "매장에 방문해서 픽업해 주세요.",
    },
    COMPLETED: {
        step: 3,
        title: "픽업이 완료되었습니다",
        message: "이용해 주셔서 감사합니다. 맛있게 드세요!",
    },
    REJECTED: {
        step: -1,
        title: "주문이 거절되었습니다",
        message: "가게 사정으로 주문을 받을 수 없어요. 다른 메뉴나 시간으로 다시 주문해 주세요.",
    },
};

// "2026-09-29T15:30:00" → "15:30"
function formatTime(dateTime) {
    return dateTime.split("T")[1].slice(0, 5);
}

function OrderStatusPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // 처음 한 번 + 5초마다 다시 불러오기
    useEffect(() => {
        const loadOrder = async () => {
            const result = await fetchOrder(orderId);
            setOrder(result);
        };

        loadOrder();
        const timer = setInterval(loadOrder, REFRESH_MS);

        // 화면을 떠나면 타이머 멈춤
        return () => clearInterval(timer);
    }, [orderId]);

    // 새로고침 버튼
    async function handleRefresh() {
        setRefreshing(true);
        const result = await fetchOrder(orderId);
        setOrder(result);
        setRefreshing(false);
    }

    if (!order) {
        return (
            <div className="order-status">
                <div className="order-status__card order-status__card--center">
                    <p className="order-status__notice">주문 정보를 불러오는 중…</p>
                </div>
            </div>
        );
    }

    const info = STATUS_INFO[order.status];
    const isRejected = order.status === "REJECTED";
    const pickupText = `오늘 ${formatTime(order.pickupTime)}`;
    const fillPercent = (info.step / (STEPS.length - 1)) * 100;

    return (
        <div className="order-status">
            <div className="order-status__card">
                {/* 윗부분: 제목 + 주문번호 */}
                <div className="order-status__top">
                    <span className="order-status__store">{order.storeName}</span>
                    <div className="order-status__title-row">
                        <span className="order-status__icon">{isRejected ? "!" : "✓"}</span>
                        <h2 className="order-status__title">{info.title}</h2>
                        <span className="order-status__order-no">#{order.id}</span>
                    </div>
                </div>

                {/* 픽업 시간 */}
                <div className="order-status__pickup">
                    <span className="order-status__pickup-icon">
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
                             stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                        </svg>
                    </span>
                    <div>
                        <p className="order-status__pickup-label">픽업 시간</p>
                        <p className="order-status__pickup-time">
                            {pickupText} <span className="order-status__pickup-sub">(방문 예정)</span>
                        </p>
                    </div>
                </div>

                {/* 진행 단계 */}
                {!isRejected && (
                    <div className="order-status__progress">
                        <div className="order-status__progress-line">
                            <div className="order-status__progress-fill" style={{ width: `${fillPercent}%` }} />
                        </div>
                        <ol className="order-status__steps">
                            {STEPS.map((label, index) => {
                                let className = "order-status__step";
                                if (index < info.step) className += " is-done";
                                if (index === info.step) className += " is-current";
                                return (
                                    <li key={label} className={className}>
                                        <span className="order-status__step-dot" />
                                        <span className="order-status__step-label">{label}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}

                {/* 상태 안내 문구 */}
                <p className="order-status__message">{info.message}</p>

                {/* 주문 내역 */}
                <div className="order-status__detail">
                    <ul className="order-status__items">
                        {order.items.map((item) => (
                            <li key={item.menuItemId} className="order-status__item">
                                <span>{item.menuName}</span>
                                <span className="order-status__item-qty">{item.quantity}개</span>
                            </li>
                        ))}
                    </ul>
                    <div className="order-status__total">
                        <p className="order-status__total-price">{order.totalPrice.toLocaleString("ko-KR")}원</p>
                        <p className="order-status__total-meta">픽업 예정 : {pickupText}</p>
                        <p className="order-status__total-meta">
                            결제 금액 : {order.totalPrice.toLocaleString("ko-KR")}원
                        </p>
                    </div>
                </div>

                {/* 새로고침 */}
                <div className="order-status__actions">
                    <button
                        type="button"
                        className="order-status__button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? "불러오는 중…" : "실시간 상태 새로고침"}
                    </button>
                    <span className="order-status__hint">5초마다 자동으로 새로고침돼요</span>
                </div>
            </div>
        </div>
    );
}

export default OrderStatusPage;