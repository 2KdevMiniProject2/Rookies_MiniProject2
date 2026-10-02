import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { fetchOrders } from '../../api/orderApi';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/common/Logo';
import './MyPage.css';

function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const authUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [orders, setOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState('');

    const [ownerStores, setOwnerStores] = useState([]);
    const [ownerStoreLoading, setOwnerStoreLoading] = useState(false);
    const [ownerStoreError, setOwnerStoreError] = useState('');

    useEffect(() => {
        if (!authUser?.id) {
            setLoading(false);
            return;
        }

        const fetchPageData = async () => {
            let currentUser = authUser;

            try {
                const response = await apiClient.get(
                    `/api/users/${authUser.id}`
                );

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
                    const result = await fetchOrders({
                        page: 0,
                        size: 10,
                    });

                    setOrders(result.orders);
                } catch (error) {
                    console.error('주문 내역 조회 실패:', error);
                    setOrderError('주문 내역을 불러오지 못했습니다.');
                } finally {
                    setOrderLoading(false);
                }
            }

            if (currentUser.role === 'OWNER') {
                setOwnerStoreLoading(true);
                setOwnerStoreError('');

                try {
                    const response = await apiClient.get(
                        `/api/stores/owner/${currentUser.id}`,
                        {
                            params: {
                                size: 100,
                            },
                        }
                    );

                    const storeList = Array.isArray(response.data)
                        ? response.data
                        : response.data.content || [];

                    setOwnerStores(storeList);
                } catch (error) {
                    console.error('사장님 가게 목록 조회 실패:', error);
                    setOwnerStoreError('가게 목록을 불러오지 못했습니다.');
                } finally {
                    setOwnerStoreLoading(false);
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

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleLogoKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate('/');
        }
    };

    const handleOrderStatusClick = () => {
        if (orderLoading) {
            window.alert('주문 내역을 불러오는 중입니다.');
            return;
        }

        const activeOrder = orders.find((order) =>
            ['PENDING', 'ACCEPTED', 'READY'].includes(order.status)
        );

        const targetOrder = activeOrder || orders[0];

        if (!targetOrder) {
            window.alert('확인할 주문이 없습니다.');
            return;
        }

        navigate(`/orders/${targetOrder.id}`);
    };

    const handleDashboardMenuClick = () => {
        if (ownerStores.length === 1) {
            navigate(`/owner/stores/${ownerStores[0].id}/orders`);
            return;
        }

        document
            .getElementById('owner-dashboard-section')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (
            location.hash !== '#owner-dashboard-section' ||
            user?.role !== 'OWNER' ||
            ownerStoreLoading
        ) {
            return;
        }

        const timer = window.setTimeout(() => {
            handleDashboardMenuClick();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [location.hash, user, ownerStoreLoading, ownerStores]);

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
                    <div
                        className="mypage-logo-link"
                        role="button"
                        tabIndex={0}
                        aria-label="메인 화면으로 이동"
                        onClick={handleLogoClick}
                        onKeyDown={handleLogoKeyDown}
                    >
                        <Logo className="owner-sidebar-logo" />
                    </div>

                    <strong>
                        {user.role === 'OWNER'
                            ? '사장님 마이페이지'
                            : '마이페이지'}
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
                                    onClick={handleDashboardMenuClick}
                                >
                                    주문 대시보드
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
                                    onClick={() => navigate('/mypage')}
                                >
                                    마이페이지
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOrderStatusClick}
                                >
                                    주문 현황
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/cart')}
                                >
                                    장바구니
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
                            <span>{user.name?.charAt(0) || '?'}</span>
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
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`주문 ${order.id} 현황 보기`}
                                            onClick={() => navigate(`/orders/${order.id}`)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    navigate(`/orders/${order.id}`);
                                                }
                                            }}
                                        >
                                            <div className="order-history-top">
                                                <div>
                                                    <span className="order-number">
                                                        주문 #{order.id}
                                                    </span>

                                                    <h3>{getOrderTitle(order)}</h3>
                                                </div>

                                                <span
                                                    className={`mypage-order-status mypage-order-status--${order.status?.toLowerCase()}`}
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
                        <section
                            id="owner-dashboard-section"
                            className="owner-guide-section"
                        >
                            <h2>주문 대시보드</h2>
                            <p>
                                주문을 확인할 가게를 선택하면 해당 가게의 실시간 주문 대시보드로 이동합니다.
                            </p>

                            {ownerStoreLoading ? (
                                <div className="owner-dashboard-message">
                                    가게 목록을 불러오는 중입니다.
                                </div>
                            ) : ownerStoreError ? (
                                <div className="owner-dashboard-message">
                                    {ownerStoreError}
                                </div>
                            ) : ownerStores.length === 0 ? (
                                <div className="owner-dashboard-empty">
                                    <span>등록된 가게가 없습니다.</span>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/stores/register')}
                                    >
                                        가게 등록하기
                                    </button>
                                </div>
                            ) : (
                                <div className="owner-dashboard-store-list">
                                    {ownerStores.map((store) => (
                                        <div
                                            className="owner-dashboard-store-card"
                                            key={store.id}
                                        >
                                            <div>
                                                <strong>{store.name}</strong>
                                                <span>{store.category}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/owner/stores/${store.id}/orders`
                                                    )
                                                }
                                            >
                                                주문 대시보드
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </section>
            </div>
        </main>
    );
}

export default MyPage;
