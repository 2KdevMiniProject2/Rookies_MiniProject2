import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { fetchOrders } from '../../api/orderApi';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/common/Logo';
import './MyPage.css';

function MyPage() {
    const navigate = useNavigate();
    const authUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState('');

    useEffect(() => {
        if (!authUser?.id) {
            setLoading(false);
            return;
        }

        const fetchPageData = async () => {
            let currentUser = authUser;

            try {
                const response = await apiClient.get(`/api/users/${authUser.id}`);
                currentUser = response.data;
                setUser(response.data);
            } catch (error) {
                console.error('사용자 조회 실패:', error);
                setUser(authUser);
            }

            if (currentUser.role === 'USER') {
                setOrderLoading(true);
                setOrderError('');

                try {
                    const result = await fetchOrders({ page: 0, size: 10 });
                    setOrders(result.orders);
                } catch (error) {
                    console.error('주문 내역 조회 실패:', error);
                    setOrderError('주문 내역을 불러오지 못했습니다.');
                } finally {
                    setOrderLoading(false);
                }
            }

            setLoading(false);
        };

        fetchPageData();
    }, [authUser]);

    const getStatusText = (status) => {
        if (status === 'PENDING') {
            return '접수 대기';
        }

        if (status === 'ACCEPTED') {
            return '준비 중';
        }

        if (status === 'READY') {
            return '픽업 대기';
        }

        if (status === 'COMPLETED') {
            return '완료';
        }

        if (status === 'REJECTED') {
            return '주문 거절';
        }

        if (status === 'CANCELLED') {
            return '취소';
        }

        return status;
    };

    const getOrderTitle = (order) => {
        if (order.storeName) {
            return order.storeName;
        }

        const firstMenuName = order.items?.[0]?.menuName;

        if (!firstMenuName) {
            return '주문 상품';
        }

        const additionalCount = order.items.length - 1;

        if (additionalCount > 0) {
            return `${firstMenuName} 외 ${additionalCount}개`;
        }

        return firstMenuName;
    };

    const formatPickupTime = (pickupTime) => {
        if (!pickupTime) {
            return '-';
        }

        return pickupTime.replace('T', ' ').slice(0, 16);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <main className="mypage">
                <p>사용자 정보를 불러오는 중입니다.</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="mypage">
                <p>로그인 사용자 정보가 없습니다.</p>
            </main>
        );
    }

    return (
        <main className="mypage">
            <div className="mypage-layout">
                <aside className="mypage-sidebar">
                    <Logo className="owner-sidebar-logo" />

                    <strong>
                        {user.role === 'OWNER' ? '사장님 마이페이지' : '마이페이지'}
                    </strong>

                    <nav>
                        {user.role === 'OWNER' ? (
                            <>
                                <button
                                    type="button"
                                    className="active"
                                    onClick={() => navigate('/mypage')}
                                >
                                    마이페이지
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/stores/register')}
                                >
                                    가게 등록
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/owner/stores')}
                                >
                                    가게별 메뉴 관리
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/mypage/profile')}
                                >
                                    회원정보
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="active"
                                >
                                    마이페이지
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        document
                                            .getElementById('order-history')
                                            ?.scrollIntoView({ behavior: 'smooth' })
                                    }
                                >
                                    이용내역
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/mypage/profile')}
                                >
                                    회원정보
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                >
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
                            onClick={() => navigate('/mypage/profile')}
                        >
                            정보 수정
                        </button>
                    </section>

                    {user.role === 'USER' && (
                        <section
                            id="order-history"
                            className="order-history-section"
                        >
                            <div className="section-title">
                                <h2>주문 내역</h2>
                                <span>{orders.length}건</span>
                            </div>

                            {orderLoading ? (
                                <div className="order-history-message">
                                    주문 내역을 불러오는 중입니다.
                                </div>
                            ) : orderError ? (
                                <div className="order-history-message">
                                    {orderError}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="order-history-message">
                                    주문 내역이 없습니다.
                                </div>
                            ) : (
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

                                                    <h3>{getOrderTitle(order)}</h3>
                                                </div>

                                                <span
                                                    className={`mypage-order-status mypage-order-status--${order.status.toLowerCase()}`}
                                                >
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>

                                            <div className="order-history-info">
                                                <p>
                                                    <span>픽업 시간</span>
                                                    <strong>
                                                        {formatPickupTime(order.pickupTime)}
                                                    </strong>
                                                </p>

                                                <p>
                                                    <span>총 금액</span>
                                                    <strong>
                                                        {(order.totalPrice ?? 0).toLocaleString()}원
                                                    </strong>
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {user.role === 'OWNER' && (
                        <section className="owner-guide-section">
                            <h2>가게 관리</h2>
                            <p>
                                왼쪽 메뉴에서 가게 등록과 메뉴 관리 기능을 이용할 수 있습니다.
                            </p>
                        </section>
                    )}
                </section>
            </div>
        </main>
    );
}

export default MyPage;
