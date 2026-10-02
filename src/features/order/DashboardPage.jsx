import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useDashboardStore } from "../../store/dashboardStore";
import { getStore } from "../../api/dashboardApi"; 

import "./DashboardPage.css";

//const STORE_ID = 1; // 루키즈 베이커리 (더미). 나중에 로그인한 사장님의 storeId로 교체
const REFRESH_MS = 5000;

// 상태별 표시 문구와 다음 단계 (백엔드 OrderStatus 기준)
// PENDING → ACCEPTED → READY(조리 완료·손님 호출) → COMPLETED(손님이 가져감) (한 단계씩)
// PENDING → REJECTED (접수 대기에서만 거절)
const STATUS = {
  PENDING: { label: "접수 대기", next: "ACCEPTED", action: "주문 수락", canReject: true },
  ACCEPTED: { label: "조리 중", next: "READY", action: "조리 완료 (손님 호출)" },
  READY: { label: "픽업 대기", next: "COMPLETED", action: "픽업 완료" },
  COMPLETED: { label: "픽업 완료" },
  REJECTED: { label: "거절됨" },
};

const won = (amount) => `${amount.toLocaleString()}원`;
const hhmm = (dateTime) => dateTime.slice(11, 16); // "2026-09-28T15:30:00" → "15:30"

export default function DashboardPage() {
  // 주소 /owner/stores/3/orders → storeId 3 (주소 값은 글자라서 숫자로 바꿈)
  const params = useParams();
  const storeId = Number(params.storeId);

  // 가게 정보 (가게 이름) — 이 화면에서만 쓰는 값이라 useState
  const [store, setStore] = useState(null);

  useEffect(() => {
    // useEffect 에는 async 를 바로 못 붙여서, 안에 async 함수를 만들어 부른다
    const loadStore = async () => {
      try {
        const storeInfo = await getStore(storeId);
        setStore(storeInfo);
      } catch (error) {
        console.error("가게 정보 불러오기 실패:", error);
        setStore(null);
      }
    };
    loadStore();
  }, [storeId]);

  const orders = useDashboardStore((state) => state.orders);
  const sales = useDashboardStore((state) => state.sales);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);
  const changeStatus = useDashboardStore((state) => state.changeStatus);

  const [showDone, setShowDone] = useState(false);

  // 처음 불러오고, 5초마다 다시 불러오기 (가게 바뀌면 다시 시작.)
  useEffect(() => {
    fetchDashboard(storeId);
    const timer = setInterval(() => fetchDashboard(storeId), REFRESH_MS);
    return () => clearInterval(timer);
  }, [fetchDashboard, storeId]);

  const handleChange = (orderId, nextStatus) => {
    changeStatus(storeId, orderId, nextStatus);
  };

  // 수동 새로고침: 5초를 기다리지 않고 바로 다시 불러오기
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard(storeId);
    setRefreshing(false);
  };

  const pending = orders.filter((order) => order.status === "PENDING");
  const cooking = orders.filter((order) => order.status === "ACCEPTED");
  const ready = orders.filter((order) => order.status === "READY");
  const done = orders.filter((order) => order.status === "COMPLETED" || order.status === "REJECTED");

  return (
    <div className="dashboard">
      <header className="dashboard__head">
        <h1 className="dashboard__title">{store?.name ?? `${storeId}번 가게`} 사장님 페이지</h1>
        {/* 사장님 메뉴 탭: 매장 정보 수정(파트 A), 메뉴 관리(파트 B) 주소는 각 파트와 맞출 것 */}
        <nav className="dashboard__tabs">
          <NavLink to={`/owner/stores/${storeId}/orders`} className="dashboard__tab">주문 대시보드</NavLink>
          <NavLink to={`/owner/stores/${storeId}/edit`} className="dashboard__tab">매장 정보 수정</NavLink>
          <NavLink to={`/owner/stores/${storeId}/menus`} className="dashboard__tab">메뉴 관리</NavLink>
        </nav>
      </header>

      {/* 오늘의 영업 요약 */}
      <section>
        <h2 className="dashboard__section-title">오늘의 영업 요약</h2>
        <div className="summary">
          <div className="summary__item">
            <p className="summary__label">오늘 픽업 완료된 주문</p>
            <p className="summary__value">{sales.orderCount}건</p>
          </div>
          <div className="summary__item">
            <p className="summary__label">오늘 총 매출</p>
            <p className="summary__value">{won(sales.totalSales)}</p>
          </div>
        </div>
      </section>

      {/* 실시간 주문 접수 현황 */}
      <section>
        <div className="dashboard__row">
          <h2 className="dashboard__section-title">실시간 주문 접수 현황</h2>
          <div className="dashboard__refresh">
            <span className="dashboard__hint">5초마다 자동 갱신</span>
            <button
              type="button"
              className="dashboard__refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "불러오는 중…" : "↻ 새로고침"}
            </button>
          </div>
        </div>

        {error && <p className="dashboard__error">{error}</p>}

        {loading ? (
          <p className="dashboard__empty">주문을 불러오는 중…</p>
        ) : (
          <div className="board">
            <OrderColumn title="접수 대기" orders={pending} onChange={handleChange} />
            <OrderColumn title="조리 중" orders={cooking} onChange={handleChange} />
            <OrderColumn title="픽업 대기" orders={ready} onChange={handleChange} />
          </div>
        )}
      </section>

      {/* 픽업 완료·거절된 주문 (접었다 펴기) */}
      <section className="done">
        <button type="button" className="done__toggle" onClick={() => setShowDone((prev) => !prev)}>
          픽업 완료·거절된 주문 {done.length}건 {showDone ? "▴" : "▾"}
        </button>
        {showDone && (
          <div className="done__list">
            {done.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OrderColumn({ title, orders, onChange }) {
  return (
    <div className="board__col">
      <h3 className="board__col-title">
        {title} <span className="board__count">{orders.length}</span>
      </h3>
      {orders.length === 0 ? (
        <p className="dashboard__empty">주문이 없어요</p>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} onChange={onChange} />)
      )}
    </div>
  );
}

function OrderCard({ order, onChange }) {
  const status = STATUS[order.status];

  return (
    <article className="order">
      <div className="order__head">
        <StatusBadge status={order.status} />
        <span className="order__no">#{order.id}</span>
      </div>

      <ul className="order__info">
        <li className="order__customer">{order.customerName}</li>
        <li>픽업 요청 {hhmm(order.pickupTime)}</li>
        {order.items.map((item) => (
          <li key={item.menuItemId}>
            {item.menuName} × {item.quantity}
          </li>
        ))}
        {order.requestNotes && (
          <li className="order__notes">요청 · {order.requestNotes}</li>
        )}
        <li className="order__price">{won(order.totalPrice)}</li>
      </ul>

      {status.next && onChange && (
        <div className="order__actions">
          <button
            type="button"
            className={"order__btn" + (order.status === "PENDING" ? " order__btn--primary" : "")}
            onClick={() => onChange(order.id, status.next)}
          >
            {status.action}
          </button>

          {status.canReject && (
            <button
              type="button"
              className="order__btn order__btn--reject"
              onClick={() => {
                // 실수로 누르는 것 방지: 한 번 더 확인
                if (window.confirm(`#${order.id} 주문을 거절할까요? 되돌릴 수 없어요.`)) {
                  onChange(order.id, "REJECTED");
                }
              }}
            >
              주문 거절
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{STATUS[status].label}</span>;
}