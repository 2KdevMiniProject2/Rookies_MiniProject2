import './MyPage.css';

function MyPage() {
    // 임시 회원 데이터
    // 나중에 로그인 사용자 API 데이터로 교체
    const user = {
        id: 1,
        name: '김민수',
        email: 'user@example.com',
        phone: '010-0000-0000',
        role: 'USER',
    };

    // 임시 주문 내역
    // 나중에 백엔드 주문 API 데이터로 교체
    const orders = [
        {
            id: 5001,
            storeName: '루키즈 베이커리',
            pickupTime: '2026-09-28 15:30',
            totalPrice: 11000,
            status: 'PENDING',
        },
        {
            id: 5002,
            storeName: '루키즈 카페',
            pickupTime: '2026-09-27 14:00',
            totalPrice: 8000,
            status: 'COMPLETED',
        },
    ];

    const getStatusText = (status) => {
        if (status === 'PENDING') {
            return '접수 대기';
        }

        if (status === 'ACCEPTED') {
            return '준비 중';
        }

        if (status === 'COMPLETED') {
            return '완료';
        }

        return status;
    };

    return (
        <main className="mypage">

            <div className="mypage-layout">

                {/* 왼쪽 메뉴 */}
                <aside className="mypage-sidebar">
                    <strong>마이페이지</strong>

                    <nav>
                        <button type="button">이용내역</button>
                        <button type="button">회원정보</button>
                        <button type="button">로그아웃</button>
                    </nav>
                </aside>

                {/* 오른쪽 내용 */}
                <section className="mypage-main">

                    <div className="mypage-main-title">
                        마이페이지
                    </div>

                    {/* 회원 정보 */}
                    <section className="profile-section">

                        <div className="profile-image">
                            <span>
                                {user.name.charAt(0)}
                            </span>
                        </div>

                        <div className="profile-info">
                            <strong>{user.role}</strong>
                            <p>{user.name}</p>
                            <p>{user.email}</p>
                            <p>{user.phone}</p>
                        </div>

                        <button
                            type="button"
                            className="profile-edit-button"
                        >
                            정보 수정
                        </button>

                    </section>

                    {/* 주문 내역 */}
                    <section className="order-history-section">
                        <div className="section-title">
                            <h2>주문 내역</h2>
                            <span>{orders.length}건</span>
                        </div>

                        <div className="order-history-list">

                            {orders.map((order) => (
                                <article
                                    className="order-history-card"
                                    key={order.id}
                                >

                                    <div className="order-history-top">
                                        <div>
                                            <span className="order-number">
                                                주문 #{order.id}
                                            </span>

                                            <h3>{order.storeName}</h3>
                                        </div>

                                        <span
                                            className={`order-status ${order.status.toLowerCase()}`}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>

                                    <div className="order-history-info">
                                        <p>
                                            <span>픽업 시간</span>
                                            <strong>{order.pickupTime}</strong>
                                        </p>

                                        <p>
                                            <span>총 금액</span>
                                            <strong>
                                                {order.totalPrice.toLocaleString()}원
                                            </strong>
                                        </p>
                                    </div>

                                </article>
                            ))}

                        </div>
                    </section>

                </section>
            </div>
        </main>
    );
}

export default MyPage;