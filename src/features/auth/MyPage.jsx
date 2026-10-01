import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import Logo from '../../components/common/Logo';
import './MyPage.css';

function MyPage() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiClient.get('/api/users/7');
                setUser(response.data);
            } catch (error) {
                console.error('사용자 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

                                <button type="button">
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