import { useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
    const navigate = useNavigate();

    // 임시 사용자 데이터
    // 나중에 로그인 사용자 정보로 교체
    const user = {
        id: 1,
        name: '김민수',
        email: 'user@example.com',
        phone: '010-0000-0000',
        role: 'OWNER',
    };

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
                <aside className="mypage-sidebar">
                    <strong>
                        {user.role === 'OWNER' ? '사장님 마이페이지' : '마이페이지'}
                    </strong>

                    <nav>
                        {user.role === 'OWNER' ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate('/stores/register')}
                                >
                                    가게 등록/관리
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/owner/stores/1/menus')}
                                >
                                    메뉴 관리
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/owner/stores/1/orders')}
                                >
                                    실시간 주문 확인
                                </button>

                                <button type="button">
                                    회원정보
                                </button>

                                <button type="button">
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button">
                                    이용내역
                                </button>

                                <button type="button">
                                    회원정보
                                </button>

                                <button type="button">
                                    로그아웃
                                </button>
                            </>
                        )}
                    </nav>
                </aside>

                <section className="mypage-main">
                    <div className="mypage-main-title">
                        마이페이지
                    </div>

                    <section className="profile-section">
                        <div className="profile-image">
                            <span>{user.name.charAt(0)}</span>
                        </div>

                        <div className="profile-info">
                            <strong>
                                {user.role === 'OWNER' ? 'OWNER' : 'USER'}
                            </strong>
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

                    {user.role === 'USER' && (
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
                    )}

                    {user.role === 'OWNER' && (
                        <section className="owner-guide-section">
                            <h2>가게 관리</h2>
                            <p>
                                왼쪽 메뉴에서 가게 등록, 메뉴 관리,
                                실시간 주문 확인 기능을 이용할 수 있습니다.
                            </p>
                        </section>
                    )}
                </section>
            </div>
        </main>
    );
}

export default MyPage;