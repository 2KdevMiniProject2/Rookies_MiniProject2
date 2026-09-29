import { useNavigate } from 'react-router-dom';
import './StoreListPage.css';

function StoreListPage() {
    const navigate = useNavigate();

    const stores = [
        {
            id: 1,
            name: '루키즈 베이커리',
            category: '베이커리',
            address: '서울시 강남구 테헤란로 123 1층',
        },
        {
            id: 2,
            name: '루키즈 로스터리 카페',
            category: '카페',
            address: '서울시 서초구 서초대로 45 2층',
        },
    ];

    return (
        <main className="store-list-page">
            <div className="store-list-layout">
                <aside className="store-list-sidebar">
                    <strong>사장님 마이페이지</strong>

                    <nav>
                        <button type="button" onClick={() => navigate('/mypage')}>마이페이지</button>
                        <button type="button" onClick={() => navigate('/stores/register')}>가게 등록</button>
                        <button type="button" className="active">가게별 메뉴 관리</button>
                        <button type="button">회원정보</button>
                        <button type="button">로그아웃</button>
                    </nav>
                </aside>

                <section className="store-list-main">
                    <div className="store-list-title">가게별 메뉴 관리</div>

                    <div className="store-list-content">
                        <section className="store-list-section">
                            <div className="store-list-heading">
                                <div>
                                    <h2>내 가게</h2>
                                    <p>메뉴를 관리할 가게를 선택해주세요.</p>
                                </div>

                                <button type="button" className="store-add-button" onClick={() => navigate('/stores/register')}>
                                    가게 등록
                                </button>
                            </div>

                            <div className="store-card-list">
                                {stores.map((store) => (
                                    <article className="store-card" key={store.id}>
                                        <div className="store-card-info">
                                            <span className="store-category">{store.category}</span>
                                            <h3>{store.name}</h3>
                                            <p>{store.address}</p>
                                        </div>

                                        <button
                                            type="button"
                                            className="store-menu-button"
                                            onClick={() => navigate(`/owner/stores/${store.id}/menus`)}
                                        >
                                            메뉴 관리
                                        </button>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default StoreListPage;