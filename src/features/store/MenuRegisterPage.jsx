import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuRegisterPage.css';

function MenuRegisterPage() {
    const navigate = useNavigate();

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
                <aside className="menu-register-sidebar">
                    <strong>마이페이지</strong>

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
                        >
                            메뉴 관리
                        </button>

                        <button type="button">
                            실시간 주문 확인
                        </button>

                        <button type="button">
                            로그아웃
                        </button>
                    </nav>
                </aside>

                <section className="menu-register-main">
                    <div className="menu-register-title">
                        메뉴 관리
                    </div>

                    <div className="menu-register-content">
                        <section className="menu-section">
                            <h2>새 메뉴 추가</h2>

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
                                    onClick={() => navigate('/stores/register')}
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

                        <section className="menu-section">
                            <div className="menu-list-title">
                                <h2>등록된 메뉴</h2>
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
                                                <p>{menu.price.toLocaleString()}원</p>
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