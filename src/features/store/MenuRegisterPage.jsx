import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MenuRegisterPage.css';

function MenuRegisterPage() {
    const navigate = useNavigate();
    const { storeId } = useParams();

    const [menuName, setMenuName] = useState('');
    const [menuPrice, setMenuPrice] = useState('');
    const [menus, setMenus] = useState([]);

    const handleMenuAdd = () => {
        if (!menuName || !menuPrice) {
            return;
        }

        const newMenu = {
            id: Date.now(),
            name: menuName,
            price: Number(menuPrice),
            soldOut: false,
        };

        setMenus((prev) => [...prev, newMenu]);
        setMenuName('');
        setMenuPrice('');
    };

    return (
        <main className="menu-register-page">
            <div className="menu-register-layout">

                {/* 왼쪽 메뉴 */}
                <aside className="menu-register-sidebar">
                    <strong>사장님 마이페이지</strong>

                    <nav>
                        <button
                            type="button"
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
                            className="active"
                            onClick={() => navigate('/owner/stores')}
                        >
                            가게별 메뉴 관리
                        </button>

                        <button type="button">
                            회원정보
                        </button>

                        <button type="button">
                            로그아웃
                        </button>
                    </nav>
                </aside>

                {/* 오른쪽 내용 */}
                <section className="menu-register-main">
                    <div className="menu-register-title">
                        가게별 메뉴 관리
                    </div>

                    <div className="menu-register-content">

                        {/* 현재 가게 */}
                        <section className="current-store-section">
                            <div>
                                <span className="current-store-label">
                                    선택한 가게
                                </span>

                                <h2>
                                    가게 메뉴 관리
                                </h2>

                                <p>
                                    선택한 가게의 메뉴를 등록하고 관리할 수 있습니다.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="store-change-button"
                                onClick={() => navigate('/owner/stores')}
                            >
                                가게 변경
                            </button>
                        </section>

                        {/* 메뉴 추가 */}
                        <section className="menu-section">
                            <h2>새 메뉴 추가</h2>

                            <p className="menu-section-description">
                                가게에서 판매할 메뉴의 이름과 가격을 입력해주세요.
                            </p>

                            <div className="menu-form-group">
                                <label htmlFor="menuName">
                                    메뉴명
                                </label>

                                <input
                                    id="menuName"
                                    type="text"
                                    value={menuName}
                                    onChange={(e) => setMenuName(e.target.value)}
                                    placeholder="메뉴명을 입력해주세요."
                                />
                            </div>

                            <div className="menu-form-group">
                                <label htmlFor="menuPrice">
                                    가격
                                </label>

                                <input
                                    id="menuPrice"
                                    type="number"
                                    value={menuPrice}
                                    onChange={(e) => setMenuPrice(e.target.value)}
                                    placeholder="가격을 입력해주세요."
                                />
                            </div>

                            <div className="menu-register-buttons">
                                <button
                                    type="button"
                                    className="back-button"
                                    onClick={() => navigate('/owner/stores')}
                                >
                                    이전
                                </button>

                                <button
                                    type="button"
                                    className="menu-save-button"
                                    onClick={handleMenuAdd}
                                >
                                    메뉴 등록
                                </button>
                            </div>
                        </section>

                        {/* 등록된 메뉴 */}
                        <section className="menu-section">
                            <div className="menu-list-title">
                                <div>
                                    <h2>등록된 메뉴</h2>
                                    <p>현재 가게에 등록된 메뉴 목록입니다.</p>
                                </div>

                                <span>{menus.length}개</span>
                            </div>

                            {menus.length === 0 ? (
                                <div className="empty-menu">
                                    등록된 메뉴가 없습니다.
                                </div>
                            ) : (
                                <div className="menu-list">
                                    {menus.map((menu) => (
                                        <div
                                            className="menu-item"
                                            key={menu.id}
                                        >
                                            <div>
                                                <strong>{menu.name}</strong>
                                                <p>
                                                    {menu.price.toLocaleString()}원
                                                </p>
                                            </div>

                                            <span className="menu-status">
                                                {menu.soldOut ? '품절' : '판매중'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                </section>

            </div>
        </main>
    );
}

export default MenuRegisterPage;